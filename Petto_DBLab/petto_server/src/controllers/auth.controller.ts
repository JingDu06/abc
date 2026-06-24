import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../config/database";

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { ho_ten, sdt, email, mat_khau, dia_chi } = req.body;

    if (!ho_ten || !sdt || !email || !mat_khau) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc." });
    }

    if (mat_khau.length < 8) {
      return res.status(400).json({ error: "Mật khẩu phải chứa ít nhất 8 ký tự." });
    }

    // Check unique sdt and email
    const existingCust = await prisma.khachHang.findFirst({
      where: { OR: [{ sdt }, { email }] },
    });
    if (existingCust) {
      return res.status(400).json({ error: "Số điện thoại hoặc Email đã tồn tại trên hệ thống." });
    }

    // Generate custom ma_kh (e.g. KH000001)
    const count = await prisma.khachHang.count();
    const ma_kh = "KH" + String(count + 1).padStart(6, "0");

    const customer = await prisma.khachHang.create({
      data: {
        ma_kh,
        ho_ten,
        sdt,
        email,
        mat_khau, // Simplification: stored plain/plain hash for local DLab setup
        dia_chi,
      },
    });

    res.status(201).json({
      message: "Đăng ký tài khoản thành công.",
      customer: {
        ma_kh: customer.ma_kh,
        ho_ten: customer.ho_ten,
        sdt: customer.sdt,
        email: customer.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { username, password } = req.body; // username can be sdt or email

    if (!username || !password) {
      return res.status(400).json({ error: "Vui lòng nhập tài khoản và mật khẩu." });
    }

    // 1. Search in Customer
    let customer = await prisma.khachHang.findFirst({
      where: {
        OR: [{ sdt: username }, { email: username }],
      },
    });

    if (customer) {
      if (customer.mat_khau !== password) {
        return res.status(400).json({ error: "Mật khẩu không chính xác." });
      }
      return res.json({
        message: "Đăng nhập thành công (Khách hàng)",
        user: {
          id: customer.ma_kh,
          name: customer.ho_ten,
          role: "customer",
          phone: customer.sdt,
          email: customer.email,
          address: customer.dia_chi || "",
        },
      });
    }

    // 2. Search in Staff/Admin
    let employee = await prisma.nhanVien.findFirst({
      where: {
        OR: [{ sdt: username }, { email: username }],
      },
    });

    if (employee) {
      if (employee.trang_thai === "Da nghi") {
        return res.status(403).json({ error: "Tài khoản của bạn đã bị khóa." });
      }
      if (employee.mat_khau !== password) {
        return res.status(400).json({ error: "Mật khẩu không chính xác." });
      }
      return res.json({
        message: `Đăng nhập thành công (${employee.vai_tro})`,
        user: {
          id: employee.ma_nv,
          name: employee.ho_ten,
          role: employee.vai_tro.toLowerCase(), // 'admin' or 'staff'
          phone: employee.sdt,
          email: employee.email,
        },
      });
    }

    res.status(400).json({ error: "Tài khoản không tồn tại trên hệ thống." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function verifyAccount(req: AuthenticatedRequest, res: Response) {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: "Vui lòng nhập số điện thoại hoặc email." });
    }

    // 1. Check in Customer
    const customer = await prisma.khachHang.findFirst({
      where: {
        OR: [{ sdt: identifier }, { email: identifier }],
      },
    });

    if (customer) {
      return res.json({
        message: "Xác thực tài khoản thành công.",
        exists: true,
        type: "customer",
        otp: "123456", // Return mock OTP for local setup
      });
    }

    // 2. Check in Employee
    const employee = await prisma.nhanVien.findFirst({
      where: {
        OR: [{ sdt: identifier }, { email: identifier }],
      },
    });

    if (employee) {
      if (employee.trang_thai === "Da nghi") {
        return res.status(403).json({ error: "Tài khoản của bạn đã bị khóa." });
      }
      return res.json({
        message: "Xác thực tài khoản thành công.",
        exists: true,
        type: "employee",
        otp: "123456", // Return mock OTP for local setup
      });
    }

    return res.status(404).json({ error: "Không tìm thấy tài khoản với thông tin đã cung cấp." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function resetPassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { identifier, newPassword } = req.body;

    if (!identifier || !newPassword) {
      return res.status(400).json({ error: "Vui lòng cung cấp đầy đủ thông tin." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Mật khẩu phải chứa ít nhất 8 ký tự." });
    }

    // 1. Try updating Customer
    const customer = await prisma.khachHang.findFirst({
      where: {
        OR: [{ sdt: identifier }, { email: identifier }],
      },
    });

    if (customer) {
      await prisma.khachHang.update({
        where: { ma_kh: customer.ma_kh },
        data: { mat_khau: newPassword },
      });
      return res.json({ message: "Đặt lại mật khẩu thành công." });
    }

    // 2. Try updating Employee
    const employee = await prisma.nhanVien.findFirst({
      where: {
        OR: [{ sdt: identifier }, { email: identifier }],
      },
    });

    if (employee) {
      await prisma.nhanVien.update({
        where: { ma_nv: employee.ma_nv },
        data: { mat_khau: newPassword },
      });
      return res.json({ message: "Đặt lại mật khẩu thành công." });
    }

    return res.status(404).json({ error: "Không tìm thấy tài khoản để cập nhật mật khẩu." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: "Chưa xác thực." });
    }

    if (role === "customer") {
      const customer = await prisma.khachHang.findUnique({
        where: { ma_kh: userId },
      });
      if (!customer) {
        return res.status(404).json({ error: "Không tìm thấy khách hàng." });
      }
      return res.json({
        id: customer.ma_kh,
        name: customer.ho_ten,
        phone: customer.sdt,
        email: customer.email,
        address: customer.dia_chi || "",
        role: "customer",
      });
    } else {
      const employee = await prisma.nhanVien.findUnique({
        where: { ma_nv: userId },
      });
      if (!employee) {
        return res.status(404).json({ error: "Không tìm thấy nhân viên." });
      }
      return res.json({
        id: employee.ma_nv,
        name: employee.ho_ten,
        phone: employee.sdt,
        email: employee.email,
        address: "",
        role: employee.vai_tro.toLowerCase(),
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { address, name, email, phone } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Chưa xác thực." });
    }

    if (role === "customer") {
      const updated = await prisma.khachHang.update({
        where: { ma_kh: userId },
        data: {
          dia_chi: address,
          ho_ten: name,
          email: email,
          sdt: phone,
        },
      });
      return res.json({
        message: "Cập nhật hồ sơ thành công.",
        user: {
          id: updated.ma_kh,
          name: updated.ho_ten,
          phone: updated.sdt,
          email: updated.email,
          address: updated.dia_chi || "",
          role: "customer",
        },
      });
    } else {
      const updated = await prisma.nhanVien.update({
        where: { ma_nv: userId },
        data: {
          ho_ten: name,
          email: email,
          sdt: phone,
        },
      });
      return res.json({
        message: "Cập nhật hồ sơ thành công.",
        user: {
          id: updated.ma_nv,
          name: updated.ho_ten,
          phone: updated.sdt,
          email: updated.email,
          address: "",
          role: updated.vai_tro.toLowerCase(),
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserVouchers(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    if (!ma_kh) {
      return res.status(401).json({ error: "Chưa xác thực." });
    }

    // 1. Fetch customer details with their completed order history and bookings to calculate membership status and registration days
    const customer = await prisma.khachHang.findUnique({
      where: { ma_kh },
      include: {
        dat_lich: {
          where: { trang_thai: "Da hoan thanh" }
        },
        don_hang: {
          where: { trang_thai: "Da hoan thanh" }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: "Không tìm thấy thông tin khách hàng." });
    }

    // 2. Fetch all active vouchers (expiry date in the future)
    const activeVouchers = await prisma.voucher.findMany({
      where: {
        han_su_dung: { gte: new Date() }
      }
    });

    // 3. Calculate total spend to determine user rank
    const spendOrders = customer.don_hang.reduce((sum, order) => sum + Number(order.thanh_tien), 0);
    const spendSpa = customer.dat_lich.reduce((sum, booking) => sum + Number(booking.thanh_tien), 0);
    const totalSpend = spendOrders + spendSpa;

    // 4. Auto-evaluate and award vouchers if condition is met
    for (const voucher of activeVouchers) {
      if (!voucher.dieu_kien_kich_hoat) continue;

      let satisfies = false;
      const cond = voucher.dieu_kien_kich_hoat.toLowerCase().trim();

      if (cond === "tat ca" || cond === "moi khach hang") {
        satisfies = true;
      } else if (cond === "khach hang moi" || cond === "moi dang ky") {
        const diffTime = Math.abs(new Date().getTime() - new Date(customer.ngay_tao_tai_khoan).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const transactionCount = customer.don_hang.length + customer.dat_lich.length;
        if (diffDays <= 7 || transactionCount === 0) {
          satisfies = true;
        }
      } else if (cond === "hang dong") {
        if (totalSpend >= 500000) satisfies = true;
      } else if (cond === "hang bac") {
        if (totalSpend >= 2000000) satisfies = true;
      } else if (cond === "hang vang") {
        if (totalSpend >= 5000000) satisfies = true;
      } else if (cond === "hang kim cuong") {
        if (totalSpend >= 10000000) satisfies = true;
      }

      if (satisfies) {
        // Check if customer already has this voucher in wallet
        const existing = await prisma.viVoucher.findUnique({
          where: {
            ma_kh_ma_voucher: {
              ma_kh,
              ma_voucher: voucher.ma_voucher
            }
          }
        });

        if (!existing) {
          await prisma.viVoucher.create({
            data: {
              ma_kh,
              ma_voucher: voucher.ma_voucher,
              so_luot_con: 1
            }
          });
        }
      }
    }

    // 5. Fetch updated list of vouchers in the customer's wallet
    const walletVouchers = await prisma.viVoucher.findMany({
      where: { ma_kh },
      include: {
        voucher: true,
      },
    });

    res.json(walletVouchers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function claimVoucher(req: AuthenticatedRequest, res: Response) {
  try {
    const ma_kh = req.user?.id;
    const { code } = req.body;

    if (!ma_kh) {
      return res.status(401).json({ error: "Chưa xác thực." });
    }

    if (!code) {
      return res.status(400).json({ error: "Vui lòng nhập mã voucher." });
    }

    // Find the voucher in database
    const voucher = await prisma.voucher.findUnique({
      where: { ma_voucher: code },
    });

    if (!voucher) {
      return res.status(404).json({ error: "Mã voucher không tồn tại." });
    }

    // Check expiry
    if (new Date(voucher.han_su_dung) < new Date()) {
      return res.status(400).json({ error: "Mã voucher này đã hết hạn sử dụng." });
    }

    // Check if user already claimed this voucher
    const existing = await prisma.viVoucher.findUnique({
      where: {
        ma_kh_ma_voucher: {
          ma_kh,
          ma_voucher: code,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "Bạn đã sở hữu voucher này trong ví rồi." });
    }

    // Add to wallet
    const newWalletVoucher = await prisma.viVoucher.create({
      data: {
        ma_kh,
        ma_voucher: code,
        so_luot_con: 1,
      },
      include: {
        voucher: true,
      },
    });

    res.status(201).json({
      message: "Nhận mã voucher thành công!",
      walletVoucher: newWalletVoucher,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}



