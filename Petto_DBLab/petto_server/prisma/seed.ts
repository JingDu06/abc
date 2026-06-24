import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding data...");

  // 1. Clean Database
  await prisma.chiTietDonHang.deleteMany({});
  await prisma.donHang.deleteMany({});
  await prisma.datLich.deleteMany({});
  await prisma.hoaDon.deleteMany({});
  await prisma.chiTietGioHang.deleteMany({});
  await prisma.viVoucher.deleteMany({});
  await prisma.voucher.deleteMany({});
  await prisma.thuCung.deleteMany({});
  await prisma.khachHang.deleteMany({});
  await prisma.phanCongCa.deleteMany({});
  await prisma.caLamViec.deleteMany({});
  await prisma.nhanVien.deleteMany({});
  await prisma.dichVu.deleteMany({});
  await prisma.sanPham.deleteMany({});
  await prisma.phuongThucGiaoHang.deleteMany({});
  await prisma.phuongThucThanhToan.deleteMany({});

  // 2. PhuongThucGiaoHang
  console.log("Creating Delivery Methods...");
  await prisma.phuongThucGiaoHang.createMany({
    data: [
      { ma_pt_giao: "PTG00001", ten_pt_giao: "Tai quay" },
      { ma_pt_giao: "PTG00002", ten_pt_giao: "Giao tan noi" },
      { ma_pt_giao: "PTG00003", ten_pt_giao: "Giao kem lich spa" },
    ],
  });

  // 3. PhuongThucThanhToan
  console.log("Creating Payment Methods...");
  await prisma.phuongThucThanhToan.createMany({
    data: [
      { ma_pttt: "PTT00001", ten_pttt: "Tien mat" },
      { ma_pttt: "PTT00002", ten_pttt: "Chuyen khoan" },
      { ma_pttt: "PTT00003", ten_pttt: "The tin dung" },
    ],
  });

  // 4. SanPham (Products)
  console.log("Creating Products...");
  await prisma.sanPham.createMany({
    data: [
      { ma_sp: "SP000001", ten_sp: "Royal Canin Indoor Adult", mo_ta: "food", gia_ban: 320000, so_luong_ton: 50, trang_thai: "Dang ban" },
      { ma_sp: "SP000002", ten_sp: "Pedigree Chicken & Rice", mo_ta: "food", gia_ban: 185000, so_luong_ton: 30, trang_thai: "Dang ban" },
      { ma_sp: "SP000003", ten_sp: "Whiskas Pate Tuna", mo_ta: "food", gia_ban: 25000, so_luong_ton: 100, trang_thai: "Dang ban" },
      { ma_sp: "SP000004", ten_sp: "Frontline Plus Ve Ran", mo_ta: "medicine", gia_ban: 180000, so_luong_ton: 20, trang_thai: "Dang ban" },
      { ma_sp: "SP000005", ten_sp: "Can cau long vu LED", mo_ta: "toy", gia_ban: 95000, so_luong_ton: 15, trang_thai: "Dang ban" },
    ],
  });

  // 5. DichVu (Spa Services)
  console.log("Creating Spa Services...");
  await prisma.dichVu.createMany({
    data: [
      { ma_dich_vu: "DV000001", ten_dich_vu: "Tam & Say kho", mo_ta: "Tắm sạch và sấy khô lông", gia_tien: 180000, thoi_gian_uoc_tinh: 60, trang_thai: "Dang cung cap" },
      { ma_dich_vu: "DV000002", ten_dich_vu: "Cat tia long toan than", mo_ta: "Cắt tỉa lông tạo kiểu chuyên nghiệp", gia_tien: 280000, thoi_gian_uoc_tinh: 90, trang_thai: "Dang cung cap" },
      { ma_dich_vu: "DV000003", ten_dich_vu: "Cat mong", mo_ta: "Mài và cắt móng chân gọn gàng", gia_tien: 60000, thoi_gian_uoc_tinh: 20, trang_thai: "Dang cung cap" },
      { ma_dich_vu: "DV000004", ten_dich_vu: "Ve sinh tai", mo_ta: "Vệ sinh sạch sẽ bã tai", gia_tien: 50000, thoi_gian_uoc_tinh: 15, trang_thai: "Dang cung cap" },
    ],
  });

  // 6. NhanVien (Employees)
  console.log("Creating Employees...");
  await prisma.nhanVien.createMany({
    data: [
      { ma_nv: "NV000001", ho_ten: "Nguyen Van Admin", sdt: "0911111111", email: "admin@petto.com", mat_khau: "admin12345", vai_tro: "Admin", trang_thai: "Dang lam" },
      { ma_nv: "NV000002", ho_ten: "Tran Thi Staff", sdt: "0922222222", email: "staff@petto.com", mat_khau: "staff12345", vai_tro: "Staff", trang_thai: "Dang lam" },
    ],
  });

  // 7. CaLamViec (Shifts)
  console.log("Creating Shifts...");
  const dummyDate1 = new Date("1970-01-01T08:00:00Z");
  const dummyDate2 = new Date("1970-01-01T12:00:00Z");
  const dummyDate3 = new Date("1970-01-01T13:00:00Z");
  const dummyDate4 = new Date("1970-01-01T17:00:00Z");
  const dummyDate5 = new Date("1970-01-01T18:00:00Z");
  const dummyDate6 = new Date("1970-01-01T22:00:00Z");

  await prisma.caLamViec.create({
    data: { ma_ca: "CA000001", ten_ca: "Ca Sang", gio_bat_dau: dummyDate1, gio_ket_thuc: dummyDate2, trang_thai: "Hoat dong" }
  });
  await prisma.caLamViec.create({
    data: { ma_ca: "CA000002", ten_ca: "Ca Chieu", gio_bat_dau: dummyDate3, gio_ket_thuc: dummyDate4, trang_thai: "Hoat dong" }
  });
  await prisma.caLamViec.create({
    data: { ma_ca: "CA000003", ten_ca: "Ca Toi", gio_bat_dau: dummyDate5, gio_ket_thuc: dummyDate6, trang_thai: "Hoat dong" }
  });

  // 8. KhachHang (Customers)
  console.log("Creating Customers...");
  await prisma.khachHang.create({
    data: {
      ma_kh: "KH000001",
      ho_ten: "Nguyen Thi Lan",
      sdt: "0901234567",
      email: "lan.nguyen@gmail.com",
      mat_khau: "lan12345",
      dia_chi: "12 Le Loi, Quan 1, TP.HCM",
    },
  });

  // 9. ThuCung (Pets)
  console.log("Creating Pets...");
  await prisma.thuCung.createMany({
    data: [
      { ma_thu_cung: "TC000001", ma_kh: "KH000001", ten_thu_cung: "Mochi", loai: "cat", giong: "Scottish Fold", tuoi: 2, can_nang: 3.8, ghi_chu: "Thích ăn hạt" },
      { ma_thu_cung: "TC000002", ma_kh: "KH000001", ten_thu_cung: "Biscuit", loai: "dog", giong: "Golden Retriever", tuoi: 4, can_nang: 28.0, ghi_chu: "Rất hiền lành" },
    ],
  });

  // 10. Voucher
  console.log("Creating Vouchers...");
  const expiration = new Date();
  expiration.setFullYear(expiration.getFullYear() + 1); // Valid for 1 year

  await prisma.voucher.createMany({
    data: [
      {
        ma_voucher: "VC000001",
        loai_giam: "Phan tram",
        gia_tri_giam: 10,
        muc_giam_toi_da: 50000,
        don_toi_thieu: 100000,
        han_su_dung: expiration,
        dieu_kien_kich_hoat: "Moi khach hang",
      },
      {
        ma_voucher: "VC000002",
        loai_giam: "Phan tram",
        gia_tri_giam: 20,
        muc_giam_toi_da: 100000,
        don_toi_thieu: 200000,
        han_su_dung: expiration,
        dieu_kien_kich_hoat: "Khach hang moi",
      },
      {
        ma_voucher: "VC000003",
        loai_giam: "Tien mat",
        gia_tri_giam: 50000,
        muc_giam_toi_da: null,
        don_toi_thieu: 0,
        han_su_dung: expiration,
        dieu_kien_kich_hoat: "Moi dang ky",
      },
      {
        ma_voucher: "VC000004",
        loai_giam: "Phan tram",
        gia_tri_giam: 15,
        muc_giam_toi_da: 150000,
        don_toi_thieu: 500000,
        han_su_dung: expiration,
        dieu_kien_kich_hoat: "Hang vang",
      },
    ],
  });

  console.log("🌱 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
