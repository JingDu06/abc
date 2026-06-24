import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/database";

export async function getServices(req: AuthenticatedRequest, res: Response) {
  try {
    const services = await prisma.dichVu.findMany({
      where: { trang_thai: "Dang cung cap" },
    });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const {
      ma_thu_cung,
      ma_dich_vu,
      ngay_hen, // YYYY-MM-DD
      gio_hen,  // HH:MM:SS
      hinh_thuc_dua_don,
      dia_chi_dua_don,
      ma_voucher,
    } = req.body;

    if (!ma_thu_cung || !ma_dich_vu || !ngay_hen || !gio_hen || !hinh_thuc_dua_don) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin cuộc hẹn." });
    }

    // 1. Check Date is >= today
    const now = new Date();
    const currentDateOnly = new Date(now.toISOString().split("T")[0]);
    const bookingDate = new Date(ngay_hen);

    if (bookingDate < currentDateOnly) {
      return res.status(400).json({ error: "Ngày hẹn phải lớn hơn hoặc bằng ngày hiện tại." });
    }

    // 2. Resolve Service Price
    const service = await prisma.dichVu.findUnique({ where: { ma_dich_vu } });
    if (!service || service.trang_thai === "Ngung cung cap") {
      return res.status(400).json({ error: "Dịch vụ không khả dụng." });
    }

    const priceChot = Number(service.gia_tien);
    let phiDuaDon = 0;

    if (hinh_thuc_dua_don === "Shop dua don") {
      if (!dia_chi_dua_don) {
        return res.status(400).json({ error: "Thiếu địa chỉ đón trả thú cưng." });
      }
      phiDuaDon = 30000; // Mock delivery fee
    } else if (hinh_thuc_dua_don !== "Tu dua don") {
      return res.status(400).json({ error: "Hình thức đưa đón không hợp lệ." });
    }

    let rawTotal = priceChot + phiDuaDon;
    let discount = 0;

    // 3. Handle Voucher
    if (ma_voucher) {
      // Find in wallet
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
        return res.status(400).json({ error: "Mã giảm giá không khả dụng hoặc đã hết lượt dùng." });
      }

      const v = walletVoucher.voucher;
      // Check expiration
      if (new Date(v.han_su_dung) < now) {
        return res.status(400).json({ error: "Voucher đã hết hạn sử dụng." });
      }

      // Check min order
      if (rawTotal < Number(v.don_toi_thieu)) {
        return res.status(400).json({ error: `Giá trị đặt lịch chưa đạt tối thiểu ${v.don_toi_thieu}đ để áp dụng voucher.` });
      }

      // Calculate discount
      if (v.loai_giam === "Phan tram") {
        discount = Math.round(rawTotal * (Number(v.gia_tri_giam) / 100));
        if (v.muc_giam_toi_da && discount > Number(v.muc_giam_toi_da)) {
          discount = Number(v.muc_giam_toi_da);
        }
      } else {
        discount = Number(v.gia_tri_giam);
      }

      if (discount > rawTotal) discount = rawTotal;

      // Deduct voucher immediately in wallet
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

    // 4. Create Booking
    const count = await prisma.datLich.count();
    const ma_dat_lich = "DL" + String(count + 1).padStart(6, "0");

    // Convert time string to standard Date object for Time type in postgres
    const dummyDate = new Date(`1970-01-01T${gio_hen}Z`);

    const booking = await prisma.datLich.create({
      data: {
        ma_dat_lich,
        ma_kh: ma_kh!,
        ma_thu_cung,
        ma_dich_vu,
        ma_voucher: ma_voucher || null,
        ngay_hen: bookingDate,
        gio_hen: dummyDate,
        hinh_thuc_dua_don,
        dia_chi_dua_don,
        phi_dua_don: phiDuaDon,
        gia_dich_vu_chot: priceChot,
        thanh_tien: finalTotal,
        trang_thai: "Cho xac nhan",
      },
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function approveBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const staffId = req.user?.id;

    const booking = await prisma.datLich.findUnique({ where: { ma_dat_lich: id } });
    if (!booking) {
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    }

    if (booking.trang_thai !== "Cho xac nhan") {
      return res.status(400).json({ error: "Lịch hẹn đã được xử lý từ trước." });
    }

    const updated = await prisma.datLich.update({
      where: { ma_dat_lich: id },
      data: {
        trang_thai: "Da xac nhan",
        ma_nv_phu_trach: staffId, // Assigned to staff who approved it
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function cancelBooking(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { ly_do_huy } = req.body;

    if (!ly_do_huy) {
      return res.status(400).json({ error: "Vui lòng nhập lý do hủy." });
    }

    const booking = await prisma.datLich.findUnique({ where: { ma_dat_lich: id } });
    if (!booking) {
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn." });
    }

    // Locked status check (forward-only, finalized check)
    if (["Da hoan thanh", "Da huy", "Da thanh toan"].includes(booking.trang_thai)) {
      return res.status(400).json({ error: "Không thể hủy lịch hẹn ở trạng thái hiện tại." });
    }

    // Single db Transaction to cancel and restore voucher if any
    const result = await prisma.$transaction(async (tx) => {
      // 1. Set to 'Da huy' and clear staff assignment
      const updated = await tx.datLich.update({
        where: { ma_dat_lich: id },
        data: {
          trang_thai: "Da huy",
          ly_do_huy,
          ma_nv_phu_trach: null, // Free staff
        },
      });

      // 2. Restore voucher if one was applied
      if (booking.ma_voucher) {
        await tx.viVoucher.update({
          where: {
            ma_kh_ma_voucher: {
              ma_kh: booking.ma_kh,
              ma_voucher: booking.ma_voucher,
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

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const role = req.user?.role;

    const where: any = {};
    if (role === "customer") {
      where.ma_kh = ma_kh;
    }

    const bookings = await prisma.datLich.findMany({
      where,
      include: {
        dich_vu: true,
        thu_cung: true,
      },
      orderBy: {
        ma_dat_lich: "desc",
      },
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

