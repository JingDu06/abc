import { Request, Response } from "express";
import prisma from "../config/database";

export async function getProducts(req: Request, res: Response) {
  try {
    const { category, search } = req.query;

    const where: any = {};

    if (category) {
      where.trang_thai = "Dang ban";
      where.mo_ta = { contains: category as string, mode: "insensitive" }; // or other field mapping
    }

    if (search) {
      where.ten_sp = { contains: search as string, mode: "insensitive" };
    }

    const products = await prisma.sanPham.findMany({
      where,
    });

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { ten_sp, mo_ta, gia_ban, so_luong_ton } = req.body;

    if (!ten_sp || gia_ban === undefined) {
      return res.status(400).json({ error: "Tên sản phẩm và giá bán là bắt buộc." });
    }

    const price = Number(gia_ban);
    if (price < 0) {
      return res.status(400).json({ error: "Giá bán không thể nhỏ hơn 0." });
    }

    const qty = so_luong_ton ? Number(so_luong_ton) : 0;
    if (qty < 0) {
      return res.status(400).json({ error: "Số lượng tồn không thể nhỏ hơn 0." });
    }

    // Generate custom ma_sp (e.g. SP000001)
    const count = await prisma.sanPham.count();
    const ma_sp = "SP" + String(count + 1).padStart(6, "0");

    const product = await prisma.sanPham.create({
      data: {
        ma_sp,
        ten_sp,
        mo_ta,
        gia_ban: price,
        so_luong_ton: qty,
        trang_thai: "Dang ban",
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { ten_sp, mo_ta, gia_ban, so_luong_ton, trang_thai } = req.body;

    const data: any = {};
    if (ten_sp !== undefined) data.ten_sp = ten_sp;
    if (mo_ta !== undefined) data.mo_ta = mo_ta;
    if (gia_ban !== undefined) {
      const price = Number(gia_ban);
      if (price < 0) return res.status(400).json({ error: "Giá bán không thể nhỏ hơn 0." });
      data.gia_ban = price;
    }
    if (so_luong_ton !== undefined) {
      const qty = Number(so_luong_ton);
      if (qty < 0) return res.status(400).json({ error: "Số lượng tồn không thể nhỏ hơn 0." });
      data.so_luong_ton = qty;
    }
    if (trang_thai !== undefined) {
      if (!["Dang ban", "Ngung ban"].includes(trang_thai)) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ." });
      }
      data.trang_thai = trang_thai;
    }

    const updated = await prisma.sanPham.update({
      where: { ma_sp: id },
      data,
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if product exists in any transaction (orders)
    const transactionCount = await prisma.chiTietDonHang.count({
      where: { ma_sp: id },
    });

    if (transactionCount > 0) {
      // Prohibit physical delete. Enforce soft delete.
      const updated = await prisma.sanPham.update({
        where: { ma_sp: id },
        data: { trang_thai: "Ngung ban" },
      });
      return res.json({
        message: "Sản phẩm đã phát sinh giao dịch. Đã chuyển trạng thái sang 'Ngung ban' thay vì xóa vật lý.",
        product: updated,
      });
    }

    // Physical delete if no transaction references
    await prisma.sanPham.delete({
      where: { ma_sp: id },
    });

    res.json({ message: "Xóa sản phẩm thành công." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
