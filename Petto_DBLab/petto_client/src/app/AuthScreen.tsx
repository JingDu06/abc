import { useState } from "react";
import { Eye, EyeOff, PawPrint, ArrowRight, Phone, Lock, User, Mail, ChevronLeft } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// ─── Stripe background shared by both screens ─────────────────────────────────
const STRIPE_BG: React.CSSProperties = {
  backgroundImage: `repeating-linear-gradient(
    -55deg,
    #FB923C 0px,
    #FB923C 18px,
    #F5EDD8 18px,
    #F5EDD8 42px
  )`,
};

const CARD_STYLE: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif",
  background: "#FFFDF5",
  border: "3px solid #3D2C1E",
  boxShadow: "6px 6px 0px #3D2C1E",
};

const STAMP_STYLE: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif",
};

// ─── Reusable vintage input ───────────────────────────────────────────────────
function VintageInput({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  suffix,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs font-bold uppercase tracking-[0.15em] mb-1.5"
        style={{ color: "#3D2C1E" }}
      >
        {label}
      </label>
      <div
        className="flex items-center gap-3 px-4 py-3 transition-all"
        style={{
          background: "#FEF9EE",
          border: "2px solid #3D2C1E",
          boxShadow: "3px 3px 0 #3D2C1E",
        }}
      >
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#FB923C" }} />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
          style={{ color: "#3D2C1E", fontFamily: "'Poppins', sans-serif" }}
        />
        {suffix}
      </div>
    </div>
  );
}

// ─── Vintage decorative divider ───────────────────────────────────────────────
function VintageDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "#C4A882" }} />
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8B7355" }}>
        {text}
      </span>
      <div className="flex-1 h-px" style={{ background: "#C4A882" }} />
    </div>
  );
}

// ─── Login Form ─────────────────────────────────────────────────────────────
function LoginForm({ onLogin, onGoRegister, onGoForgot }: { onLogin: (user: any) => void; onGoRegister: () => void; onGoForgot: () => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      alert("Vui lòng nhập tài khoản và mật khẩu!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: phone, password }),
      });

      if (res.ok) {
        const data = await res.json();
        onLogin(data.user);
      } else {
        const err = await res.json();
        alert(err.error || "Đăng nhập thất bại");
      }
    } catch (e) {
      alert("Lỗi kết nối server. Hãy chắc chắn backend đang hoạt động.");
    }
  };

  return (
    <div>
      {/* Welcome text */}
      <div className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "#8B7355" }}>
          Chào mừng trở lại
        </p>
        <h2
          className="text-4xl font-bold leading-tight"
          style={{ ...STAMP_STYLE, color: "#3D2C1E" }}
        >
          Đăng nhập
        </h2>
        <p className="text-sm mt-2" style={{ color: "#8B7355" }}>
          Tiếp tục hành trình chăm sóc thú cưng của bạn
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <VintageInput
          label="Số điện thoại hoặc Email"
          type="text"
          placeholder="0901 234 567"
          value={phone}
          onChange={setPhone}
          icon={Phone}
        />
        <VintageInput
          label="Mật khẩu"
          type={showPw ? "text" : "password"}
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={setPassword}
          icon={Lock}
          suffix={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="flex-shrink-0 transition-opacity hover:opacity-60"
              style={{ color: "#8B7355" }}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
      </div>

      {/* Forgot */}
      <div className="text-right mt-3 mb-6">
        <button
          onClick={onGoForgot}
          className="text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
          style={{ color: "#FB923C" }}
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-3 py-4 font-bold text-base uppercase tracking-widest transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
        style={{
          background: "#FB923C",
          color: "#FFFDF5",
          border: "2px solid #3D2C1E",
          boxShadow: "4px 4px 0 #3D2C1E",
          fontFamily: "'Poppins', sans-serif",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "2px 2px 0 #3D2C1E";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 #3D2C1E";
        }}
      >
        Đăng nhập
        <ArrowRight className="w-5 h-5" />
      </button>




      {/* Switch */}
      <p className="text-center text-sm mt-6" style={{ color: "#8B7355" }}>
        Chưa có tài khoản?{" "}
        <button
          onClick={onGoRegister}
          className="font-bold underline underline-offset-2 hover:opacity-70 transition-opacity"
          style={{ color: "#3D2C1E" }}
        >
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
}

