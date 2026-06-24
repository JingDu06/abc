import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import prisma from "../config/database";

export async function checkShiftMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Admins bypass shift checks
  if (req.user.role === "admin") {
    return next();
  }

  // Only check shift constraint for staff role
  if (req.user.role === "staff") {
    const now = new Date();
    const currentDateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentDate = new Date(currentDateStr);
    
    // Find all shift assignments for this employee today
    const assignments = await prisma.phanCongCa.findMany({
      where: {
        ma_nv: req.user.id,
        ngay_lam_viec: currentDate,
      },
      include: {
        ca_lam_viec: true,
      },
    });

    if (assignments.length === 0) {
      return res.status(403).json({
        error: "Forbidden. Bạn không có ca trực nào được phân công hôm nay.",
      });
    }

    const currentHourStr = now.toTimeString().split(" ")[0]; // HH:MM:SS
    const [currH, currM, currS] = currentHourStr.split(":").map(Number);
    const currSeconds = currH * 3600 + currM * 60 + currS;

    let inShift = false;

    for (const assignment of assignments) {
      const shift = assignment.ca_lam_viec;
      if (shift.trang_thai === "An") continue;

      // gio_bat_dau and gio_ket_thuc are stored as DateTime or Time in Postgres
      // Let's extract HH:MM:SS from the DateTime object
      const start = new Date(shift.gio_bat_dau);
      const end = new Date(shift.gio_ket_thuc);

      const startSeconds = start.getUTCHours() * 3600 + start.getUTCMinutes() * 60 + start.getUTCSeconds();
      const endSeconds = end.getUTCHours() * 3600 + end.getUTCMinutes() * 60 + end.getUTCSeconds();

      if (currSeconds >= startSeconds && currSeconds <= endSeconds) {
        inShift = true;
        break;
      }
    }

    if (!inShift) {
      return res.status(403).json({
        error: "Forbidden. Thao tác ngoài khung giờ làm việc của ca trực được phân công.",
      });
    }
  }

  next();
}
