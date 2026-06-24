import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/database";

export async function getPets(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const pets = await prisma.thuCung.findMany({
      where: { ma_kh },
    });
    res.json(pets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function addPet(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const { ten_thu_cung, loai, giong, tuoi, can_nang, ghi_chu } = req.body;

    if (!ten_thu_cung || !loai || !can_nang) {
      return res.status(400).json({ error: "Thiếu thông tin tên, chủng loại hoặc cân nặng." });
    }

    const weight = Number(can_nang);
    if (isNaN(weight) || weight <= 0) {
      return res.status(400).json({ error: "Cân nặng phải lớn hơn 0." });
    }

    const age = tuoi ? Number(tuoi) : null;
    if (age !== null && (isNaN(age) || age < 0)) {
      return res.status(400).json({ error: "Tuổi không hợp lệ (phải >= 0)." });
    }

    // Generate custom ma_thu_cung (e.g. TC000001)
    const count = await prisma.thuCung.count();
    const ma_thu_cung = "TC" + String(count + 1).padStart(6, "0");

    const pet = await prisma.thuCung.create({
      data: {
        ma_thu_cung,
        ma_kh: ma_kh!,
        ten_thu_cung,
        loai,
        giong,
        tuoi: age,
        can_nang: weight,
        ghi_chu,
      },
    });

    res.status(201).json(pet);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deletePet(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const petId = req.params.id;

    if (!petId) {
      return res.status(400).json({ error: "Thiếu mã thú cưng cần xóa." });
    }

    const pet = await prisma.thuCung.findUnique({
      where: { ma_thu_cung: petId },
    });

    if (!pet) {
      return res.status(404).json({ error: "Không tìm thấy thú cưng." });
    }

    if (req.user?.role !== "admin" && pet.ma_kh !== ma_kh) {
      return res.status(403).json({ error: "Bạn không có quyền xóa thú cưng này." });
    }

    await prisma.thuCung.delete({
      where: { ma_thu_cung: petId },
    });

    res.json({ message: "Xóa hồ sơ thú cưng thành công." });
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({
        error: "Không thể xóa thú cưng này vì có lịch hẹn hoặc hóa đơn liên quan trên hệ thống.",
      });
    }
    res.status(500).json({ error: error.message });
  }
}

