-- CreateTable
CREATE TABLE "khach_hang" (
    "ma_kh" CHAR(8) NOT NULL,
    "ho_ten" VARCHAR(100) NOT NULL,
    "sdt" VARCHAR(15) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "mat_khau" VARCHAR(255) NOT NULL,
    "dia_chi" VARCHAR(255),
    "ngay_tao_tai_khoan" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "khach_hang_pkey" PRIMARY KEY ("ma_kh")
);

-- CreateTable
CREATE TABLE "thu_cung" (
    "ma_thu_cung" CHAR(8) NOT NULL,
    "ma_kh" CHAR(8) NOT NULL,
    "ten_thu_cung" VARCHAR(50) NOT NULL,
    "loai" VARCHAR(30) NOT NULL,
    "giong" VARCHAR(50),
    "tuoi" INTEGER,
    "can_nang" DECIMAL(5,2) NOT NULL,
    "ghi_chu" VARCHAR(255),

    CONSTRAINT "thu_cung_pkey" PRIMARY KEY ("ma_thu_cung")
);

-- CreateTable
CREATE TABLE "nhan_vien" (
    "ma_nv" CHAR(8) NOT NULL,
    "ho_ten" VARCHAR(100) NOT NULL,
    "sdt" VARCHAR(15) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "mat_khau" VARCHAR(255) NOT NULL,
    "vai_tro" VARCHAR(20) NOT NULL,
    "trang_thai" VARCHAR(20) NOT NULL DEFAULT 'Dang lam',

    CONSTRAINT "nhan_vien_pkey" PRIMARY KEY ("ma_nv")
);

-- CreateTable
CREATE TABLE "ca_lam_viec" (
    "ma_ca" CHAR(8) NOT NULL,
    "ten_ca" VARCHAR(50) NOT NULL,
    "gio_bat_dau" TIME NOT NULL,
    "gio_ket_thuc" TIME NOT NULL,
    "trang_thai" VARCHAR(20) NOT NULL DEFAULT 'Hoat dong',

    CONSTRAINT "ca_lam_viec_pkey" PRIMARY KEY ("ma_ca")
);

-- CreateTable
CREATE TABLE "phan_cong_ca" (
    "ma_nv" CHAR(8) NOT NULL,
    "ma_ca" CHAR(8) NOT NULL,
    "ngay_lam_viec" DATE NOT NULL,

    CONSTRAINT "phan_cong_ca_pkey" PRIMARY KEY ("ma_nv","ma_ca","ngay_lam_viec")
);

-- CreateTable
CREATE TABLE "dich_vu" (
    "ma_dich_vu" CHAR(8) NOT NULL,
    "ten_dich_vu" VARCHAR(100) NOT NULL,
    "mo_ta" VARCHAR(255),
    "gia_tien" DECIMAL(12,2) NOT NULL,
    "thoi_gian_uoc_tinh" INTEGER NOT NULL,
    "trang_thai" VARCHAR(30) NOT NULL DEFAULT 'Dang cung cap',

    CONSTRAINT "dich_vu_pkey" PRIMARY KEY ("ma_dich_vu")
);

-- CreateTable
CREATE TABLE "san_pham" (
    "ma_sp" CHAR(8) NOT NULL,
    "ten_sp" VARCHAR(100) NOT NULL,
    "mo_ta" VARCHAR(255),
    "gia_ban" DECIMAL(12,2) NOT NULL,
    "so_luong_ton" INTEGER NOT NULL DEFAULT 0,
    "trang_thai" VARCHAR(20) NOT NULL DEFAULT 'Dang ban',

    CONSTRAINT "san_pham_pkey" PRIMARY KEY ("ma_sp")
);

-- CreateTable
CREATE TABLE "voucher" (
    "ma_voucher" CHAR(8) NOT NULL,
    "loai_giam" VARCHAR(20) NOT NULL,
    "gia_tri_giam" DECIMAL(12,2) NOT NULL,
    "muc_giam_toi_da" DECIMAL(12,2),
    "don_toi_thieu" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "han_su_dung" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "voucher_pkey" PRIMARY KEY ("ma_voucher")
);

-- CreateTable
CREATE TABLE "vi_voucher" (
    "ma_kh" CHAR(8) NOT NULL,
    "ma_voucher" CHAR(8) NOT NULL,
    "so_luot_con" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "vi_voucher_pkey" PRIMARY KEY ("ma_kh","ma_voucher")
);

-- CreateTable
CREATE TABLE "chi_tiet_gio_hang" (
    "ma_kh" CHAR(8) NOT NULL,
    "ma_sp" CHAR(8) NOT NULL,
    "so_luong" INTEGER NOT NULL,

    CONSTRAINT "chi_tiet_gio_hang_pkey" PRIMARY KEY ("ma_kh","ma_sp")
);

