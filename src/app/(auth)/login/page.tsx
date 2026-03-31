"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Users, Shield, Crown, ArrowRight,
  Mail, Loader2, RefreshCw, ChevronLeft, Zap,
  User, Phone,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// ROLE SELECTION CARDS
// ─────────────────────────────────────────────────────────────

const ROLES = [
  {
    id:       "participant",
    label:    "Participant",
    icon:     Users,
    desc:     "Explore events & build your portfolio",
    color:    "from-slate-600/20 to-slate-700/10",
    border:   "border-slate-600/40 hover:border-slate-400/60",
    iconBg:   "bg-slate-700/50",
    iconColor:"text-slate-300",
    glow:     "hover:shadow-slate-500/10",
  },
  {
    id:       "member",
    label:    "Member",
    icon:     Shield,
    desc:     "Create events & manage club activities",
    color:    "from-cyan-600/20 to-blue-700/10",
    border:   "border-cyan-600/40 hover:border-cyan-400/60",
    iconBg:   "bg-cyan-700/30",
    iconColor:"text-cyan-400",
    glow:     "hover:shadow-cyan-500/20",
    recommended: true,
  },
  {
    id:       "admin",
    label:    "Admin",
    icon:     Crown,
    desc:     "Full platform access & management",
    color:    "from-purple-600/20 to-indigo-700/10",
    border:   "border-purple-600/40 hover:border-purple-400/60",
    iconBg:   "bg-purple-700/30",
    iconColor:"text-purple-400",
    glow:     "hover:shadow-purple-500/20",
  },
] as const;

type RoleId = typeof ROLES[number]["id"];

// ─────────────────────────────────────────────────────────────
// OTP INPUT COMPONENT
// ─────────────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value:    string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;
    const digits   = value.split("");
    digits[index]  = digit.slice(-1);
    const newValue = digits.join("").slice(0, 6);
    onChange(newValue.padEnd(6, " ").slice(0, 6).trimEnd());
    // Auto-advance
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl outline-none
            transition-all duration-200 select-none
            ${value[i]
              ? "bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300"
              : "bg-navy-800 border-2 border-navy-700 text-white"
            }
            focus:border-cyan-400 focus:bg-cyan-500/10 focus:shadow-[0_0_12px_rgba(6,182,212,0.3)]
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN LOGIN PAGE
// ─────────────────────────────────────────────────────────────

type Step = "role" | "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step,       setStep]       = useState<Step>("role");
  const [role,       setRole]       = useState<RoleId>("participant");
  const [email,      setEmail]      = useState("");
  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [otp,        setOtp]        = useState("");
  const [loading,    setLoading]    = useState(false);
  const [cooldown,   setCooldown]   = useState(0);
  const [otpSentTo,  setOtpSentTo]  = useState("");
  const [nameError,  setNameError]  = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Countdown timer for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // ── Send OTP ────────────────────────────────────────────────
  const validateInputs = (): boolean => {
    let valid = true;
    setNameError("");
    setPhoneError("");
    if (!name.trim()) {
      setNameError("Full name is required");
      valid = false;
    }
    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      setPhoneError("Phone must be exactly 10 digits");
      valid = false;
    }
    return valid;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!validateInputs()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({
          email: email.toLowerCase().trim(),
          name:  name.trim(),
          phone: phone.trim(),
          role,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.retryAfter) {
          setCooldown(data.retryAfter);
          toast.error(`Please wait ${data.retryAfter}s before requesting another code.`);
        } else {
          toast.error(data.error ?? "Failed to send code. Try again.");
        }
        return;
      }

      setOtpSentTo(email.toLowerCase().trim());
      setCooldown(60);
      setStep("otp");
      toast.success("Login code sent! Check your email.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────
  const handleVerifyOtp = async (code: string) => {
    if (code.replace(/\s/g, "").length < 6) return;
    setLoading(true);

    // Get CSRF token for the verify request
    const csrfToken = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("csrf_token="))
      ?.split("=")[1];

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method:      "POST",
        credentials: "include",
        headers:     {
          "Content-Type": "application/json",
          ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        },
        body: JSON.stringify({
          email: otpSentTo,
          code:  code.replace(/\s/g, ""),
          name:  name.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Invalid code. Please try again.");
        if (res.status === 401) setOtp("");
        return;
      }

      toast.success(data.data?.message ?? "Welcome to NexCell!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    const clean = otp.replace(/\s/g, "");
    if (clean.length === 6) handleVerifyOtp(clean);
  }, [otp]);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.3) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.4) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.3) 0%, transparent 70%)" }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* ── LOGO ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/logo.png"
              alt="NexCell Logo"
              width={56}
              height={56}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">
                Nex<span className="gradient-text">Cell</span>
              </h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">
                Entrepreneurship Club
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Mirai School of Technology
          </p>
        </motion.div>

        {/* ── STEP: ROLE SELECTION ─────────────────────── */}
        <AnimatePresence mode="wait">
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card p-8 text-center">

                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome to NexCell 🚀
                </h2>

                <p className="text-sm text-slate-400 mb-8">
                  Login to continue to your dashboard
                </p>

                <button
                  onClick={() => setStep("email")}
                  className="btn-neon w-full flex items-center justify-center gap-2"
                >
                  Login
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </motion.div>
          )}

          {/* ── STEP: EMAIL ────────────────────────────── */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card p-6">
                <button
                  onClick={() => setStep("role")}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Enter your email</h2>
                    <p className="text-xs text-slate-400">We'll send a 6-digit login code</p>
                  </div>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setNameError(""); }}
                        placeholder="Your full name"
                        required
                        autoFocus
                        className="input-dark pl-10"
                      />
                    </div>
                    {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setPhoneError(""); }}
                        placeholder="10-digit phone number"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        className="input-dark pl-10"
                      />
                    </div>
                    {phoneError && <p className="text-xs text-red-400 mt-1">{phoneError}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="input-dark pl-10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !name.trim() || !phone.trim()}
                    className="btn-neon w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</>
                    ) : (
                      <>Send login code <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <p className="text-xs text-slate-600 text-center mt-5">
                  No password needed. A one-time code is sent to your email.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP: OTP ──────────────────────────────── */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card p-6">
                <button
                  onClick={() => { setStep("email"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Check your email</h2>
                    <p className="text-xs text-slate-400">Enter the 6-digit code we sent to</p>
                  </div>
                </div>

                <p className="text-sm font-medium text-cyan-400 mb-6 ml-14 truncate">
                  {otpSentTo}
                </p>

                <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 mt-5 text-sm text-slate-400"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    Verifying...
                  </motion.div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <p className="text-xs text-slate-500">Code expires in 5 minutes</p>
                  {cooldown > 0 ? (
                    <p className="text-xs text-slate-500">
                      Resend in <span className="text-cyan-400 font-medium tabular-nums">{cooldown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={() => { setStep("email"); setOtp(""); }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend code
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 text-center mt-5">
                  Didn't receive it? Check your spam folder.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-slate-600 mt-6"
        >
          © 2024 NexCell · Mirai School of Technology
        </motion.p>
      </div>
    </div>
  );
}