// ─── Register Form ──────────────────────────────────────────────────────────
function RegisterForm({ onRegisterSuccess, onGoLogin }: { onRegisterSuccess: () => void; onGoLogin: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !confirm) {
      alert("Vui lòng điền đầy đủ các thông tin đăng ký.");
      return;
    }

    if (password.length < 8) {
      alert("Mật khẩu phải chứa ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirm) {
      alert("Mật khẩu nhập lại không trùng khớp.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ho_ten: name,
          sdt: phone,
          email,
          mat_khau: password,
        }),
      });

      if (res.ok) {
        alert("Đăng ký thành công! Hãy đăng nhập để bắt đầu chăm sóc thú cưng.");
        onRegisterSuccess();
      } else {
        const err = await res.json();
        alert(err.error || "Đăng ký tài khoản thất bại");
      }
    } catch (e) {
      alert("Lỗi kết nối server.");
    }
  };

  return (
    <div>
      {/* Welcome text */}
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "#8B7355" }}>
          Bắt đầu hành trình
        </p>
        <h2
          className="text-4xl font-bold leading-tight"
          style={{ ...STAMP_STYLE, color: "#3D2C1E" }}
        >
          Đăng ký
        </h2>
        <p className="text-sm mt-2" style={{ color: "#8B7355" }}>
          Tạo tài khoản để chăm sóc thú cưng tốt hơn
        </p>
      </div>

      {/* Form */}
      <div className="space-y-3.5">
        <VintageInput label="Họ và tên" type="text" placeholder="Nguyễn Văn A" value={name} onChange={setName} icon={User} />
        <VintageInput label="Số điện thoại" type="tel" placeholder="0901 234 567" value={phone} onChange={setPhone} icon={Phone} />
        <VintageInput label="Email" type="email" placeholder="example@email.com" value={email} onChange={setEmail} icon={Mail} />
        <VintageInput
          label="Mật khẩu"
          type={showPw ? "text" : "password"}
          placeholder="Ít nhất 8 ký tự"
          value={password}
          onChange={setPassword}
          icon={Lock}
          suffix={
            <button type="button" onClick={() => setShowPw(!showPw)} className="flex-shrink-0 hover:opacity-60 transition-opacity" style={{ color: "#8B7355" }}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <VintageInput
          label="Xác nhận mật khẩu"
          type={showCf ? "text" : "password"}
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChange={setConfirm}
          icon={Lock}
          suffix={
            <button type="button" onClick={() => setShowCf(!showCf)} className="flex-shrink-0 hover:opacity-60 transition-opacity" style={{ color: "#8B7355" }}>
              {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
      </div>

      {/* Terms */}
      <button
        onClick={() => setAgreed(!agreed)}
        className="flex items-start gap-3 mt-5 text-left w-full cursor-pointer"
      >
        <div
          className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
          style={{
            border: "2px solid #3D2C1E",
            background: agreed ? "#FB923C" : "#FEF9EE",
          }}
        >
          {agreed && (
            <svg viewBox="0 0 10 8" className="w-3 h-3 fill-none stroke-white stroke-2">
              <polyline points="1,4 4,7 9,1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className="text-xs leading-relaxed" style={{ color: "#8B7355" }}>
          Tôi đồng ý với{" "}
          <span className="font-bold underline" style={{ color: "#3D2C1E" }}>Điều khoản sử dụng</span>
          {" "}và{" "}
          <span className="font-bold underline" style={{ color: "#3D2C1E" }}>Chính sách bảo mật</span>
          {" "}của Petto
        </span>
      </button>

      {/* CTA */}
      <button
        onClick={handleRegister}
        className="w-full flex items-center justify-center gap-3 py-4 font-bold text-base uppercase tracking-widest mt-5 transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
        style={{
          background: "#3D2C1E",
          color: "#FFFDF5",
          border: "2px solid #3D2C1E",
          boxShadow: "4px 4px 0 #FB923C",
          fontFamily: "'Poppins', sans-serif",
          opacity: agreed ? 1 : 0.5,
        }}
        disabled={!agreed}
        onMouseEnter={(e) => {
          if (agreed) (e.currentTarget as HTMLElement).style.boxShadow = "2px 2px 0 #FB923C";
        }}
        onMouseLeave={(e) => {
          if (agreed) (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 #FB923C";
        }}
      >
        Tạo tài khoản
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Switch */}
      <p className="text-center text-sm mt-5" style={{ color: "#8B7355" }}>
        Đã có tài khoản?{" "}
        <button
          onClick={onGoLogin}
          className="font-bold underline underline-offset-2 hover:opacity-70 transition-opacity"
          style={{ color: "#3D2C1E" }}
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}

// ─── Forgot Password Form ───────────────────────────────────────────────────
function ForgotForm({ onResetSuccess, onGoLogin }: { onResetSuccess: () => void; onGoLogin: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [expectedOtp, setExpectedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleVerify = async () => {
    if (!identifier) {
      alert("Vui lòng nhập số điện thoại hoặc email.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/verify-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      if (res.ok) {
        const data = await res.json();
        setExpectedOtp(data.otp);
        alert(`Gửi mã OTP thử nghiệm thành công! Mã OTP của bạn là: ${data.otp}`);
        setStep(2);
      } else {
        const err = await res.json();
        alert(err.error || "Không tìm thấy tài khoản.");
      }
    } catch (e) {
      alert("Lỗi kết nối server.");
    }
  };

  const handleReset = async () => {
    if (!otpCode || !newPassword || !confirmPassword) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (otpCode !== expectedOtp) {
      alert("Mã xác thực OTP không chính xác.");
      return;
    }

    if (newPassword.length < 8) {
      alert("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, newPassword }),
      });

      if (res.ok) {
        alert("Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.");
        onResetSuccess();
      } else {
        const err = await res.json();
        alert(err.error || "Đặt lại mật khẩu thất bại.");
      }
    } catch (e) {
      alert("Lỗi kết nối server.");
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "#8B7355" }}>
          Khôi phục tài khoản
        </p>
        <h2
          className="text-4xl font-bold leading-tight"
          style={{ ...STAMP_STYLE, color: "#3D2C1E" }}
        >
          Quên mật khẩu
        </h2>
        <p className="text-sm mt-2" style={{ color: "#8B7355" }}>
          {step === 1
            ? "Nhập số điện thoại hoặc email để nhận mã khôi phục"
            : "Tạo mật khẩu mới cho tài khoản của bạn"}
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <VintageInput
            label="Số điện thoại hoặc Email"
            type="text"
            placeholder="example@email.com hoặc 0901234567"
            value={identifier}
            onChange={setIdentifier}
            icon={Mail}
          />

          <button
            onClick={handleVerify}
            className="w-full flex items-center justify-center gap-3 py-4 font-bold text-base uppercase tracking-widest transition-all hover:translate-x-[2px] hover:translate-y-[2px] mt-6"
            style={{
              background: "#FB923C",
              color: "#FFFDF5",
              border: "2px solid #3D2C1E",
              boxShadow: "4px 4px 0 #3D2C1E",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Tiếp tục
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Linked account display */}
          <div
            className="p-3 text-xs font-bold uppercase tracking-wider text-center"
            style={{
              background: "#FEF9EE",
              border: "2px dashed #C4A882",
              color: "#3D2C1E",
            }}
          >
            Tài khoản khôi phục: <span style={{ color: "#FB923C" }}>{identifier}</span>
          </div>

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-[0.15em] mb-1"
              style={{ color: "#3D2C1E" }}
            >
              Mã xác nhận (OTP)
            </label>
            <div className="text-xs mb-2 text-amber-600 font-semibold font-mono">
              Nhập mã {expectedOtp} để tiếp tục
            </div>
            <VintageInput
              label=""
              type="text"
              placeholder="Nhập mã OTP"
              value={otpCode}
              onChange={setOtpCode}
              icon={Lock}
            />
          </div>

          <VintageInput
            label="Mật khẩu mới"
            type={showNewPw ? "text" : "password"}
            placeholder="Tối thiểu 8 ký tự"
            value={newPassword}
            onChange={setNewPassword}
            icon={Lock}
            suffix={
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="flex-shrink-0 hover:opacity-60 transition-opacity"
                style={{ color: "#8B7355" }}
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <VintageInput
            label="Xác nhận mật khẩu mới"
            type={showConfirmPw ? "text" : "password"}
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={setConfirmPassword}
            icon={Lock}
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className="flex-shrink-0 hover:opacity-60 transition-opacity"
                style={{ color: "#8B7355" }}
              >
                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-3 py-4 font-bold text-base uppercase tracking-widest transition-all hover:translate-x-[2px] hover:translate-y-[2px] mt-6"
            style={{
              background: "#3D2C1E",
              color: "#FFFDF5",
              border: "2px solid #3D2C1E",
              boxShadow: "4px 4px 0 #FB923C",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Đặt lại mật khẩu
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Switch */}
      <p className="text-center text-sm mt-6" style={{ color: "#8B7355" }}>
        Quay lại{" "}
        <button
          onClick={onGoLogin}
          className="font-bold underline underline-offset-2 hover:opacity-70 transition-opacity"
          style={{ color: "#3D2C1E" }}
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}

// ─── Auth wrapper ─────────────────────────────────────────────────────────────
export default function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: any) => void }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Left panel — stripes + branding */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative overflow-hidden"
        style={STRIPE_BG}
      >
        {/* Overlay to soften stripes */}
        <div className="absolute inset-0" style={{ background: "rgba(253, 246, 230, 0.18)" }} />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo stamp */}
          <div
            className="w-28 h-28 flex flex-col items-center justify-center mb-8 rotate-[-4deg]"
            style={{
              background: "#FFFDF5",
              border: "4px solid #3D2C1E",
              boxShadow: "6px 6px 0 #3D2C1E",
            }}
          >
            <PawPrint className="w-10 h-10 mb-1" style={{ color: "#FB923C" }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#3D2C1E" }}>
              Petto
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-6xl font-black leading-[1.05] mb-4"
            style={{ ...STAMP_STYLE, color: "#3D2C1E" }}
          >
            Pet Shop
            <br />
            <em className="not-italic" style={{ color: "#FFFDF5", WebkitTextStroke: "2px #3D2C1E" }}>
              & Spa
            </em>
          </h1>

          <p
            className="text-base font-medium max-w-xs leading-relaxed mb-10"
            style={{ color: "#3D2C1E" }}
          >
            Nơi thú cưng của bạn được yêu thương và chăm sóc tận tâm nhất.
          </p>

          {/* Feature tags */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: "🛁", text: "Dịch vụ Spa chuyên nghiệp" },
              { icon: "🛒", text: "Cửa hàng thú cưng đa dạng" },
              { icon: "📅", text: "Đặt lịch dễ dàng, tiện lợi" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  background: "#FFFDF5",
                  border: "2px solid #3D2C1E",
                  boxShadow: "3px 3px 0 #3D2C1E",
                }}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-semibold" style={{ color: "#3D2C1E" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Corner decoration */}
        <div
          className="absolute bottom-0 right-0 w-24 h-24 flex items-end justify-end p-3 text-4xl select-none opacity-60"
        >
          🐾
        </div>
        <div className="absolute top-4 left-4 text-3xl select-none opacity-40">🐾</div>
      </div>

      {/* Right panel — form */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto"
        style={{ background: "#FAF6EF" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{ background: "#FB923C", border: "2px solid #3D2C1E" }}
            >
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl" style={{ color: "#3D2C1E", fontFamily: "'Poppins', sans-serif" }}>
              Petto
            </span>
          </div>

          {/* Card */}
          <div className="p-8 relative" style={CARD_STYLE}>
            {/* Vintage corner ornament */}
            <div
              className="absolute -top-3 -right-3 w-14 h-14 flex items-center justify-center text-2xl rotate-12"
              style={{
                background: "#FB923C",
                border: "2px solid #3D2C1E",
              }}
            >
              🐾
            </div>

            {/* Back button (register or forgot only) */}
            {(mode === "register" || mode === "forgot") && (
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-5 hover:opacity-70 transition-opacity"
                style={{ color: "#8B7355" }}
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </button>
            )}

            {/* Tab pills (hidden in forgot mode) */}
            {mode !== "forgot" && (
              <div
                className="flex mb-6 p-1"
                style={{ background: "#EDE8DC", border: "2px solid #3D2C1E" }}
              >
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all"
                    style={{
                      background: mode === m ? "#3D2C1E" : "transparent",
                      color: mode === m ? "#FFFDF5" : "#8B7355",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {m === "login" ? "Đăng nhập" : "Đăng ký"}
                  </button>
                ))}
              </div>
            )}

            {mode === "login" ? (
              <LoginForm
                onLogin={onAuthenticated}
                onGoRegister={() => setMode("register")}
                onGoForgot={() => setMode("forgot")}
              />
            ) : mode === "register" ? (
              <RegisterForm onRegisterSuccess={() => setMode("login")} onGoLogin={() => setMode("login")} />
            ) : (
              <ForgotForm onResetSuccess={() => setMode("login")} onGoLogin={() => setMode("login")} />
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs mt-6" style={{ color: "#C4A882" }}>
            © 2026 Petto Pet Shop & Spa · Chăm sóc thú cưng tận tâm
          </p>
        </div>
      </div>
    </div>
  );
}
