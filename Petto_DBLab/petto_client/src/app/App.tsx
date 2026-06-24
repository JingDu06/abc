import { useState, useEffect } from "react";
import type React from "react";
import {
  User,
  ShoppingCart,
  Calendar,
  History,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Tag,
  MapPin,
  Phone,
  Clock,
  Package,
  Scissors,
  Truck,
  Store,
  Check,
  X,
  PawPrint,
  Bell,
  ShoppingBag,
  Search,
  Star,
  LogOut,
  Wallet,
  Copy,
  Percent,
  BadgeDollarSign,
  CalendarDays,
  ShoppingBasket,
  ChevronRight,
} from "lucide-react";
import AuthScreen from "./AuthScreen";

// ─── Helper Functions for Pet Emojis & Age Calculation ─────────────────────────
export function getPetEmoji(type: string): string {
  const t = type?.toLowerCase() || "";
  if (t === "cat" || t === "mèo") return "🐱";
  if (t === "dog" || t === "chó") return "🐶";
  if (t === "thỏ") return "🐰";
  if (t === "chim") return "🐦";
  if (t === "chuột") return "🐹";
  return "🐾";
}

export function calculatePetAge(birthMonth: number, birthYear: number): string {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const diffMonths = (currentYear - birthYear) * 12 + (currentMonth - birthMonth);
  if (diffMonths <= 0) {
    return "1 tháng";
  }
  if (diffMonths < 12) {
    return `${diffMonths} tháng`;
  }
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} tuổi`;
}

export function parsePetAge(tuoi: number, ghi_chu: string): string {
  const match = ghi_chu?.match(/\[Birth:(\d+)\/(\d+)\]/);
  if (match) {
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    return calculatePetAge(month, year);
  }
  return `${tuoi} tuổi`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "profile" | "store" | "spa" | "cart" | "checkout" | "history" | "voucher";
type StoreCategory = "food" | "toy" | "medicine";

interface Pet {
  id: string;
  name: string;
  breed: string;
  weight: string;
  age: string;
  emoji: string;
  type: "cat" | "dog";
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji: string;
  category: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  emoji: string;
  category: StoreCategory;
  tag?: string;
  description: string;
  weight?: string;
}

// ─── API Setup ───────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";

const getProductEmoji = (ma_sp: string) => {
  if (ma_sp === "SP000001") return "🥣";
  if (ma_sp === "SP000002") return "🍗";
  if (ma_sp === "SP000003") return "🐟";
  if (ma_sp === "SP000004") return "💊";
  if (ma_sp === "SP000005") return "🪶";
  return "📦";
};

const getProductCategory = (category: string) => {
  if (category === "food") return "food";
  if (category === "toy") return "toy";
  if (category === "medicine") return "medicine";
  return "food";
};

const getProductCategoryLabel = (category: string) => {
  if (category === "food") return "Thức ăn";
  if (category === "toy") return "Đồ chơi";
  if (category === "medicine") return "Phụ kiện";
  return "Thức ăn";
};

const mapStatusToUI = (status: string) => {
  if (status === "Cho xac nhan") return "Chờ xác nhận";
  if (status === "Da xac nhan") return "Đang xử lý";
  if (status === "Cho xu ly") return "Chờ xác nhận";
  if (status === "Dang giao") return "Đang xử lý";
  if (status === "Cho thanh toan") return "Chờ xác nhận";
  if (status === "Da thanh toan") return "Đã thanh toán";
  if (status === "Da hoan thanh") return "Hoàn thành";
  if (status === "Da huy") return "Đã huỷ";
  return status;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Chờ xác nhận": "bg-amber-100 text-amber-700 border border-amber-200",
    "Đã thanh toán": "bg-emerald-100 text-emerald-700 border border-emerald-200",
    "Đã huỷ": "bg-rose-100 text-rose-600 border border-rose-200",
    "Đang xử lý": "bg-sky-100 text-sky-700 border border-sky-200",
    "Hoàn thành": "bg-violet-100 text-violet-700 border border-violet-200",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "profile", label: "Hồ sơ", Icon: User },
  { id: "store", label: "Cửa hàng", Icon: ShoppingBag },
  { id: "spa", label: "Đặt Spa", Icon: Scissors },
  { id: "cart", label: "Giỏ hàng", Icon: ShoppingCart },
  { id: "checkout", label: "Thanh toán", Icon: CreditCard },
  { id: "voucher", label: "Ví Voucher", Icon: Wallet },
  { id: "history", label: "Lịch sử", Icon: History },
] as const;

const SCREEN_TITLES: Record<Screen, string> = {
  profile: "Hồ sơ của tôi",
  store: "Cửa hàng",
  spa: "Đặt lịch Spa",
  cart: "Giỏ hàng",
  checkout: "Thanh toán",
  voucher: "Ví Voucher",
  history: "Lịch sử",
};

const CATEGORY_META: Record<StoreCategory, { label: string; emoji: string; desc: string; color: string }> = {
  food: { label: "Đồ ăn", emoji: "🍽️", desc: "Thức ăn & dinh dưỡng", color: "bg-amber-100 text-amber-700 border-amber-200" },
  toy: { label: "Đồ chơi", emoji: "🎾", desc: "Vui chơi & vận động", color: "bg-sky-100 text-sky-700 border-sky-200" },
  medicine: { label: "Thuốc & TPCN", emoji: "💊", desc: "Sức khoẻ & chăm sóc", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

// ─── Screen 0 — Cửa hàng ─────────────────────────────────────────────────────
function StoreScreen({ onAddToCart }: { onAddToCart: (p: any) => void }) {
  const [activeCategory, setActiveCategory] = useState<StoreCategory>("food");
  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((item: any) => ({
            id: item.ma_sp,
            name: item.ten_sp,
            brand: "Petto",
            price: Number(item.gia_ban),
            originalPrice: Number(item.gia_ban) + 50000,
            rating: 4.8,
            reviews: 120,
            emoji: getProductEmoji(item.ma_sp),
            category: getProductCategory(item.mo_ta),
            description: item.mo_ta,
            tag: item.so_luong_ton > 0 ? "Bán chạy" : "Hết hàng"
          }));
          setDbProducts(mapped);
        }
      })
      .catch((err) => console.log("Lỗi tải sản phẩm:", err));
  }, []);

  const filtered = dbProducts.filter(
    (p) => p.category === activeCategory && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (product: any) => {
    onAddToCart(product);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== product.id)), 1500);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-3 focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-3 mb-7">
          {(Object.keys(CATEGORY_META) as StoreCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const active = activeCategory === cat;
            const count = dbProducts.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setSearch(""); }}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border font-medium text-sm transition-all ${
                  active
                    ? "text-primary-foreground shadow-md"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
                style={active ? { background: "linear-gradient(135deg, #FDBA74, #FB923C)", borderColor: "transparent" } : {}}
              >
                <span className="text-xl">{meta.emoji}</span>
                <div className="text-left">
                  <p className={active ? "text-white font-semibold" : ""}>{meta.label}</p>
                  <p className={`text-xs ${active ? "text-white/70" : "text-muted-foreground"}`}>{count} sản phẩm</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Category header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-foreground font-bold text-lg">
              {CATEGORY_META[activeCategory].emoji} {CATEGORY_META[activeCategory].label}
            </h3>
            <p className="text-muted-foreground text-sm">{CATEGORY_META[activeCategory].desc}</p>
          </div>
          <span className="text-muted-foreground text-sm">{filtered.length} sản phẩm</span>
        </div>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-foreground font-semibold">Không tìm thấy sản phẩm</p>
            <p className="text-muted-foreground text-sm mt-1">Thử từ khoá khác nhé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product) => {
              const added = addedIds.includes(product.id);
              const catMeta = CATEGORY_META[product.category];
              return (
                <div
                  key={product.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col"
                >
                  {/* Product image area */}
                  <div
                    className="relative h-36 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}
                  >
                    <span className="text-6xl">{product.emoji}</span>
                    {product.tag && (
                      <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${catMeta.color}`}>
                        {product.tag}
                      </span>
                    )}
                    {product.weight && (
                      <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 text-muted-foreground">
                        {product.weight}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
                    <h4 className="text-foreground font-semibold text-sm leading-tight mb-1.5 line-clamp-2">{product.name}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2 flex-1">{product.description}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-border"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
                    </div>

                    {/* Price + Add */}
                    <div className="flex items-end justify-between gap-2 mt-auto">
                      <div>
                        <p className="text-accent font-bold text-base">{fmt(product.price)}</p>
                        {product.originalPrice && (
                          <p className="text-muted-foreground text-xs line-through">{fmt(product.originalPrice)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAdd(product)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          added
                            ? "bg-emerald-500 text-white"
                            : "text-primary-foreground hover:opacity-90 hover:scale-105"
                        }`}
                        style={added ? {} : { background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
                      >
                        {added ? (
                          <><Check className="w-3.5 h-3.5" /> Đã thêm</>
                        ) : (
                          <><Plus className="w-3.5 h-3.5" /> Thêm vào giỏ</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen 1 — Hồ sơ ────────────────────────────────────────────────────────
function ProfileScreen({ headers, user, onUserUpdate }: { headers: any; user: any; onUserUpdate: (u: any) => void }) {
  const [showAddPet, setShowAddPet] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [petType, setPetType] = useState("chó");
  const [birthMonth, setBirthMonth] = useState(1);
  const [birthYear, setBirthYear] = useState(new Date().getFullYear());

  // Personal details editing states
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileAddress, setProfileAddress] = useState(user?.address || "");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setProfileName(user?.name || "");
    setProfilePhone(user?.phone || "");
    setProfileEmail(user?.email || "");
    setProfileAddress(user?.address || "");
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!profileName || !profilePhone || !profileEmail) {
      alert("Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Email.");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          email: profileEmail,
          address: profileAddress,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        alert("Cập nhật thông tin hồ sơ thành công!");
        onUserUpdate(data.user);
      } else {
        const err = await res.json();
        alert(`Lỗi cập nhật: ${err.error || "Không xác định"}`);
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ khi cập nhật thông tin.");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchPets = () => {
    fetch(`${API_BASE}/pets`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPets(data.map((item: any) => ({
            id: item.ma_thu_cung,
            name: item.ten_thu_cung,
            breed: item.giong || "Không xác định",
            weight: `${item.can_nang} kg`,
            age: parsePetAge(item.tuoi, item.ghi_chu),
            emoji: getPetEmoji(item.loai),
            type: item.loai
          })));
        }
      })
      .catch((err) => console.log("Lỗi tải thú cưng:", err));
  };

  useEffect(() => {
    fetchPets();
  }, [headers]);

  const handleSavePet = async () => {
    if (!petName || !petBreed || !petWeight) {
      alert("Vui lòng nhập tên, giống và cân nặng.");
      return;
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const diffMonths = (currentYear - birthYear) * 12 + (currentMonth - birthMonth);
    const diffYears = Math.floor(Math.max(0, diffMonths) / 12);

    const res = await fetch(`${API_BASE}/pets`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ten_thu_cung: petName,
        loai: petType,
        giong: petBreed,
        can_nang: Number(petWeight),
        tuoi: diffYears,
        ghi_chu: `Mới đăng ký từ UI [Birth:${birthMonth}/${birthYear}]`
      })
    });

    if (res.ok) {
      setShowAddPet(false);
      setPetName("");
      setPetBreed("");
      setPetWeight("");
      setBirthMonth(1);
      setBirthYear(new Date().getFullYear());
      setPetType("chó");
      fetchPets();
    } else {
      const err = await res.json();
      alert(`Lỗi lưu thú cưng: ${err.error}`);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hồ sơ thú cưng này?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/pets/${petId}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        alert("Xóa thú cưng thành công!");
        fetchPets();
      } else {
        const err = await res.json();
        alert(err.error || "Không thể xóa thú cưng.");
      }
    } catch (e) {
      alert("Lỗi kết nối server.");
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {/* User card */}
        <div
          className="relative overflow-hidden rounded-3xl px-8 pt-8 pb-7 mb-6"
          style={{ background: "linear-gradient(135deg, #FDBA74 0%, #FB923C 55%, #F97316 100%)" }}
        >
          <div className="absolute right-6 top-4 opacity-10 text-[8rem] leading-none select-none">🐾</div>
          <div className="absolute right-32 bottom-2 opacity-10 text-6xl select-none rotate-12">🐾</div>

          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg">
              👩
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Tài khoản</p>
              <h2 className="text-white text-2xl font-semibold">{user?.name || "Khách hàng"}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <Phone className="w-4 h-4 text-white/80 flex-shrink-0" />
              <span className="text-white text-sm font-medium">{user?.phone || "Chưa cập nhật"}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-white/80 flex-shrink-0" />
              <span className="text-white text-sm font-medium truncate">{user?.address || "Chưa cập nhật địa chỉ"}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs">Vai trò</p>
                <p className="text-white font-semibold uppercase">{user?.role || "Khách hàng"}</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs">Mã số</p>
                <p className="text-white font-bold">{user?.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal info form */}
        <div className="bg-card border border-border rounded-3xl p-6 mb-6 shadow-sm">
          <h3 className="text-foreground font-semibold text-lg mb-4 flex items-center gap-2">
            👤 Thông tin cá nhân
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Họ và tên</label>
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Số điện thoại</label>
              <input
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                placeholder="0901234567"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Email</label>
              <input
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Địa chỉ nhận hàng</label>
              <input
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                placeholder="Vd: 123 Đường ABC, Quận 1, TP. HCM"
              />
            </div>
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="mt-5 px-6 py-2.5 rounded-xl font-semibold text-primary-foreground text-sm transition-opacity hover:opacity-90 disabled:opacity-50 shadow-sm"
            style={{ background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
          >
            {isUpdating ? "Đang cập nhật..." : "Cập nhật thông tin"}
          </button>
        </div>

        {/* My Pets */}
        {user?.role === "customer" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold text-lg">Thú cưng của tôi</h3>
                <p className="text-muted-foreground text-sm">{pets.length} thú cưng đã đăng ký</p>
              </div>
              <button
                onClick={() => setShowAddPet(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-primary-foreground text-sm transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
              >
                <Plus className="w-4 h-4" />
                Thêm thú cưng
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer relative group"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePet(pet.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
                    title="Xóa thú cưng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto"
                    style={{ background: "linear-gradient(135deg, #FDE68A, #FDBA74)" }}
                  >
                    {pet.emoji}
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h4 className="text-foreground font-semibold">{pet.name}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium capitalize">
                        {pet.type}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{pet.breed}</p>
                    <div className="flex justify-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cân nặng</p>
                        <p className="text-foreground font-semibold text-sm">{pet.weight}</p>
                      </div>
                      <div className="w-px bg-border" />
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tuổi</p>
                        <p className="text-foreground font-semibold text-sm">{pet.age}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add pet placeholder card */}
              <button
                onClick={() => setShowAddPet(true)}
                className="bg-card border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-orange-50/50 transition-all duration-200 min-h-[200px] cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
                >
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">Thêm thú cưng mới</p>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal thêm thú cưng */}
      {showAddPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-foreground font-semibold text-xl">Thêm thú cưng mới</h3>
              <button onClick={() => setShowAddPet(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Tên thú cưng</label>
                <input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                  placeholder="Vd: Mochi"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Loài</label>
                <select
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                >
                  <option value="chó">Chó 🐶</option>
                  <option value="mèo">Mèo 🐱</option>
                  <option value="thỏ">Thỏ 🐰</option>
                  <option value="chim">Chim 🐦</option>
                  <option value="chuột">Chuột 🐹</option>
                  <option value="khác">Khác 🐾</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Giống</label>
                <input
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                  placeholder="Vd: Scottish Fold"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Cân nặng (kg)</label>
                <input
                  value={petWeight}
                  onChange={(e) => setPetWeight(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary transition-colors"
                  placeholder="Vd: 3.8"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold mb-1.5 block">Thời gian sinh</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Tháng sinh</label>
                    <select
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(Number(e.target.value))}
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          Tháng {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Năm sinh</label>
                    <select
                      value={birthYear}
                      onChange={(e) => setBirthYear(Number(e.target.value))}
                      className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    >
                      {Array.from({ length: 18 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y}>
                          Năm {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleSavePet}
              className="mt-6 w-full py-3.5 rounded-xl font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
            >
              Lưu thú cưng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen 2 — Đặt Spa ──────────────────────────────────────────────────────
function SpaBookingScreen({ headers }: { headers: any }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>(["s1"]);
  const [selectedDate, setSelectedDate] = useState("2026-06-28");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [pickup, setPickup] = useState<"self" | "pickup">("self");
  const [voucher, setVoucher] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [petDropdown, setPetDropdown] = useState(false);

  useEffect(() => {
    // 1. Fetch Pets
    fetch(`${API_BASE}/pets`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedPets = data.map((item: any) => ({
            id: item.ma_thu_cung,
            name: item.ten_thu_cung,
            breed: item.giong || "Không xác định",
            weight: `${item.can_nang} kg`,
            age: parsePetAge(item.tuoi, item.ghi_chu),
            emoji: getPetEmoji(item.loai),
            type: item.loai
          }));
          setPets(mappedPets);
          if (mappedPets.length > 0) setSelectedPet(mappedPets[0]);
        }
      })
      .catch((err) => console.log("Lỗi tải thú cưng:", err));

    // 2. Fetch Spa Services
    fetch(`${API_BASE}/spa/services`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbServices(data.map((item: any) => ({
            id: item.ma_dich_vu === "DV000001" ? "s1" :
                item.ma_dich_vu === "DV000002" ? "s2" :
                item.ma_dich_vu === "DV000003" ? "s3" :
                item.ma_dich_vu === "DV000004" ? "s4" : "s5",
            name: item.ten_dich_vu,
            duration: `${item.thoi_gian_uoc_tinh} phút`,
            price: Number(item.gia_tien),
            icon: item.ma_dich_vu === "DV000001" ? "🛁" :
                  item.ma_dich_vu === "DV000002" ? "✂️" :
                  item.ma_dich_vu === "DV000003" ? "💅" : "👂"
          })));
        }
      })
      .catch((err) => console.log("Lỗi tải dịch vụ:", err));
  }, [headers]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    setAppliedVoucher(null);
  };

  const total = dbServices.filter((s) => selectedServices.includes(s.id)).reduce((a, s) => a + s.price, 0);
  const pickupFee = pickup === "pickup" ? 30000 : 0;

  const handleApplyVoucher = async () => {
    if (!voucher.trim()) {
      alert("Vui lòng nhập mã giảm giá.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/vouchers`, { headers });
      if (res.ok) {
        const walletVouchers = await res.json();
        const codeUpper = voucher.trim().toUpperCase();
        const matched = walletVouchers.find((item: any) => item.ma_voucher === codeUpper);
        if (matched) {
          const now = new Date();
          const v = matched.voucher;
          if (matched.so_luot_con <= 0) {
            alert("Mã giảm giá này đã hết lượt sử dụng trong ví.");
            setAppliedVoucher(null);
            return;
          }
          if (new Date(v.han_su_dung) < now) {
            alert("Mã giảm giá này đã hết hạn.");
            setAppliedVoucher(null);
            return;
          }
          if (total < Number(v.don_toi_thieu)) {
            alert(`Đơn hàng chưa đạt giá trị tối thiểu ${Number(v.don_toi_thieu).toLocaleString()}đ để áp dụng mã.`);
            setAppliedVoucher(null);
            return;
          }
          setAppliedVoucher(matched);
          alert("Áp dụng mã giảm giá thành công!");
        } else {
          alert("Mã giảm giá không tồn tại trong ví của bạn. Vui lòng nhận voucher tại Ví Voucher trước.");
          setAppliedVoucher(null);
        }
      } else {
        alert("Không thể kiểm tra ví voucher.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi áp dụng mã giảm giá.");
    }
  };

  let discountAmount = 0;
  if (appliedVoucher) {
    const v = appliedVoucher.voucher;
    if (total >= Number(v.don_toi_thieu)) {
      if (v.loai_giam === "Phan tram") {
        discountAmount = Math.round(total * (Number(v.gia_tri_giam) / 100));
        if (v.muc_giam_toi_da && discountAmount > Number(v.muc_giam_toi_da)) {
          discountAmount = Number(v.muc_giam_toi_da);
        }
      } else {
        discountAmount = Number(v.gia_tri_giam);
      }
      if (discountAmount > total) discountAmount = total;
    }
  }

  const handleBookSpa = async () => {
    if (!selectedPet) {
      alert("Vui lòng chọn hoặc đăng ký thú cưng trước.");
      return;
    }
    if (selectedServices.length === 0) {
      alert("Vui lòng chọn ít nhất một dịch vụ!");
      return;
    }

    for (const serviceId of selectedServices) {
      const dbServiceId = 
        serviceId === "s1" ? "DV000001" :
        serviceId === "s2" ? "DV000002" :
        serviceId === "s3" ? "DV000003" :
        serviceId === "s4" ? "DV000004" : "DV000002";

      const res = await fetch(`${API_BASE}/spa/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ma_thu_cung: selectedPet.id,
          ma_dich_vu: dbServiceId,
          ngay_hen: selectedDate,
          gio_hen: selectedTime + ":00",
          hinh_thuc_dua_don: pickup === "self" ? "Tu dua don" : "Shop dua don",
          dia_chi_dua_don: pickup === "pickup" ? "12 Le Loi, Quan 1, TP.HCM" : undefined,
          ma_voucher: appliedVoucher ? appliedVoucher.ma_voucher : undefined
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Lỗi đặt lịch: ${err.error}`);
        return;
      }
    }

    alert("Đặt lịch Spa thành công!");
    setAppliedVoucher(null);
    setVoucher("");
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column — form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chọn thú cưng */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Chọn thú cưng</label>
              <div className="relative">
                {selectedPet ? (
                  <button
                    onClick={() => setPetDropdown(!petDropdown)}
                    className="w-full bg-card border border-border rounded-2xl px-5 py-3.5 flex items-center gap-3 text-left shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <span className="text-2xl">{selectedPet.emoji}</span>
                    <div className="flex-1">
                      <p className="text-foreground font-semibold text-sm">{selectedPet.name}</p>
                      <p className="text-muted-foreground text-xs">{selectedPet.breed}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${petDropdown ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <p className="text-muted-foreground text-sm py-2">Hãy đăng ký thú cưng trong mục Hồ sơ.</p>
                )}
                {petDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-xl z-20 overflow-hidden">
                    {pets.map((pet) => (
                      <button
                        key={pet.id}
                        onClick={() => { setSelectedPet(pet); setPetDropdown(false); }}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary transition-colors"
                      >
                        <span className="text-xl">{pet.emoji}</span>
                        <div className="text-left flex-1">
                          <p className="text-foreground font-medium text-sm">{pet.name}</p>
                          <p className="text-muted-foreground text-xs">{pet.breed}</p>
                        </div>
                        {selectedPet?.id === pet.id && <Check className="w-4 h-4 text-accent" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dịch vụ */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Dịch vụ Spa</label>
              <div className="space-y-2">
                {dbServices.map((svc) => {
                  const active = selectedServices.includes(svc.id);
                  return (
                    <button
                      key={svc.id}
                      onClick={() => toggleService(svc.id)}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border transition-all text-left ${
                        active ? "border-primary bg-orange-50 shadow-sm" : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <span className="text-xl w-8 text-center">{svc.icon}</span>
                      <div className="flex-1">
                        <p className="text-foreground font-medium text-sm">{svc.name}</p>
                        <p className="text-muted-foreground text-xs">{svc.duration}</p>
                      </div>
                      <span className="text-foreground font-semibold text-sm">{fmt(svc.price)}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${active ? "border-accent bg-accent" : "border-border"}`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hình thức giao nhận */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Hình thức giao nhận</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: "self", label: "Tự mang đến cửa hàng", icon: <Store className="w-4 h-4" />, sub: "Miễn phí" },
                  { key: "pickup", label: "Cửa hàng đến lấy", icon: <Truck className="w-4 h-4" />, sub: "+30.000đ" },
                ] as const).map(({ key, label, icon, sub }) => (
                  <button
                    key={key}
                    onClick={() => setPickup(key)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left ${
                      pickup === key ? "border-accent bg-orange-50 text-accent" : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {icon}
                    <div>
                      <p className="text-sm font-medium leading-tight">{label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voucher */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Mã giảm giá</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-2xl px-4 focus-within:border-primary transition-colors">
                  <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                    placeholder="Nhập mã voucher"
                    className="flex-1 bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-6 py-3.5 rounded-2xl bg-secondary text-foreground text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Áp dụng
                </button>
              </div>
              {appliedVoucher && (
                <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đã áp dụng mã: {appliedVoucher.ma_voucher} (Giảm {appliedVoucher.voucher.loai_giam === "Phan tram" ? `${Number(appliedVoucher.voucher.gia_tri_giam)}%` : fmt(Number(appliedVoucher.voucher.gia_tri_giam))})
                </p>
              )}
            </div>
          </div>

          {/* Right column — date, time, summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Ngày */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Ngày hẹn</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-card border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Giờ */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 block">Giờ hẹn</label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedTime === t ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Tóm tắt */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h4 className="text-foreground font-semibold text-sm">Tóm tắt đặt lịch</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thú cưng</span>
                  <span className="text-foreground font-medium">{selectedPet?.name || "Chưa chọn"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày & Giờ</span>
                  <span className="text-foreground font-medium">{selectedDate} · {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedServices.length} dịch vụ</span>
                  <span className="text-foreground font-medium">{fmt(total)}</span>
                </div>
                {pickupFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí đến lấy</span>
                    <span className="text-foreground font-medium">{fmt(pickupFee)}</span>
                  </div>
                )}
                {appliedVoucher && discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giảm giá</span>
                    <span className="text-emerald-600 font-medium">−{fmt(discountAmount)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-foreground font-semibold">Tổng cộng</span>
                <span className="text-accent font-bold text-lg">
                  {fmt(total + pickupFee - discountAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={handleBookSpa}
              className="w-full py-4 rounded-2xl font-semibold text-primary-foreground text-base transition-all hover:opacity-90 active:scale-[0.99] shadow-md shadow-orange-200"
              style={{ background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
            >
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3 — Giỏ hàng ─────────────────────────────────────────────────────
function CartScreen({ items, setItems, headers }: { items: CartItem[]; setItems: React.Dispatch<React.SetStateAction<CartItem[]>>; headers: any }) {
  const [shipping, setShipping] = useState<"standard" | "express" | "spa">("standard");
  const [voucher, setVoucher] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);

  const updateQty = async (id: string, delta: number) => {
    const existing = items.find((i) => i.id === id);
    if (!existing) return;
    const newQty = existing.qty + delta;

    const res = await fetch(`${API_BASE}/cart/${id}`, {
      method: newQty <= 0 ? "DELETE" : "PUT",
      headers,
      body: newQty <= 0 ? undefined : JSON.stringify({ so_luong: newQty })
    });

    if (res.ok) {
      const reloadRes = await fetch(`${API_BASE}/cart`, { headers });
      if (reloadRes.ok) {
        const data = await reloadRes.json();
        if (Array.isArray(data)) {
          setItems(data.map((item: any) => ({
            id: item.ma_sp,
            name: item.san_pham.ten_sp,
            price: Number(item.san_pham.gia_ban),
            qty: item.so_luong,
            emoji: getProductEmoji(item.ma_sp),
            category: getProductCategoryLabel(item.san_pham.mo_ta)
          })));
        }
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    const res = await fetch(`${API_BASE}/cart/${id}`, {
      method: "DELETE",
      headers
    });
    if (res.ok) {
      const reloadRes = await fetch(`${API_BASE}/cart`, { headers });
      if (reloadRes.ok) {
        const data = await reloadRes.json();
        if (Array.isArray(data)) {
          setItems(data.map((item: any) => ({
            id: item.ma_sp,
            name: item.san_pham.ten_sp,
            price: Number(item.san_pham.gia_ban),
            qty: item.so_luong,
            emoji: getProductEmoji(item.ma_sp),
            category: getProductCategoryLabel(item.san_pham.mo_ta)
          })));
        }
      }
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucher.trim()) {
      alert("Vui lòng nhập mã giảm giá.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/vouchers`, { headers });
      if (res.ok) {
        const walletVouchers = await res.json();
        const codeUpper = voucher.trim().toUpperCase();
        const matched = walletVouchers.find((item: any) => item.ma_voucher === codeUpper);
        if (matched) {
          const now = new Date();
          const v = matched.voucher;
          if (matched.so_luot_con <= 0) {
            alert("Mã giảm giá này đã hết lượt sử dụng trong ví.");
            setAppliedVoucher(null);
            return;
          }
          if (new Date(v.han_su_dung) < now) {
            alert("Mã giảm giá này đã hết hạn.");
            setAppliedVoucher(null);
            return;
          }
          if (subtotal < Number(v.don_toi_thieu)) {
            alert(`Đơn hàng chưa đạt giá trị tối thiểu ${Number(v.don_toi_thieu).toLocaleString()}đ để áp dụng mã.`);
            setAppliedVoucher(null);
            return;
          }
          setAppliedVoucher(matched);
          alert("Áp dụng mã giảm giá thành công!");
        } else {
          alert("Mã giảm giá không tồn tại trong ví của bạn. Vui lòng nhận voucher tại Ví Voucher trước.");
          setAppliedVoucher(null);
        }
      } else {
        alert("Không thể kiểm tra ví voucher.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi áp dụng mã giảm giá.");
    }
  };

  const handleCheckoutCart = async () => {
    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    const orderItems = items.map((item) => ({
      ma_sp: item.id,
      so_luong: item.qty
    }));

    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        items: orderItems,
        ma_pt_giao: shipping === "standard" ? "PTG00002" : shipping === "express" ? "PTG00002" : "PTG00003",
        ma_voucher: appliedVoucher ? appliedVoucher.ma_voucher : undefined,
        ten_nguoi_nhan: "Nguyen Thi Lan",
        sdt_nguoi_nhan: "0901234567",
        dia_chi_nhan: "12 Le Loi, Quan 1, TP.HCM"
      })
    });

    if (res.ok) {
      alert("Đặt mua sản phẩm thành công! Hãy qua mục Lịch sử / Thanh toán.");
      setItems([]);
      setAppliedVoucher(null);
      setVoucher("");
    } else {
      const err = await res.json();
      alert(`Lỗi đặt mua: ${err.error}`);
    }
  };

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const shippingFee = shipping === "express" ? 40000 : shipping === "spa" ? 0 : 25000;
  
  let discount = 0;
  if (appliedVoucher) {
    const v = appliedVoucher.voucher;
    if (subtotal >= Number(v.don_toi_thieu)) {
      if (v.loai_giam === "Phan tram") {
        discount = Math.round(subtotal * (Number(v.gia_tri_giam) / 100));
        if (v.muc_giam_toi_da && discount > Number(v.muc_giam_toi_da)) {
          discount = Number(v.muc_giam_toi_da);
        }
      } else {
        discount = Number(v.gia_tri_giam);
      }
      if (discount > subtotal) discount = subtotal;
    }
  }

  const total = subtotal + shippingFee - discount;

  const SHIP_OPTIONS = [
    { key: "standard", label: "Giao hàng tiêu chuẩn", eta: "2–3 ngày", fee: 25000, icon: "📦" },
    { key: "express", label: "Giao hàng nhanh", eta: "Trong ngày", fee: 40000, icon: "⚡" },
    { key: "spa", label: "Giao cùng lịch Spa", eta: "Miễn phí vận chuyển", fee: 0, icon: "🌿" },
  ] as const;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — item list */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-foreground font-semibold mb-4">Sản phẩm ({items.length})</h3>
            {items.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #FDE68A, #FCA757)" }}
                >
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {item.category}
                  </span>
                  <p className="text-foreground font-semibold text-sm mt-1.5 leading-tight">{item.name}</p>
                  <p className="text-accent font-bold mt-1">{fmt(item.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2.5 bg-secondary rounded-xl px-3 py-1.5">
                    <button onClick={() => updateQty(item.id, -1)} className="text-muted-foreground hover:text-foreground">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-foreground font-bold text-sm w-5 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="text-muted-foreground hover:text-foreground">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — shipping + summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Phương thức vận chuyển */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">Phương thức vận chuyển</h3>
              <div className="space-y-2">
                {SHIP_OPTIONS.map(({ key, label, eta, fee, icon }) => (
                  <button
                    key={key}
                    onClick={() => setShipping(key)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all ${
                      shipping === key
                        ? key === "spa"
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-primary bg-orange-50"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      shipping === key ? (key === "spa" ? "border-emerald-500 bg-emerald-500" : "border-accent bg-accent") : "border-border"
                    }`}>
                      {shipping === key && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xl">{icon}</span>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${key === "spa" ? "text-emerald-700" : "text-foreground"}`}>{label}</p>
                      <p className="text-muted-foreground text-xs">{eta}</p>
                    </div>
                    <span className={`font-bold text-sm ${fee === 0 ? "text-emerald-600" : "text-foreground"}`}>
                      {fee === 0 ? "MIỄN PHÍ" : fmt(fee)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mã giảm giá */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">Mã giảm giá</h3>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-2xl px-4 focus-within:border-primary transition-colors">
                  <Tag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <input
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                    placeholder="Nhập mã voucher"
                    className="flex-1 bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground uppercase"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-5 py-3 rounded-2xl bg-secondary text-foreground text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Áp dụng
                </button>
              </div>
              {appliedVoucher && (
                <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Đã áp dụng mã: {appliedVoucher.ma_voucher} (Giảm {appliedVoucher.voucher.loai_giam === "Phan tram" ? `${Number(appliedVoucher.voucher.gia_tri_giam)}%` : fmt(Number(appliedVoucher.voucher.gia_tri_giam))})
                </p>
              )}
            </div>

            {/* Chi tiết giá */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h4 className="text-foreground font-semibold">Chi tiết đơn hàng</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính ({items.reduce((a, i) => a + i.qty, 0)} sản phẩm)</span>
                  <span className="text-foreground">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className={shippingFee === 0 ? "text-emerald-600 font-semibold" : "text-foreground"}>
                    {shippingFee === 0 ? "MIỄN PHÍ" : fmt(shippingFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giảm giá</span>
                    <span className="text-emerald-600 font-semibold">−{fmt(discount)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-foreground font-semibold">Tổng cộng</span>
                <span className="text-accent font-bold text-xl">{fmt(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutCart}
              className="w-full py-4 rounded-2xl font-semibold text-primary-foreground text-base transition-all hover:opacity-90 shadow-md shadow-orange-200"
              style={{ background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4 — Thanh toán ────────────────────────────────────────────────────
function CheckoutScreen({ headers, user }: { headers: any; user: any }) {
  const [selectedSpa, setSelectedSpa] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [payMethod, setPayMethod] = useState("vnpay");
  const [spaItems, setSpaItems] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Checkout address details states
  const [checkoutName, setCheckoutName] = useState(user?.name || "Khách hàng");
  const [checkoutPhone, setCheckoutPhone] = useState(user?.phone || "");
  const [checkoutAddress, setCheckoutAddress] = useState(user?.address || "");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setCheckoutName(user.name || "Khách hàng");
      setCheckoutPhone(user.phone || "");
      setCheckoutAddress(user.address || "");
    }
  }, [user]);

  const fetchPending = () => {
    fetch(`${API_BASE}/invoices/pending`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.spa && Array.isArray(data.spa)) {
          const mappedSpa = data.spa.map((s: any) => ({
            id: s.ma_dat_lich,
            pet: `${s.thu_cung.ten_thu_cung} ${s.thu_cung.loai === "cat" ? "🐱" : "🐶"}`,
            service: s.dich_vu.ten_dich_vu,
            date: `${s.ngay_hen.split("T")[0]} · ${s.gio_hen.split("T")[1]?.slice(0, 5) || ""}`,
            price: Number(s.thanh_tien)
          }));
          setSpaItems(mappedSpa);
          setSelectedSpa(mappedSpa.map((x: any) => x.id));
        }

        if (data.orders && Array.isArray(data.orders)) {
          const mappedOrders = data.orders.map((o: any) => ({
            id: o.ma_don_hang,
            name: o.chi_tiet_don_hang.map((d: any) => d.san_pham.ten_sp).join(" + "),
            price: Number(o.thanh_tien)
          }));
          setOrderItems(mappedOrders);
          setSelectedOrders(mappedOrders.map((x: any) => x.id));
        }
      })
      .catch((err) => console.log("Lỗi tải danh sách thanh toán:", err));
  };

  useEffect(() => {
    fetchPending();
  }, [headers]);

  const toggleSpa = (id: string) =>
    setSelectedSpa((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleOrder = (id: string) =>
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const PAYMENT = [
    { id: "vnpay", label: "VNPAY", icon: "💳", desc: "QR / Thẻ ATM" },
    { id: "credit", label: "Thẻ tín dụng", icon: "🏦", desc: "Visa / Mastercard" },
    { id: "cash", label: "Tiền mặt", icon: "💵", desc: "Thanh toán khi nhận" },
  ];

  const spaTotal = spaItems.filter((s) => selectedSpa.includes(s.id)).reduce((a, s) => a + s.price, 0);
  const orderTotal = orderItems.filter((o) => selectedOrders.includes(o.id)).reduce((a, o) => a + o.price, 0);
  const grand = spaTotal + orderTotal;

  const handlePay = async () => {
    if (selectedSpa.length === 0 && selectedOrders.length === 0) {
      alert("Vui lòng chọn mục cần thanh toán!");
      return;
    }

    const res = await fetch(`${API_BASE}/invoices/pay`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        spaIds: selectedSpa,
        orderIds: selectedOrders,
        ma_pttt: payMethod === "cash" ? "PTT00001" : payMethod === "vnpay" ? "PTT00002" : "PTT00003"
      })
    });

    if (res.ok) {
      alert(`Thanh toán hóa đơn gộp thành công! Tổng cộng: ${fmt(grand)}`);
      fetchPending();
    } else {
      const err = await res.json();
      alert(`Thanh toán thất bại: ${err.error}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — items */}
          <div className="lg:col-span-3 space-y-6">
            {/* Lịch Spa */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scissors className="w-4 h-4 text-accent" />
                <h3 className="text-foreground font-semibold">Lịch hẹn Spa</h3>
              </div>
              {spaItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">Không có lịch hẹn cần thanh toán</p>
              ) : (
                <div className="space-y-2">
                  {spaItems.map((spa) => (
                    <div
                      key={spa.id}
                      onClick={() => toggleSpa(spa.id)}
                      className={`flex gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                        selectedSpa.includes(spa.id) ? "border-primary bg-orange-50" : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedSpa.includes(spa.id) ? "border-accent bg-accent" : "border-border"
                      }`}>
                        {selectedSpa.includes(spa.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-foreground font-semibold text-sm">{spa.service}</p>
                          <span className="text-foreground font-bold">{fmt(spa.price)}</span>
                        </div>
                        <p className="text-muted-foreground text-xs mb-1.5">{spa.pet}</p>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs">{spa.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Đơn hàng */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-accent" />
                <h3 className="text-foreground font-semibold">Đơn hàng cửa hàng</h3>
              </div>
              {orderItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">Không có đơn hàng cần thanh toán</p>
              ) : (
                <div className="space-y-2">
                  {orderItems.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => toggleOrder(order.id)}
                      className={`flex gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                        selectedOrders.includes(order.id) ? "border-primary bg-orange-50" : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedOrders.includes(order.id) ? "border-accent bg-accent" : "border-border"
                      }`}>
                        {selectedOrders.includes(order.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <p className="text-foreground font-semibold text-sm">{order.name}</p>
                        <span className="text-foreground font-bold">{fmt(order.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Địa chỉ giao hàng */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">Địa chỉ giao hàng</h3>
              {isEditingAddress ? (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1 block">Tên người nhận</label>
                    <input
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full bg-input-background border border-border rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1 block">Số điện thoại</label>
                    <input
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full bg-input-background border border-border rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-semibold mb-1 block">Địa chỉ nhận hàng</label>
                    <input
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full bg-input-background border border-border rounded-xl px-4 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white animate-none"
                      style={{ background: "#FB923C" }}
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => {
                        setCheckoutName(user?.name || "");
                        setCheckoutPhone(user?.phone || "");
                        setCheckoutAddress(user?.address || "");
                        setIsEditingAddress(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-border text-foreground hover:bg-muted"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold text-sm">
                      {checkoutName} · {checkoutPhone}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {checkoutAddress || "Chưa có địa chỉ giao hàng. Vui lòng bấm Thay đổi."}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="ml-auto text-accent text-sm font-semibold hover:opacity-70 transition-opacity"
                  >
                    Thay đổi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right — payment + summary */}
          <div className="lg:col-span-2 space-y-5">
            {/* Phương thức thanh toán */}
            <div>
              <h3 className="text-foreground font-semibold mb-3">Phương thức thanh toán</h3>
              <div className="space-y-2">
                {PAYMENT.map(({ id, label, icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setPayMethod(id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all text-left ${
                      payMethod === id ? "border-accent bg-orange-50 shadow-sm" : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${payMethod === id ? "text-accent" : "text-foreground"}`}>{label}</p>
                      <p className="text-muted-foreground text-xs">{desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      payMethod === id ? "border-accent bg-accent" : "border-border"
                    }`}>
                      {payMethod === id && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tổng kết */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h4 className="text-foreground font-semibold">Tổng kết thanh toán</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dịch vụ Spa ({selectedSpa.length})</span>
                  <span className="text-foreground">{fmt(spaTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đơn hàng ({selectedOrders.length})</span>
                  <span className="text-foreground">{fmt(orderTotal)}</span>
                </div>
              </div>
              <div
                className="border-t border-border pt-4 rounded-xl p-4 mt-2"
                style={{ background: "linear-gradient(135deg, #FEF3C7, #FDBA7430)" }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-bold text-base">Tổng thanh toán</span>
                  <span className="text-accent font-bold text-2xl">{fmt(grand)}</span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {selectedSpa.length} lịch spa · {selectedOrders.length} đơn hàng
                </p>
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg shadow-orange-200 transition-all hover:opacity-90 active:scale-[0.99]"
              style={{ background: "linear-gradient(135deg, #FDBA74, #F97316)" }}
            >
              Thanh toán ngay · {fmt(grand)}
            </button>

            <p className="text-center text-muted-foreground text-xs">
              🔒 Giao dịch được bảo mật bởi SSL 256-bit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 5 — Lịch sử ──────────────────────────────────────────────────────
function HistoryScreen({ headers }: { headers: any }) {
  const [tab, setTab] = useState<"spa" | "orders">("spa");
  const [spaHistory, setSpaHistory] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const spaRes = await fetch(`${API_BASE}/spa/bookings`, { headers });
    if (spaRes.ok) {
      const data = await spaRes.json();
      if (Array.isArray(data)) {
        setSpaHistory(data.map((s: any) => ({
          id: s.ma_dat_lich,
          pet: `${s.thu_cung.ten_thu_cung} ${s.thu_cung.loai === "cat" ? "🐱" : "🐶"}`,
          service: s.dich_vu.ten_dich_vu,
          date: `${s.ngay_hen.split("T")[0]} · ${s.gio_hen.split("T")[1]?.slice(0, 5) || ""}`,
          price: Number(s.thanh_tien),
          status: mapStatusToUI(s.trang_thai)
        })));
      }
    }

    const orderRes = await fetch(`${API_BASE}/orders`, { headers });
    if (orderRes.ok) {
      const data = await orderRes.json();
      if (Array.isArray(data)) {
        setOrderHistory(data.map((o: any) => ({
          id: o.ma_don_hang,
          name: o.chi_tiet_don_hang.map((d: any) => d.san_pham.ten_sp).join(" + "),
          date: o.ngay_dat.split("T")[0],
          total: Number(o.thanh_tien),
          status: mapStatusToUI(o.trang_thai),
          items: o.chi_tiet_don_hang.length
        })));
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [headers]);

  const handleCancelSpa = async (id: string) => {
    const res = await fetch(`${API_BASE}/spa/bookings/${id}/cancel`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ ly_do_huy: "Khách tự hủy trên giao diện" })
    });
    if (res.ok) {
      alert("Đã hủy lịch spa thành công!");
      fetchHistory();
    } else {
      const err = await res.json();
      alert(`Hủy lịch spa thất bại: ${err.error}`);
    }
  };

  const handleCancelOrder = async (id: string) => {
    const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ ly_do_huy: "Khách tự hủy trên giao diện" })
    });
    if (res.ok) {
      alert("Đã hủy đơn hàng thành công!");
      fetchHistory();
    } else {
      const err = await res.json();
      alert(`Hủy đơn hàng thất bại: ${err.error}`);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Tabs */}
        <div className="flex bg-secondary rounded-2xl p-1 gap-1 mb-6 max-w-md">
          {([
            { key: "spa", label: "Lịch hẹn Spa", icon: <Scissors className="w-4 h-4" /> },
            { key: "orders", label: "Đơn hàng", icon: <Package className="w-4 h-4" /> },
          ] as const).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
                tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Spa history */}
        {tab === "spa" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spaHistory.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-foreground font-semibold">{item.service}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">{item.pet}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{item.date}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-foreground font-bold text-base">{fmt(item.price)}</span>
                  {(item.status === "Chờ xác nhận" || item.status === "Chờ thanh toán") && (
                    <button
                      onClick={() => handleCancelSpa(item.id)}
                      className="text-rose-500 text-sm font-semibold hover:text-rose-600 transition-colors underline underline-offset-2"
                    >
                      Huỷ lịch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order history */}
        {tab === "orders" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orderHistory.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-foreground font-semibold">{item.name}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">{item.items} sản phẩm</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">{item.date}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-foreground font-bold text-base">{fmt(item.total)}</span>
                  {item.status === "Chờ xác nhận" && (
                    <button
                      onClick={() => handleCancelOrder(item.id)}
                      className="text-rose-500 text-sm font-semibold hover:text-rose-600 transition-colors underline underline-offset-2"
                    >
                      Huỷ đơn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen 6 — Ví Voucher ───────────────────────────────────────────────────
function VoucherScreen({ headers }: { headers: any }) {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"unused" | "expired">("unused");

  const fetchVouchers = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/vouchers`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setVouchers(data);
        }
      }
    } catch (err) {
      console.error("Lỗi tải ví voucher:", err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [headers]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép mã: ${text}`);
  };

  // Filter vouchers
  const now = new Date();
  const unusedVouchers = vouchers.filter(item => {
    const expiry = new Date(item.voucher.han_su_dung);
    return item.so_luot_con > 0 && expiry >= now;
  });

  const expiredVouchers = vouchers.filter(item => {
    const expiry = new Date(item.voucher.han_su_dung);
    return item.so_luot_con <= 0 || expiry < now;
  });

  const displayList = activeTab === "unused" ? unusedVouchers : expiredVouchers;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        


        {/* Tabs for Vouchers */}
        <div className="flex bg-secondary rounded-2xl p-1 gap-1 mb-6 max-w-md">
          <button
            onClick={() => setActiveTab("unused")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "unused"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wallet className="w-4 h-4" />
            Khả dụng ({unusedVouchers.length})
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "expired"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4" />
            Lịch sử / Hết hạn ({expiredVouchers.length})
          </button>
        </div>

        {/* Voucher Cards list */}
        {displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-3xl">
            <span className="text-5xl mb-4">🎟️</span>
            <p className="text-foreground font-semibold">Chưa có voucher nào</p>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTab === "unused" 
                ? "Voucher do hệ thống tự động phát tặng dựa trên điều kiện của bạn sẽ hiển thị tại đây" 
                : "Lịch sử dùng voucher hoặc voucher hết hạn sẽ hiển thị ở đây"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayList.map((item) => {
              const v = item.voucher;
              const isUnused = activeTab === "unused";
              const isPercent = v.loai_giam === "Phan tram";
              const valFmt = isPercent ? `${Number(v.gia_tri_giam)}%` : fmt(Number(v.gia_tri_giam));
              const expiryStr = new Date(v.han_su_dung).toLocaleDateString("vi-VN");

              return (
                <div 
                  key={v.ma_voucher}
                  className={`relative flex bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                    !isUnused ? "opacity-75" : ""
                  }`}
                >
                  {/* Left coupon ticket thumb */}
                  <div 
                    className="w-24 flex-shrink-0 flex flex-col items-center justify-center text-white p-3 relative"
                    style={{ background: isUnused ? "linear-gradient(135deg, #FDBA74, #FB923C)" : "linear-gradient(135deg, #9CA3AF, #6B7280)" }}
                  >
                    <div className="text-2xl mb-1">
                      {isPercent ? <Percent className="w-7 h-7" /> : <BadgeDollarSign className="w-7 h-7" />}
                    </div>
                    <span className="font-extrabold text-sm text-center">{valFmt}</span>
                    <span className="text-[9px] opacity-80 uppercase mt-0.5 tracking-wider">OFF</span>
                    
                    {/* Dotted border on the right of the thumb */}
                    <div className="absolute right-0 top-0 bottom-0 border-r border-dashed border-white/50 w-0" />
                  </div>

                  {/* Right coupon content */}
                  <div className="p-5 flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-mono font-bold text-accent text-sm tracking-wider uppercase bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                          {v.ma_voucher}
                        </span>
                        {isUnused && (
                          <button
                            onClick={() => copyToClipboard(v.ma_voucher)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            title="Sao chép mã"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      <h4 className="text-foreground font-bold text-sm truncate mb-1">
                        Giảm {valFmt} {v.muc_giam_toi_da ? `(Tối đa ${fmt(Number(v.muc_giam_toi_da))})` : ""}
                      </h4>
                      
                      <p className="text-muted-foreground text-xs leading-normal">
                        • Đơn tối thiểu: <span className="font-semibold text-foreground">{fmt(Number(v.don_toi_thieu))}</span>
                      </p>
                      {v.dieu_kien_kich_hoat && (
                        <p className="text-muted-foreground text-xs leading-normal">
                          • Điều kiện: <span className="font-semibold text-accent">{v.dieu_kien_kich_hoat}</span>
                        </p>
                      )}
                      <p className="text-muted-foreground text-xs leading-normal">
                        • Lượt còn lại: <span className="font-semibold text-foreground">{item.so_luot_con} lần</span>
                      </p>
                    </div>

                    <div className="border-t border-border mt-3 pt-2 flex items-center justify-between">
                      <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Hạn dùng: {expiryStr}
                      </span>
                      {isUnused ? (
                        <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Sẵn sàng dùng
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px] font-semibold">
                          Không khả dụng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Left & Right card cut-outs */}
                  <div className="absolute left-24 -top-2 w-4 h-4 bg-background border-b border-border rounded-full" />
                  <div className="absolute left-24 -bottom-2 w-4 h-4 bg-background border-t border-border rounded-full" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [screen, setScreen] = useState<Screen>("profile");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartBadge, setCartBadge] = useState(0);

  const headers = {
    "Content-Type": "application/json",
    "x-user-id": currentUser?.id || "KH000001",
    "x-role": currentUser?.role || "customer"
  };

  const refreshCart = () => {
    if (!currentUser) return;
    fetch(`${API_BASE}/cart`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map((item: any) => ({
            id: item.ma_sp,
            name: item.san_pham.ten_sp,
            price: Number(item.san_pham.gia_ban),
            qty: item.so_luong,
            emoji: getProductEmoji(item.ma_sp),
            category: getProductCategoryLabel(item.san_pham.mo_ta)
          }));
          setCartItems(mapped);
        }
      })
      .catch((err) => console.log("Lỗi tải giỏ hàng:", err));
  };

  useEffect(() => {
    refreshCart();
  }, [currentUser]);

  const handleAddToCart = async (product: any) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập trước.");
      return;
    }
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ma_sp: product.id, so_luong: 1 })
    });
    if (res.ok) {
      refreshCart();
      setCartBadge((n) => n + 1);
    } else {
      const err = await res.json();
      alert(`Thêm vào giỏ hàng thất bại: ${err.error}`);
    }
  };

  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);

  const SCREENS: Record<Screen, JSX.Element> = {
    profile: <ProfileScreen headers={headers} user={currentUser} onUserUpdate={(updatedUser: any) => setCurrentUser(updatedUser)} />,
    store: <StoreScreen onAddToCart={handleAddToCart} />,
    spa: <SpaBookingScreen headers={headers} />,
    cart: <CartScreen items={cartItems} setItems={setCartItems} headers={headers} />,
    checkout: <CheckoutScreen headers={headers} user={currentUser} />,
    history: <HistoryScreen headers={headers} />,
    voucher: <VoucherScreen headers={headers} />,
  };

  // If user is not logged in, render AuthScreen
  if (!currentUser) {
    return <AuthScreen onAuthenticated={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 md:w-56 flex-shrink-0 flex flex-col border-r border-border bg-card transition-all duration-200">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, #FDBA74, #FB923C)" }}
            >
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <span className="font-bold text-foreground text-lg leading-none">Petto</span>
              <p className="text-muted-foreground text-[10px] mt-0.5">Pet Shop & Spa</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ id, label, Icon }) => {
            const active = screen === id;
            const isCart = id === "cart";
            
            // Limit navigation screens for staff role
            if (currentUser.role === "staff" && (id === "spa" || id === "cart" || id === "checkout" || id === "voucher")) {
              return null;
            }

            return (
              <button
                key={id}
                onClick={() => setScreen(id as Screen)}
                className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                style={active ? { background: "linear-gradient(135deg, #FDBA74, #FB923C)" } : {}}
                title={label}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-4 h-4" />
                  {isCart && cartCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                      style={{ background: "#FB923C" }}
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0">
              👩
            </div>
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-foreground font-semibold text-xs truncate">{currentUser.name}</p>
              <p className="text-muted-foreground text-[10px] capitalize">🥇 {currentUser.role}</p>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              className="text-muted-foreground hover:text-destructive transition-colors ml-auto hidden md:block"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          {/* Mobile Logout Button */}
          <button
            onClick={() => setCurrentUser(null)}
            className="flex md:hidden w-full items-center justify-center py-2 text-muted-foreground hover:text-destructive transition-colors mt-2"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-4 border-b border-border bg-card/60 backdrop-blur-sm">
          <div>
            <h1 className="text-foreground font-bold text-lg md:text-xl">{SCREEN_TITLES[screen]}</h1>
            <p className="text-muted-foreground text-[10px] md:text-xs mt-0.5">Petto · Pet Shop & Spa</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center font-bold"
                style={{ background: "#FB923C" }}
              >
                3
              </span>
            </button>
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center text-lg shadow-sm"
              style={{ background: "linear-gradient(135deg, #FDE68A, #FDBA74)" }}
            >
              👩
            </div>
          </div>
        </header>

        {/* Screen */}
        <main className="flex-1 overflow-hidden">{SCREENS[screen]}</main>
      </div>
    </div>
  );
}
