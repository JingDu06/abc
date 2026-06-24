import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/database";

import { DatLich, DonHang } from "@prisma/client";

export async function getPending(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;

    const pendingSpa = await prisma.datLich.findMany({
      where: {
        ma_kh,
        trang_thai: "Cho thanh toan",
      },
      include: {
        dich_vu: true,
        thu_cung: true,
      },
    });

    const pendingOrders = await prisma.donHang.findMany({
      where: {
        ma_kh,
        trang_thai: "Cho thanh toan",
      },
      include: {
        chi_tiet_don_hang: {
          include: {
            san_pham: true,
          },
        },
      },
    });

    res.json({
      spa: pendingSpa,
      orders: pendingOrders,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function payMerged(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const {
      spaIds,    // array of ma_dat_lich
      orderIds,  // array of ma_don_hang
      ma_pttt,   // payment method ID
    } = req.body;

    const staffId = req.user?.role !== "customer" ? req.user?.id : null;

    if ((!spaIds || spaIds.length === 0) && (!orderIds || orderIds.length === 0)) {
      return res.status(400).json({ error: "Vui lòng chọn ít nhất một lịch spa hoặc đơn hàng để thanh toán." });
    }

    if (!ma_pttt) {
      return res.status(400).json({ error: "Vui lòng chọn phương thức thanh toán." });
    }

    // 1. Verify Payment Method
    const pttt = await prisma.phuongThucThanhToan.findUnique({ where: { ma_pttt } });
    if (!pttt) {
      return res.status(400).json({ error: "Phương thức thanh toán không hợp lệ." });
    }

    let tongTien = 0;
    const resolvedSpa: DatLich[] = [];
    const resolvedOrders: DonHang[] = [];

    // 2. Fetch and validate bookings
    if (spaIds && spaIds.length > 0) {
      for (const id of spaIds) {
        const booking = await prisma.datLich.findUnique({ where: { ma_dat_lich: id } });
        if (!booking) {
          return res.status(404).json({ error: `Không tìm thấy lịch spa ${id}.` });
        }
        if (booking.trang_thai !== "Cho thanh toan") {
          return res.status(400).json({ error: `Lịch spa ${id} không ở trạng thái Chờ thanh toán.` });
        }
        if (booking.ma_kh !== ma_kh && req.user?.role === "customer") {
          return res.status(403).json({ error: "Bạn không có quyền thanh toán lịch spa này." });
        }

        // Voucher cash constraint check
        if (pttt.ten_pttt === "Tien mat" && booking.ma_voucher) {
          return res.status(400).json({
            error: `Lịch đặt ${id} có áp dụng voucher. Theo quy định, voucher chỉ khả dụng khi thanh toán trực tuyến. Vui lòng chọn phương thức thanh toán khác hoặc liên hệ nhân viên.`,
          });
        }

        resolvedSpa.push(booking);
        tongTien += Number(booking.thanh_tien);
      }
    }

    // 3. Fetch and validate orders
    if (orderIds && orderIds.length > 0) {
      for (const id of orderIds) {
        const order = await prisma.donHang.findUnique({ where: { ma_don_hang: id } });
        if (!order) {
          return res.status(404).json({ error: `Không tìm thấy đơn hàng ${id}.` });
        }
        if (order.trang_thai !== "Cho thanh toan") {
          return res.status(400).json({ error: `Đơn hàng ${id} không ở trạng thái Chờ thanh toán.` });
        }
        if (order.ma_kh !== ma_kh && req.user?.role === "customer") {
          return res.status(403).json({ error: "Bạn không có quyền thanh toán đơn hàng này." });
        }

        // Voucher cash constraint check
        if (pttt.ten_pttt === "Tien mat" && order.ma_voucher) {
          return res.status(400).json({
            error: `Đơn hàng ${id} có áp dụng voucher. Theo quy định, voucher chỉ khả dụng khi thanh toán trực tuyến. Vui lòng chọn phương thức thanh toán khác hoặc liên hệ nhân viên.`,
          });
        }

        resolvedOrders.push(order);
        tongTien += Number(order.thanh_tien);
      }
    }

    // 4. Perform Transactional update
    const result = await prisma.$transaction(async (tx) => {
      // Create Invoice
      const count = await tx.hoaDon.count();
      const ma_hoa_don = "HD" + String(count + 1).padStart(6, "0");

      const invoice = await tx.hoaDon.create({
        data: {
          ma_hoa_don,
          ma_kh: ma_kh || resolvedSpa[0]?.ma_kh || resolvedOrders[0]?.ma_kh!,
          ma_nv_thu_ngan: staffId,
          ma_pttt: ma_pttt,
          tong_tien: tongTien,
          ngay_thanh_toan: new Date(), // Set payment timestamp instantly
        },
      });

      // Update Bookings
      for (const b of resolvedSpa) {
        await tx.datLich.update({
          where: { ma_dat_lich: b.ma_dat_lich },
          data: {
            trang_thai: "Da thanh toan",
            ma_hoa_don: ma_hoa_don,
          },
        });
      }

      // Update Orders
      for (const o of resolvedOrders) {
        await tx.donHang.update({
          where: { ma_don_hang: o.ma_don_hang },
          data: {
            trang_thai: "Da thanh toan",
            ma_hoa_don: ma_hoa_don,
          },
        });
      }

      return invoice;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
