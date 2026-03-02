"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { HardHat, ArrowRight, Eye, EyeOff, Github, Mail, Lock, User, Wrench, Check, Terminal, Zap } from "lucide-react";

/* ─── Animated terminal on left panel ─── */
function AnimatedTerminal() {
  const terminalLines = [
    { text: "$ bob init --new-workspace", color: "text-neutral-200", delay: 0 },
    { text: "> Bootstrapping Bob engine...", color: "text-neutral-500", delay: 0.5 },
    { text: "> Connecting to Gemini AI...", color: "text-neutral-500", delay: 1.0 },
    { text: "> cpu-stress ✓ registered", color: "text-orange-400", delay: 1.5 },
    { text: "> Generating endpoints...", color: "text-neutral-500", delay: 2.0 },
    { text: "> database ✓ created", color: "text-lime-400", delay: 2.5 },
    { text: "✓ Backend online. HTTPS live.", color: "text-green-400", delay: 3.0 },
  ];

  return (
    <div
      className="relative p-4 rounded-lg font-mono text-sm overflow-hidden"
      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="space-y-1">
        {terminalLines.map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: line.delay }}>
            <span className={line.color}>{line.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FormInput({
  label,
  type = "text",
  value,
  onChange,
  showPassword = false,
  togglePassword,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  showPassword?: boolean;
  togglePassword?: () => void;
}) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-neutral-300 mb-2 block">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 transition"
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-400"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Auth Page ─── */
export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ backgroundColor: "#080808", fontFamily: "inherit" }}>
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative px-14 py-12 overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #f97316 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />

        {/* Corner bracket marks */}
        {(["top-6 left-6", "bottom-6 left-6"] as const).map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-5 h-5 opacity-25`}>
            <div
              className="w-full h-full"
              style={{
                borderTop: i === 0 ? "1px solid #f97316" : "none",
                borderBottom: i === 1 ? "1px solid #f97316" : "none",
                borderLeft: "1px solid #f97316",
              }}
            />
          </div>
        ))}

        <div className="relative z-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-16 group">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
              <HardHat className="w-4.5 h-4.5 text-black" />
            </div>
            <span className="font-black text-white text-xl tracking-tight group-hover:text-orange-400 transition-colors">
              Bob <span className="text-orange-400">the Builder</span>
            </span>
          </Link>

          {/* Main copy */}
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.05] text-white mb-4">
            Build backends
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #f97316 0%, #eab308 60%, #84cc16 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              before production does.
            </span>
          </h1>
          <p className="text-neutral-500 text-base leading-relaxed max-w-sm">Describe any backend system. Get a live HTTPS endpoint in seconds.</p>
        </div>

        {/* Terminal */}
        <AnimatedTerminal />

        {/* Bottom badges */}
        <div className="relative z-10 flex items-center gap-6 mt-10">
          {[
            { icon: Zap, label: "< 5s generation" },
            { icon: Terminal, label: "Real HTTPS endpoints" },
            { icon: Wrench, label: "Zero config needed" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
              <Icon className="w-3.5 h-3.5 text-orange-500/60" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── VERTICAL DIVIDER ── */}
      <div
        className="hidden lg:block w-px self-stretch my-10"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(249,115,22,0.25), transparent)" }}
      />

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}
          >
            <HardHat className="w-4 h-4 text-black" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">
            Bob <span className="text-orange-400">the Builder</span>
          </span>
        </Link>

        <div className="w-full max-w-[400px]">
          {/* Success state */}
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-5 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #eab308)",
                    boxShadow: "0 0 50px rgba(249,115,22,0.45)",
                  }}
                >
                  <Check className="w-8 h-8 text-black" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">Welcome aboard!</h2>
                  <p className="text-neutral-500 text-sm">Your builder account is ready. Start creating instantly.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-black transition-all mt-4"
                  style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}
                >
                  <Wrench className="w-4 h-4" />
                  Start Building
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                  {["signup", "login"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setMode(tab as "signup" | "login")}
                      className={`py-2 px-4 font-semibold transition-colors ${
                        mode === tab ? "text-orange-400 border-b-2 border-orange-400" : "text-neutral-600"
                      }`}
                    >
                      {tab === "signup" ? "Create Account" : "Sign In"}
                    </button>
                  ))}
                </div>

                {/* Social */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-lg border border-white/10 text-white font-semibold transition-all flex items-center justify-center gap-2 mb-6"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <Github className="w-4.5 h-4.5" />
                  Continue with GitHub
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                  <span className="text-neutral-600 text-xs font-semibold uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>

                {/* Form */}
                <AnimatePresence mode="wait">
                  <motion.form key={mode} initial={{ opacity: 0, x: mode === "signup" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onSubmit={handleSubmit}>
                    {mode === "signup" && (
                      <FormInput label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                    )}
                    <FormInput label="Email address" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                    <FormInput
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={(v) => setForm({ ...form, password: v })}
                      showPassword={showPassword}
                      togglePassword={() => setShowPassword(!showPassword)}
                    />

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-lg text-black font-black text-base transition-all mt-6 flex items-center justify-center gap-2"
                      style={{ background: loading ? "rgba(249,115,22,0.4)" : "linear-gradient(135deg, #f97316, #eab308)" }}
                    >
                      {loading ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Zap className="w-4 h-4" />
                          </motion.div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wrench className="w-4 h-4" />
                          {mode === "signup" ? "Create Account" : "Sign In"}
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                </AnimatePresence>

                {/* Terms */}
                <p className="text-xs text-neutral-600 text-center mt-6 leading-relaxed">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-orange-400 hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-orange-400 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