-- CreateTable
CREATE TABLE "phuong_thuc_giao_hang" (
    "ma_pt_giao" CHAR(8) NOT NULL,
    "ten_pt_giao" VARCHAR(50) NOT NULL,

    CONSTRAINT "phuong_thuc_giao_hang_pkey" PRIMARY KEY ("ma_pt_giao")
);

-- CreateTable
CREATE TABLE "phuong_thuc_thanh_toan" (
    "ma_pttt" CHAR(8) NOT NULL,
    "ten_pttt" VARCHAR(50) NOT NULL,

    CONSTRAINT "phuong_thuc_thanh_toan_pkey" PRIMARY KEY ("ma_pttt")
);

-- CreateTable
CREATE TABLE "hoa_don" (
    "ma_hoa_don" CHAR(8) NOT NULL,
    "ma_kh" CHAR(8) NOT NULL,
    "ma_nv_thu_ngan" CHAR(8),
    "ma_pttt" CHAR(8) NOT NULL,
    "tong_tien" DECIMAL(12,2) NOT NULL,
    "ngay_thanh_toan" TIMESTAMP(6),

    CONSTRAINT "hoa_don_pkey" PRIMARY KEY ("ma_hoa_don")
);

-- CreateTable
CREATE TABLE "dat_lich" (
    "ma_dat_lich" CHAR(8) NOT NULL,
    "ma_kh" CHAR(8) NOT NULL,
    "ma_thu_cung" CHAR(8) NOT NULL,
    "ma_dich_vu" CHAR(8) NOT NULL,
    "ma_nv_phu_trach" CHAR(8),
    "ma_voucher" CHAR(8),
    "ma_hoa_don" CHAR(8),
    "ngay_hen" DATE NOT NULL,
    "gio_hen" TIME NOT NULL,
    "hinh_thuc_dua_don" VARCHAR(30) NOT NULL,
    "dia_chi_dua_don" VARCHAR(255),
    "phi_dua_don" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "gia_dich_vu_chot" DECIMAL(12,2) NOT NULL,
    "thanh_tien" DECIMAL(12,2) NOT NULL,
    "trang_thai" VARCHAR(30) NOT NULL DEFAULT 'Cho xac nhan',
    "ly_do_huy" VARCHAR(255),

    CONSTRAINT "dat_lich_pkey" PRIMARY KEY ("ma_dat_lich")
);

-- CreateTable
CREATE TABLE "don_hang" (
    "ma_don_hang" CHAR(8) NOT NULL,
    "ma_kh" CHAR(8) NOT NULL,
    "ma_pt_giao" CHAR(8) NOT NULL,
    "ma_dat_lich" CHAR(8),
    "ma_voucher" CHAR(8),
    "ma_hoa_don" CHAR(8),
    "ngay_dat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ten_nguoi_nhan" VARCHAR(100) NOT NULL,
    "sdt_nguoi_nhan" VARCHAR(15) NOT NULL,
    "dia_chi_nhan" VARCHAR(255) NOT NULL,
    "phi_van_chuyen" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "thanh_tien" DECIMAL(12,2) NOT NULL,
    "trang_thai" VARCHAR(30) NOT NULL DEFAULT 'Cho xu ly',
    "ly_do_huy" VARCHAR(255),

    CONSTRAINT "don_hang_pkey" PRIMARY KEY ("ma_don_hang")
);

-- CreateTable
CREATE TABLE "chi_tiet_don_hang" (
    "ma_don_hang" CHAR(8) NOT NULL,
    "ma_sp" CHAR(8) NOT NULL,
    "so_luong" INTEGER NOT NULL,
    "gia_ban" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "chi_tiet_don_hang_pkey" PRIMARY KEY ("ma_don_hang","ma_sp")
);

-- CreateIndex
CREATE UNIQUE INDEX "khach_hang_sdt_key" ON "khach_hang"("sdt");

-- CreateIndex
CREATE UNIQUE INDEX "khach_hang_email_key" ON "khach_hang"("email");

-- CreateIndex
CREATE UNIQUE INDEX "nhan_vien_sdt_key" ON "nhan_vien"("sdt");

-- CreateIndex
CREATE UNIQUE INDEX "nhan_vien_email_key" ON "nhan_vien"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ca_lam_viec_ten_ca_key" ON "ca_lam_viec"("ten_ca");

-- CreateIndex
CREATE UNIQUE INDEX "dich_vu_ten_dich_vu_key" ON "dich_vu"("ten_dich_vu");

-- CreateIndex
CREATE UNIQUE INDEX "san_pham_ten_sp_key" ON "san_pham"("ten_sp");

-- CreateIndex
CREATE UNIQUE INDEX "phuong_thuc_giao_hang_ten_pt_giao_key" ON "phuong_thuc_giao_hang"("ten_pt_giao");

