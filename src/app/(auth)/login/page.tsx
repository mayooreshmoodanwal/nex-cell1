"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Mail, Loader2, RefreshCw, ChevronLeft, Zap,
  User, Phone, Lock, Eye, EyeOff, Key,
} from "lucide-react";

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
            w-12 h-14 text-center text-xl font-bold outline-none
            transition-all duration-200 select-none font-mono
            clip-cyber-sm
            ${value[i]
              ? "bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300"
              : "bg-navy-800 border-2 border-navy-700 text-white"
            }
            focus:border-cyan-400 focus:bg-cyan-500/10 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PASSWORD INPUT COMPONENT
// ─────────────────────────────────────────────────────────────

function PasswordInput({
  value,
  onChange,
  placeholder = "Enter password",
  showStrength = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showStrength?: boolean;
}) {
  const [show, setShow] = useState(false);

  // Password strength calculation
  const strength = {
    score: 0,
    label: "",
    color: "",
  };

  if (showStrength && value) {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value)) score++;

    strength.score = score;

    if (score <= 1) {
      strength.label = "Weak";
      strength.color = "text-red-400";
    } else if (score <= 3) {
      strength.label = "Medium";
      strength.color = "text-yellow-400";
    } else {
      strength.label = "Strong";
      strength.color = "text-green-400";
    }
  }

  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-dark pl-10 pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {showStrength && value && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded-full transition-all ${
                  i <= strength.score
                    ? strength.score <= 1
                      ? "bg-red-400"
                      : strength.score <= 3
                      ? "bg-yellow-400"
                      : "bg-green-400"
                    : "bg-navy-700"
                }`}
              />
            ))}
          </div>
          <span className={`text-xs font-mono ${strength.color}`}>{strength.label}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FLOATING 3D SHAPE
// ─────────────────────────────────────────────────────────────

function FloatingShape({ className, delay = 0, children }: { className?: string; delay?: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
      className={className}
      style={{ animation: `float-3d ${6 + delay * 2}s ease-in-out infinite ${delay}s` }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN LOGIN PAGE
// ─────────────────────────────────────────────────────────────

type Step = "welcome" | "email" | "otp" | "signup" | "signup_otp" | "set_password" | "password_login" | "forgot_password";

export default function LoginPage() {
  const router = useRouter();
  const [step,           setStep]           = useState<Step>("welcome");
  const [email,          setEmail]          = useState("");
  const [name,           setName]           = useState("");
  const [phone,          setPhone]          = useState("");
  const [otp,            setOtp]            = useState("");
  const [password,       setPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,       setLoading]       = useState(false);
  const [cooldown,      setCooldown]      = useState(0);
  const [otpSentTo,     setOtpSentTo]     = useState("");
  const [userName,      setUserName]      = useState(""); // For welcome message
  const [authFlow,       setAuthFlow]      = useState<"signup" | "set_password" | "password_login" | null>(null);
  const [nameError,     setNameError]     = useState("");
  const [phoneError,    setPhoneError]    = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const validateInputs = (): boolean => {
    let valid = true;
    setNameError("");
    setPhoneError("");
    setPasswordError("");

    if (!name.trim()) { setNameError("Full name is required"); valid = false; }
    if (!phone.trim()) { setPhoneError("Phone number is required"); valid = false; }
    else if (!/^\d{10}$/.test(phone)) { setPhoneError("Phone must be exactly 10 digits"); valid = false; }

    // Password validation
    if (password) {
      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters");
        valid = false;
      } else if (!/[a-z]/.test(password)) {
        setPasswordError("Password must contain a lowercase letter");
        valid = false;
      } else if (!/[A-Z]/.test(password)) {
        setPasswordError("Password must contain an uppercase letter");
        valid = false;
      } else if (!/[0-9]/.test(password)) {
        setPasswordError("Password must contain a number");
        valid = false;
      } else if (!/[^a-zA-Z0-9]/.test(password)) {
        setPasswordError("Password must contain a special character");
        valid = false;
      }
    }

    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
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
          role:  "participant",
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

  const handleVerifyOtp = async (code: string) => {
    if (code.replace(/\s/g, "").length < 6) return;
    setLoading(true);

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

  useEffect(() => {
    // Auto-verify only for the legacy OTP step (not signup_otp or set_password)
    if (step !== "otp") return;
    const clean = otp.replace(/\s/g, "");
    if (clean.length === 6) handleVerifyOtp(clean);
  }, [otp, step]);

  // ─────────────────────────────────────────────────────────
  // HYBRID AUTH HANDLERS
  // ─────────────────────────────────────────────────────────

  const handleLookupEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/lookup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to lookup email");
        return;
      }

      const flow = data.data.flow;
      setAuthFlow(flow);

      if (data.data.name) {
        setUserName(data.data.name);
      }

      if (flow === "signup") {
        setStep("signup");
      } else if (flow === "set_password") {
        setStep("set_password");
        // Automatically send OTP for existing users
        await handleForgotPassword();
      } else if (flow === "password_login") {
        setStep("password_login");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    // Step 1: Send OTP to verify email before creating account
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.retryAfter) {
          setCooldown(data.retryAfter);
          toast.error(`Please wait ${data.retryAfter}s before requesting another code.`);
        } else {
          toast.error(data.error ?? "Failed to send verification code");
        }
        return;
      }

      setOtpSentTo(email.toLowerCase().trim());
      setCooldown(60);
      setOtp("");
      setStep("signup_otp");
      toast.success("Verification code sent! Check your email.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete signup
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.replace(/\s/g, "");
    if (cleanOtp.length < 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: name.trim(),
          phone: phone.trim(),
          otp: cleanOtp,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) {
          data.fields.forEach((field: any) => {
            if (field.path === "password") setPasswordError(field.message);
            if (field.path === "confirmPassword") setPasswordError(field.message);
          });
        }
        toast.error(data.error ?? "Signup failed");
        return;
      }

      toast.success(data.data.message ?? "Welcome to NexCell!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOtp = otp.replace(/\s/g, "");
    console.log("handleSetPassword called with:", {
      email: email.toLowerCase().trim(),
      otpLength: cleanOtp.length,
      otp: cleanOtp,
      passwordLength: password.length,
    });

    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    if (!password || password !== confirmPassword) {
      toast.error("Please enter and confirm your password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: cleanOtp,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to set password");
        return;
      }

      toast.success(data.data.message ?? "Password set successfully!");
      setStep("password_login");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }

      toast.success(data.data.message ?? "Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: name.trim() || userName || "User",
          phone: phone.trim() || "1234567890",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.retryAfter) {
          setCooldown(data.retryAfter);
          toast.error(`Please wait ${data.retryAfter}s before requesting another code.`);
        } else {
          toast.error(data.error ?? "Failed to send code");
        }
        return;
      }

      setOtpSentTo(email.toLowerCase().trim());
      setCooldown(60);
      setStep("set_password");
      toast.success("Reset code sent! Check your email.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* ── Perspective Grid Background ───────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: "perspective(400px) rotateX(45deg)",
            transformOrigin: "center top",
            height: "200%",
            animation: "grid-flow 3s linear infinite",
          }}
        />
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.3) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.3) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(14,165,233,0.3) 0%, transparent 70%)" }} />
      </div>

      {/* ── Floating 3D Geometric Shapes ──────────────── */}
      <FloatingShape className="absolute top-[15%] left-[10%] w-16 h-16 border border-cyan-400/15 rotate-45 rounded-sm" delay={0}>
        <div className="w-full h-full bg-cyan-400/5 rounded-sm" />
      </FloatingShape>
      <FloatingShape className="absolute top-[20%] right-[12%] w-12 h-12 border border-purple-400/15 rotate-12" delay={0.5}>
        <div className="w-full h-full bg-purple-400/5" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
      </FloatingShape>
      <FloatingShape className="absolute bottom-[25%] left-[15%] w-10 h-10 border border-cyan-400/10 rounded-full" delay={1}>
        <div className="w-full h-full bg-cyan-400/5 rounded-full" />
      </FloatingShape>
      <FloatingShape className="absolute bottom-[20%] right-[15%] w-14 h-14 border border-blue-400/15 rotate-[30deg]" delay={1.5}>
        <div className="w-full h-full bg-blue-400/5" style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }} />
      </FloatingShape>
      <FloatingShape className="absolute top-[60%] left-[8%] w-8 h-8 border border-neon-pink/10 rotate-45" delay={2}>
        <div className="w-full h-full bg-neon-pink/5 rounded-sm" />
      </FloatingShape>
      <FloatingShape className="absolute top-[45%] right-[8%] w-6 h-6 border border-neon-cyan/15 rounded-full" delay={0.8}>
        <div className="w-full h-full bg-neon-cyan/5 rounded-full" />
      </FloatingShape>

      {/* ── Particle Dots ─────────────────────────────── */}
      {[12, 35, 58, 81, 24, 47, 70, 93, 18, 52, 66, 39].map((left, i) => {
        const top = [15, 42, 68, 28, 55, 82, 38, 62, 75, 22, 48, 88][i];
        const dur = [4.2, 5.1, 3.8, 6.3, 4.7, 5.5, 3.5, 4.9, 5.8, 6.1, 3.9, 4.4][i];
        const del = [0.2, 1.1, 2.3, 0.7, 1.8, 2.9, 0.4, 1.5, 2.1, 0.9, 1.3, 2.7][i];
        return (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/20"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animation: `float ${dur}s ease-in-out infinite ${del}s`,
            }}
          />
        );
      })}

      <div className="w-full max-w-md relative z-10">

        {/* ── LOGO ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <img
                src="/logo.png"
                alt="NexCell Logo"
                width={56}
                height={56}
                className="rounded-xl relative z-10"
              />
              {/* Logo glow ring */}
              <div className="absolute inset-[-4px] rounded-xl border border-cyan-400/20" style={{ animation: "hud-breathe 3s ease-in-out infinite" }} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">
                Nex<span className="gradient-text">Cell</span>
              </h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] mt-0.5 font-mono">
                Entrepreneurship Hub
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-mono text-[0.7rem] tracking-wider">
            ── Mirai School of Technology ──
          </p>
        </motion.div>

        {/* ── STEP CARDS ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <div className="hud-card p-8 text-center scan-overlay">
                <h2 className="text-2xl font-bold text-white mb-2 display-heading text-lg">
                  Welcome to <span className="gradient-text">NexCell</span>
                </h2>
                <p className="text-sm text-slate-400 mb-8 font-mono text-xs">
                  Login to access your dashboard
                </p>
                <button
                  onClick={() => setStep("email")}
                  className="cyber-btn w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    Initialize Login
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <div className="hud-card p-6 scan-overlay">
                <button
                  onClick={() => setStep("welcome")}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 mb-5 transition-colors neon-underline"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 clip-cyber-sm">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white display-heading text-sm">Enter Your Email</h2>
                    <p className="text-xs text-slate-400 font-mono">We'll check your account status</p>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleLookupEmail(); }} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoFocus
                        className="input-dark pl-10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="cyber-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                      ) : (
                        <>Continue <ArrowRight className="w-4 h-4" /></>
                      )}
                    </span>
                  </button>
                </form>

                <p className="text-[10px] text-slate-600 text-center mt-5 font-mono tracking-widest uppercase">
                  Hybrid Authentication (OTP + Password)
                </p>
              </div>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <div className="hud-card p-6 scan-overlay">
                <button
                  onClick={() => { setStep("email"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 mb-5 transition-colors neon-underline"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 clip-cyber-sm">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white display-heading text-sm">Verify Code</h2>
                    <p className="text-xs text-slate-400 font-mono">Enter the 6-digit code sent to</p>
                  </div>
                </div>

                <p className="text-sm font-medium text-cyan-400 mb-6 ml-14 truncate font-mono">
                  {otpSentTo}
                </p>

                <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 mt-5 text-sm text-slate-400 font-mono"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    Authenticating...
                  </motion.div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <p className="text-[10px] text-slate-500 font-mono">Code expires: 5min</p>
                  {cooldown > 0 ? (
                    <p className="text-[10px] text-slate-500 font-mono">
                      Resend in <span className="text-cyan-400 font-medium tabular-nums">{cooldown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={() => { setStep("email"); setOtp(""); }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors neon-underline"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-600 text-center mt-5 font-mono tracking-widest uppercase">
                  Check spam folder if not received
                </p>
              </div>
            </motion.div>
          )}

          {step === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <div className="hud-card p-6 scan-overlay">
                <button
                  onClick={() => setStep("email")}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 mb-5 transition-colors neon-underline"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 clip-cyber-sm">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white display-heading text-sm">Create Account</h2>
                    <p className="text-xs text-slate-400 font-mono">New user? Complete your signup</p>
                  </div>
                </div>

                <form onSubmit={handleCompleteSignup} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">Full Name</label>
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
                    {nameError && <p className="text-xs text-red-400 mt-1 font-mono">{nameError}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">Phone Number</label>
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
                    {phoneError && <p className="text-xs text-red-400 mt-1 font-mono">{phoneError}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">Password</label>
                    <PasswordInput
                      value={password}
                      onChange={(v) => { setPassword(v); setPasswordError(""); }}
                      placeholder="Create a strong password"
                      showStrength
                    />
                    {passwordError && <p className="text-xs text-red-400 mt-1 font-mono">{passwordError}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className="input-dark pl-10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !name.trim() || !phone.trim() || !password || !confirmPassword}
                    className="cyber-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                      ) : (
                        <>Create Account <ArrowRight className="w-4 h-4" /></>
                      )}
                    </span>
                  </button>
                </form>

                <p className="text-[10px] text-slate-600 text-center mt-5 font-mono tracking-widest uppercase">
                  Password: 8+ chars, uppercase, lowercase, number, special char
                </p>
              </div>
            </motion.div>
          )}

          {step === "signup_otp" && (
            <motion.div
              key="signup_otp"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <div className="hud-card p-6 scan-overlay">
                <button
                  onClick={() => { setStep("signup"); setOtp(""); }}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 mb-5 transition-colors neon-underline"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 clip-cyber-sm">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white display-heading text-sm">Verify Email</h2>
                    <p className="text-xs text-slate-400 font-mono">Enter the 6-digit code sent to</p>
                  </div>
                </div>

                <p className="text-sm font-medium text-cyan-400 mb-6 ml-14 truncate font-mono">
                  {otpSentTo}
                </p>

                <form onSubmit={handleVerifySignupOtp} className="space-y-5">
                  <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 text-sm text-slate-400 font-mono"
                    >
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      Creating your account...
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.replace(/\s/g, "").length < 6}
                    className="cyber-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                      ) : (
                        <>Verify & Create Account <ArrowRight className="w-4 h-4" /></>
                      )}
                    </span>
                  </button>
                </form>

                <div className="flex items-center justify-between mt-6">
                  <p className="text-[10px] text-slate-500 font-mono">Code expires: 5min</p>
                  {cooldown > 0 ? (
                    <p className="text-[10px] text-slate-500 font-mono">
                      Resend in <span className="text-cyan-400 font-medium tabular-nums">{cooldown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleCompleteSignup}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors neon-underline"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-600 text-center mt-5 font-mono tracking-widest uppercase">
                  Check spam folder if not received
                </p>
              </div>
            </motion.div>
          )}

          {step === "set_password" && (
            <motion.div
              key="set_password"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <div className="hud-card p-6 scan-overlay">
                <button
                  onClick={() => setStep("email")}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 mb-5 transition-colors neon-underline"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 clip-cyber-sm">
                    <Key className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white display-heading text-sm">Set Password</h2>
                    <p className="text-xs text-slate-400 font-mono">Enter the 6-digit code sent to your email</p>
                  </div>
                </div>

                <p className="text-sm font-medium text-cyan-400 mb-4 ml-14 truncate font-mono">
                  📧 {otpSentTo || email}
                </p>

                <form onSubmit={handleSetPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">6-Digit Code</label>
                    <OtpInput value={otp} onChange={setOtp} disabled={loading} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">New Password</label>
                    <PasswordInput
                      value={password}
                      onChange={(v) => { setPassword(v); setPasswordError(""); }}
                      placeholder="Create a strong password"
                      showStrength
                    />
                    {passwordError && <p className="text-xs text-red-400 mt-1 font-mono">{passwordError}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className="input-dark pl-10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.replace(/\s/g, "").length < 6 || !password || !confirmPassword}
                    className="cyber-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Setting Password...</>
                      ) : (
                        <>Set Password <ArrowRight className="w-4 h-4" /></>
                      )}
                    </span>
                  </button>
                </form>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-[10px] text-slate-500 font-mono">Code expires: 5min</p>
                  {cooldown > 0 ? (
                    <p className="text-[10px] text-slate-500 font-mono">
                      Resend in <span className="text-cyan-400 font-medium tabular-nums">{cooldown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleForgotPassword}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors neon-underline"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend Code
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === "password_login" && (
            <motion.div
              key="password_login"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35 }}
            >
              <div className="hud-card p-6 scan-overlay">
                <button
                  onClick={() => setStep("email")}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 mb-5 transition-colors neon-underline"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 clip-cyber-sm">
                    <Lock className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white display-heading text-sm">Welcome Back{userName ? `, ${userName}` : ""}!</h2>
                    <p className="text-xs text-slate-400 font-mono">Enter your password to continue</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">Email</label>
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

                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider text-[0.65rem]">Password</label>
                    <PasswordInput
                      value={password}
                      onChange={(v) => setPassword(v)}
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !password}
                    className="cyber-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</>
                      ) : (
                        <>Login <ArrowRight className="w-4 h-4" /></>
                      )}
                    </span>
                  </button>
                </form>

                <button
                  onClick={handleForgotPassword}
                  className="w-full text-xs text-cyan-400 hover:text-cyan-300 mt-4 transition-colors neon-underline"
                >
                  Forgot Password?
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[10px] text-slate-600 mt-6 font-mono tracking-[0.15em] uppercase"
        >
          © 2025 NexCell · Mirai School of Technology
        </motion.p>
      </div>
    </div>
  );
}