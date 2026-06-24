import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/database";

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const {
      items, // array of { ma_sp, so_luong }
      ma_pt_giao,
      ma_dat_lich,
      ma_voucher,
      ten_nguoi_nhan,
      sdt_nguoi_nhan,
      dia_chi_nhan,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !ma_pt_giao || !ten_nguoi_nhan || !sdt_nguoi_nhan || !dia_chi_nhan) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin đơn hàng." });
    }

    // 1. Resolve Products & Prices, and validate stock
    const resolvedItems: Array<{ ma_sp: string; so_luong: number; gia_ban: number; product: any }> = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await prisma.sanPham.findUnique({ where: { ma_sp: item.ma_sp } });
      if (!product || product.trang_thai === "Ngung ban") {
        return res.status(400).json({ error: `Sản phẩm ${item.ma_sp} không khả dụng.` });
      }

      const qty = Number(item.so_luong);
      if (qty > product.so_luong_ton) {
        return res.status(400).json({
          error: `Số lượng đặt mua cho sản phẩm ${product.ten_sp} vượt quá tồn kho hiện tại (Tồn: ${product.so_luong_ton}).`,
        });
      }

      const price = Number(product.gia_ban);
      resolvedItems.push({
        ma_sp: product.ma_sp,
        so_luong: qty,
        gia_ban: price,
        product,
      });

      subtotal += price * qty;
    }

    // 2. Shipping Fee
    let phiVanChuyen = 25000; // Standard shipping
    const deliveryMethod = await prisma.phuongThucGiaoHang.findUnique({ where: { ma_pt_giao } });
    
    if (deliveryMethod?.ten_pt_giao === "Giao kem lich spa" || ma_dat_lich) {
      phiVanChuyen = 0; // Forced to 0 as per business rules
    }

    let rawTotal = subtotal + phiVanChuyen;
    let discount = 0;

    // 3. Voucher Check
    if (ma_voucher) {
      const walletVoucher = await prisma.viVoucher.findUnique({
        where: {
          ma_kh_ma_voucher: {
            ma_kh: ma_kh!,
            ma_voucher,
          },
        },
        include: {
          voucher: true,
        },
      });

      if (!walletVoucher || walletVoucher.so_luot_con <= 0) {
        return res.status(400).json({ error: "Voucher không khả dụng hoặc đã hết lượt dùng." });
      }

      const v = walletVoucher.voucher;
      if (new Date(v.han_su_dung) < new Date()) {
        return res.status(400).json({ error: "Voucher đã hết hạn." });
      }

      if (rawTotal < Number(v.don_toi_thieu)) {
        return res.status(400).json({ error: `Đơn hàng chưa đạt giá trị tối thiểu ${v.don_toi_thieu}đ để dùng voucher.` });
      }

      if (v.loai_giam === "Phan tram") {
        discount = Math.round(rawTotal * (Number(v.gia_tri_giam) / 100));
        if (v.muc_giam_toi_da && discount > Number(v.muc_giam_toi_da)) {
          discount = Number(v.muc_giam_toi_da);
        }
      } else {
        discount = Number(v.gia_tri_giam);
      }

      if (discount > rawTotal) discount = rawTotal;

      // Lock voucher count instantly
      await prisma.viVoucher.update({
        where: {
          ma_kh_ma_voucher: {
            ma_kh: ma_kh!,
            ma_voucher,
          },
        },
        data: {
          so_luot_con: { decrement: 1 },
        },
      });
    }

    const finalTotal = rawTotal - discount;

    // 4. Create Order & Details in a Transaction
    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.donHang.count();
      const ma_don_hang = "DH" + String(count + 1).padStart(6, "0");

      const order = await tx.donHang.create({
        data: {
          ma_don_hang,
          ma_kh: ma_kh!,
          ma_pt_giao,
          ma_dat_lich: ma_dat_lich || null,
          ma_voucher: ma_voucher || null,
          ten_nguoi_nhan,
          sdt_nguoi_nhan,
          dia_chi_nhan,
          phi_van_chuyen: phiVanChuyen,
          thanh_tien: finalTotal,
          trang_thai: "Cho xu ly",
        },
      });

      for (const item of resolvedItems) {
        await tx.chiTietDonHang.create({
          data: {
            ma_don_hang,
            ma_sp: item.ma_sp,
            so_luong: item.so_luong,
            gia_ban: item.gia_ban, // Static snapshot price
          },
        });
      }

      // Clear matching items in cart
      const itemProductIds = resolvedItems.map(ri => ri.ma_sp);
      await tx.chiTietGioHang.deleteMany({
        where: {
          ma_kh: ma_kh!,
          ma_sp: { in: itemProductIds },
        },
      });

      return order;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    if (!trang_thai) {
      return res.status(400).json({ error: "Trạng thái mới là bắt buộc." });
    }

    const order = await prisma.donHang.findUnique({
      where: { ma_don_hang: id },
      include: { chi_tiet_don_hang: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    // Lock on final states
    if (["Da hoan thanh", "Da huy"].includes(order.trang_thai)) {
      return res.status(400).json({ error: "Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy." });
    }

    // Forward status validation
    const statusProgression: Record<string, string[]> = {
      "Cho xu ly": ["Dang giao", "Da huy", "Cho thanh toan"],
      "Dang giao": ["Cho thanh toan", "Da hoan thanh", "Da huy"],
      "Cho thanh toan": ["Da thanh toan", "Da huy"],
    };

    const allowedNext = statusProgression[order.trang_thai] || [];
    if (!allowedNext.includes(trang_thai)) {
      return res.status(400).json({
        error: `Không thể chuyển trạng thái đơn hàng từ '${order.trang_thai}' sang '${trang_thai}'.`,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // If transitioning to 'Dang giao' (Shipped), deduct inventory
      if (trang_thai === "Dang giao" && order.trang_thai !== "Dang giao") {
        for (const detail of order.chi_tiet_don_hang) {
          const product = await tx.sanPham.findUnique({ where: { ma_sp: detail.ma_sp } });
          if (!product || product.so_luong_ton < detail.so_luong) {
            throw new Error(`Sản phẩm ${detail.ma_sp} không đủ số lượng tồn để giao hàng.`);
          }

          await tx.sanPham.update({
            where: { ma_sp: detail.ma_sp },
            data: {
              so_luong_ton: { decrement: detail.so_luong },
            },
          });
        }
      }

      const updated = await tx.donHang.update({
        where: { ma_don_hang: id },
        data: { trang_thai },
      });

      return updated;
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function cancelOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { ly_do_huy } = req.body;

    if (!ly_do_huy) {
      return res.status(400).json({ error: "Vui lòng nhập lý do hủy đơn." });
    }

    const order = await prisma.donHang.findUnique({
      where: { ma_don_hang: id },
      include: { chi_tiet_don_hang: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    if (["Da hoan thanh", "Da huy", "Da thanh toan"].includes(order.trang_thai)) {
      return res.status(400).json({ error: "Không thể hủy đơn hàng ở trạng thái hiện tại." });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update order status to Da huy
      const updated = await tx.donHang.update({
        where: { ma_don_hang: id },
        data: {
          trang_thai: "Da huy",
          ly_do_huy,
        },
      });

      // 2. Restore stock IF inventory was already deducted (which happens in 'Dang giao' state)
      if (order.trang_thai === "Dang giao") {
        for (const detail of order.chi_tiet_don_hang) {
          await tx.sanPham.update({
            where: { ma_sp: detail.ma_sp },
            data: {
              so_luong_ton: { increment: detail.so_luong },
            },
          });
        }
      }

      // 3. Restore voucher usage if used
      if (order.ma_voucher) {
        await tx.viVoucher.update({
          where: {
            ma_kh_ma_voucher: {
              ma_kh: order.ma_kh,
              ma_voucher: order.ma_voucher,
            },
          },
          data: {
            so_luot_con: { increment: 1 },
          },
        });
      }

      return updated;
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const role = req.user?.role;

    const where: any = {};
    if (role === "customer") {
      where.ma_kh = ma_kh;
    }

    const orders = await prisma.donHang.findMany({
      where,
      include: {
        chi_tiet_don_hang: {
          include: {
            san_pham: true,
          },
        },
      },
      orderBy: {
        ma_don_hang: "desc",
      },
    });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