-- CreateIndex
CREATE UNIQUE INDEX "phuong_thuc_thanh_toan_ten_pttt_key" ON "phuong_thuc_thanh_toan"("ten_pttt");

-- AddForeignKey
ALTER TABLE "thu_cung" ADD CONSTRAINT "thu_cung_ma_kh_fkey" FOREIGN KEY ("ma_kh") REFERENCES "khach_hang"("ma_kh") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_cong_ca" ADD CONSTRAINT "phan_cong_ca_ma_nv_fkey" FOREIGN KEY ("ma_nv") REFERENCES "nhan_vien"("ma_nv") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phan_cong_ca" ADD CONSTRAINT "phan_cong_ca_ma_ca_fkey" FOREIGN KEY ("ma_ca") REFERENCES "ca_lam_viec"("ma_ca") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vi_voucher" ADD CONSTRAINT "vi_voucher_ma_kh_fkey" FOREIGN KEY ("ma_kh") REFERENCES "khach_hang"("ma_kh") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vi_voucher" ADD CONSTRAINT "vi_voucher_ma_voucher_fkey" FOREIGN KEY ("ma_voucher") REFERENCES "voucher"("ma_voucher") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_gio_hang" ADD CONSTRAINT "chi_tiet_gio_hang_ma_kh_fkey" FOREIGN KEY ("ma_kh") REFERENCES "khach_hang"("ma_kh") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_gio_hang" ADD CONSTRAINT "chi_tiet_gio_hang_ma_sp_fkey" FOREIGN KEY ("ma_sp") REFERENCES "san_pham"("ma_sp") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoa_don" ADD CONSTRAINT "hoa_don_ma_kh_fkey" FOREIGN KEY ("ma_kh") REFERENCES "khach_hang"("ma_kh") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoa_don" ADD CONSTRAINT "hoa_don_ma_nv_thu_ngan_fkey" FOREIGN KEY ("ma_nv_thu_ngan") REFERENCES "nhan_vien"("ma_nv") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoa_don" ADD CONSTRAINT "hoa_don_ma_pttt_fkey" FOREIGN KEY ("ma_pttt") REFERENCES "phuong_thuc_thanh_toan"("ma_pttt") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dat_lich" ADD CONSTRAINT "dat_lich_ma_kh_fkey" FOREIGN KEY ("ma_kh") REFERENCES "khach_hang"("ma_kh") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dat_lich" ADD CONSTRAINT "dat_lich_ma_thu_cung_fkey" FOREIGN KEY ("ma_thu_cung") REFERENCES "thu_cung"("ma_thu_cung") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dat_lich" ADD CONSTRAINT "dat_lich_ma_dich_vu_fkey" FOREIGN KEY ("ma_dich_vu") REFERENCES "dich_vu"("ma_dich_vu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dat_lich" ADD CONSTRAINT "dat_lich_ma_nv_phu_trach_fkey" FOREIGN KEY ("ma_nv_phu_trach") REFERENCES "nhan_vien"("ma_nv") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dat_lich" ADD CONSTRAINT "dat_lich_ma_hoa_don_fkey" FOREIGN KEY ("ma_hoa_don") REFERENCES "hoa_don"("ma_hoa_don") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dat_lich" ADD CONSTRAINT "dat_lich_ma_kh_ma_voucher_fkey" FOREIGN KEY ("ma_kh", "ma_voucher") REFERENCES "vi_voucher"("ma_kh", "ma_voucher") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_ma_kh_fkey" FOREIGN KEY ("ma_kh") REFERENCES "khach_hang"("ma_kh") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_ma_pt_giao_fkey" FOREIGN KEY ("ma_pt_giao") REFERENCES "phuong_thuc_giao_hang"("ma_pt_giao") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_ma_dat_lich_fkey" FOREIGN KEY ("ma_dat_lich") REFERENCES "dat_lich"("ma_dat_lich") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_ma_hoa_don_fkey" FOREIGN KEY ("ma_hoa_don") REFERENCES "hoa_don"("ma_hoa_don") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "don_hang" ADD CONSTRAINT "don_hang_ma_kh_ma_voucher_fkey" FOREIGN KEY ("ma_kh", "ma_voucher") REFERENCES "vi_voucher"("ma_kh", "ma_voucher") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don_hang" ADD CONSTRAINT "chi_tiet_don_hang_ma_don_hang_fkey" FOREIGN KEY ("ma_don_hang") REFERENCES "don_hang"("ma_don_hang") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chi_tiet_don_hang" ADD CONSTRAINT "chi_tiet_don_hang_ma_sp_fkey" FOREIGN KEY ("ma_sp") REFERENCES "san_pham"("ma_sp") ON DELETE RESTRICT ON UPDATE CASCADE;
