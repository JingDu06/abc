import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/database";

export async function getCart(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const items = await prisma.chiTietGioHang.findMany({
      where: { ma_kh },
      include: {
        san_pham: true,
      },
    });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function addToCart(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const { ma_sp, so_luong } = req.body;

    if (!ma_sp || !so_luong) {
      return res.status(400).json({ error: "Mã sản phẩm và số lượng là bắt buộc." });
    }

    const qty = Number(so_luong);
    if (qty <= 0) {
      return res.status(400).json({ error: "Số lượng phải lớn hơn 0." });
    }

    // Verify product exists and is active
    const product = await prisma.sanPham.findUnique({ where: { ma_sp } });
    if (!product || product.trang_thai === "Ngung ban") {
      return res.status(400).json({ error: "Sản phẩm không khả dụng hoặc đã ngừng bán." });
    }

    // Upsert cart item
    const item = await prisma.chiTietGioHang.upsert({
      where: {
        ma_kh_ma_sp: {
          ma_kh: ma_kh!,
          ma_sp,
        },
      },
      update: {
        so_luong: { increment: qty },
      },
      create: {
        ma_kh: ma_kh!,
        ma_sp,
        so_luong: qty,
      },
    });

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCartQty(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const { ma_sp } = req.params;
    const { so_luong } = req.body;

    if (so_luong === undefined) {
      return res.status(400).json({ error: "Số lượng là bắt buộc." });
    }

    const qty = Number(so_luong);

    if (qty <= 0) {
      // Remove if qty is 0 or negative
      await prisma.chiTietGioHang.delete({
        where: {
          ma_kh_ma_sp: {
            ma_kh: ma_kh!,
            ma_sp,
          },
        },
      });
      return res.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng." });
    }

    const updated = await prisma.chiTietGioHang.update({
      where: {
        ma_kh_ma_sp: {
          ma_kh: ma_kh!,
          ma_sp,
        },
      },
      data: {
        so_luong: qty,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeFromCart(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const { ma_sp } = req.params;

    await prisma.chiTietGioHang.delete({
      where: {
        ma_kh_ma_sp: {
          ma_kh: ma_kh!,
          ma_sp,
        },
      },
    });

    res.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
