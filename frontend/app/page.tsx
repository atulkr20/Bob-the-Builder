"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Terminal,
  Clock,
  Trash2,
  Code2,
  ArrowRight,
  Sparkles,
  Globe,
  Shield,
  ChevronDown,
  Copy,
  Check,
  Play,
  Database,
  Cpu,
  GitBranch,
  ExternalLink,
  HardHat,
  Wrench,
  X,
  Menu,
} from "lucide-react";

/* ─── Animated Counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const duration = 1800;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [started, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Feature Card with Hover Effects ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
      className={`group relative p-6 rounded-2xl border transition-all ${accent}`}
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <Icon className="w-6 h-6 mb-4 group-hover:scale-110 transition-transform" />
        <h3 className="text-white font-bold mb-2">{title}</h3>
        <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

/* ─── Step Card with Glow Effect ─── */
function StepCard({
  number,
  title,
  description,
  delay,
  accentColor,
}: {
  number: string;
  title: string;
  description: string;
  delay: number;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`relative p-6 rounded-2xl border group ${accentColor}`}
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="relative inline-block mb-4">
        <div className="absolute -inset-2 rounded-2xl blur-xl -z-10 opacity-30 bg-gradient-to-br from-orange-500 to-amber-500" />
        <div className="text-4xl font-black relative z-10" style={{ color: "#f97316" }}>
          {number}
        </div>
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">{description}</p>
    </motion.div>
  );
}

/* ─── Code Block ─── */
function CodeBlock() {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `// Describe your backend in plain English
const spec = {
  description: "A REST API for a todo app",
  endpoints: [
    "GET /todos - list all todos",
    "POST /todos - create a new todo",
  ]
}

// Bob creates a live endpoint →`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-2xl overflow-hidden border"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="text-xs font-mono text-neutral-500">example.ts</span>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          className="p-2 rounded hover:bg-white/10"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-neutral-500" />}
        </motion.button>
      </div>
      <pre className="p-6 font-mono text-sm text-neutral-300 overflow-x-auto">
        <code>{codeSnippet}</code>
      </pre>
    </motion.div>
  );
}

/* ─── Noise Overlay ─── */
function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' seed='2' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/* ─── ScanLine Animation ─── */
function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #f97316 50%, transparent)",
          opacity: 0.15,
        }}
        animate={{
          top: ["0%", "100%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

/* ─── Signup Modal ─── */
function SignupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-md rounded-3xl overflow-hidden border"
              style={{
                background: "rgba(12,12,12,0.98)",
                borderColor: "rgba(249,115,22,0.2)",
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>

              {/* Header */}
              <div className="p-8 pb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
                  <HardHat className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">
                  {activeTab === "signup" ? "Start Building" : "Welcome Back"}
                </h2>
                <p className="text-neutral-500 text-sm">
                  {activeTab === "signup" ? "Create your free account" : "Sign in to continue"}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 px-8 mb-6">
                {(["signup", "signin"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black"
                        : "bg-white/5 text-neutral-400 hover:bg-white/10"
                    }`}
                  >
                    {tab === "signup" ? "Sign Up" : "Sign In"}
                  </button>
                ))}
              </div>

              {/* Form */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 pt-4 pb-12 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">All set!</h3>
                  <p className="text-neutral-500 text-sm">Redirecting you to dashboard...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 pt-0 pb-8 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-400 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-bold text-black mt-6"
                    style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}
                  >
                    {activeTab === "signup" ? "Create Account" : "Sign In"}
                  </motion.button>

                  <p className="text-center text-xs text-neutral-600 mt-4">
                    By continuing, you agree to our Terms & Privacy Policy
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div ref={containerRef} className="min-h-screen text-neutral-200 overflow-x-hidden" style={{ backgroundColor: "#080808" }}>
      <NoiseOverlay />

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          borderBottom: "1px solid rgba(249,115,22,0.12)",
          background: "rgba(8,8,8,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316 0%, #eab308 100%)" }}>
            <HardHat className="w-4 h-4 text-black" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">
            Bob <span className="text-orange-400">the Builder</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
          {["Features", "How it works", "Demo"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-neutral-500 hover:text-orange-400 transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>

        <motion.button
          onClick={() => setSignupOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-black text-sm font-bold transition-all"
          style={{ background: "linear-gradient(135deg, #f97316, #eab308)", boxShadow: "0 0 20px rgba(249,115,22,0.35)" }}
        >
          <Play className="w-3.5 h-3.5" />
          Start Now
        </motion.button>

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        <ScanLine />
        
        {/* Dot grid background */}
        <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none opacity-20" style={{ background: "radial-gradient(ellipse, #f97316 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] rounded-full pointer-events-none opacity-10" style={{ background: "radial-gradient(ellipse, #84cc16 0%, transparent 70%)", filter: "blur(100px)" }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
            style={{ border: "1px solid rgba(249,115,22,0.35)", background: "rgba(249,115,22,0.1)", color: "#fb923c" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Gemini AI · Zero infra to manage
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.88] mb-6"
          >
            <span className="text-white">Backend APIs,</span>
            <br />
            <span className="relative inline-block">
              <span style={{ background: "linear-gradient(90deg, #f97316 0%, #eab308 50%, #84cc16 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Built in seconds.
              </span>
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-neutral-400 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-10 font-light"
          >
            Describe your API in plain English. Bob generates a <span className="text-white font-medium">live, callable HTTPS endpoint</span> — powered by Gemini — then vanishes when you're done.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href="/generator">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 px-7 py-4 rounded-2xl text-black font-black text-base transition-all"
                style={{ background: "linear-gradient(135deg, #f97316, #eab308)", boxShadow: "0 0 40px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.2)" }}
              >
                <Wrench className="w-4 h-4" />
                Start Building Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.04, borderColor: "rgba(249,115,22,0.5)" }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-base text-neutral-300 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Play className="w-4 h-4" />
              See how it works
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-12 text-center"
          >
            {[
              { value: 5, suffix: "s", label: "Avg. generation time" },
              { value: 100, suffix: "%", label: "Auto-cleanup" },
              { value: 0, suffix: " config", label: "Infra setup needed" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className="text-3xl font-black tabular-nums"
                  style={{
                    background: "linear-gradient(90deg, #f97316, #eab308)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  <Counter target={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-neutral-600 text-xs font-semibold uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ChevronDown className="w-5 h-5 text-neutral-700" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="relative py-4 overflow-hidden border-y" style={{ borderColor: "rgba(249,115,22,0.15)", background: "rgba(249,115,22,0.04)" }}>
        <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="flex gap-12 whitespace-nowrap">
          {Array(4)
            .fill(null)
            .map((_, k) => (
              <div key={k} className="flex gap-12 items-center">
                {["AI-Generated Endpoints", "Zero Infrastructure", "Gemini Powered", "Self-Destructing APIs", "Instant Prototyping", "No Config Needed"].map((t, i) => (
                  <span key={i} className="flex items-center gap-3 text-sm font-semibold text-neutral-600 uppercase tracking-widest">
                    <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
                    {t}
                  </span>
                ))}
              </div>
            ))}
        </motion.div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#f97316" }}>
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4 tracking-tight">
              Everything you need,
              <br />
              <span style={{ background: "linear-gradient(90deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                nothing you don't.
              </span>
            </h2>
            <p className="text-neutral-500 text-lg max-w-xl mx-auto">No boilerplate. No config. No leftover infrastructure. Just a working API when you need it.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Cpu}
              title="AI-Powered Generation"
              description="Describe your API in natural language. Gemini understands context, infers data shapes, and wires up real HTTP routes."
              accent="bg-orange-500/15 text-orange-400"
              delay={0}
            />
            <FeatureCard
              icon={Zap}
              title="Live in Seconds"
              description="No deploy pipelines. No waiting. Your endpoint is live and callable from any frontend the moment Bob finishes."
              accent="bg-amber-500/15 text-amber-400"
              delay={0.08}
            />
            <FeatureCard
              icon={Clock}
              title="Time-Limited Infra"
              description="Spin up temporary infrastructure that matches your needs. When the timer runs out, everything self-destructs."
              accent="bg-lime-500/15 text-lime-400"
              delay={0.16}
            />
            <FeatureCard
              icon={Trash2}
              title="Zero Leftover Data"
              description="No permanent storage of your schemas or payloads. Data exists only for the session, then vanishes irreversibly."
              accent="bg-violet-500/15 text-violet-400"
              delay={0.24}
            />
            <FeatureCard
              icon={Shield}
              title="HTTPS Out of the Box"
              description="Real, signed SSL certificates on every endpoint. No self-signed warnings. Production-grade security, instantly."
              accent="bg-blue-500/15 text-blue-400"
              delay={0.32}
            />
            <FeatureCard
              icon={Globe}
              title="No Account Required"
              description="Start building immediately. No signup, no credit card, no email confirmation. Just describe and build."
              accent="bg-pink-500/15 text-pink-400"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-32 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)" }} />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#eab308" }}>
              Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4 tracking-tight">Three steps to a live API</h2>
            <p className="text-neutral-500 text-lg max-w-xl mx-auto">No account required. No credit card. No infrastructure knowledge.</p>
          </motion.div>

          <div className="relative grid md:grid-cols-3 gap-12 md:gap-6">
            <StepCard number="01" title="Describe your API" description="Tell Bob what endpoints you need in plain English. Mention auth, mock data, schemas — anything." delay={0} accentColor="border-orange-500/40" />
            <StepCard number="02" title="Bob generates it" description="Gemini AI interprets your spec, creates real route handlers, and spins up a live HTTPS endpoint." delay={0.15} accentColor="border-amber-500/40" />
            <StepCard number="03" title="Use & forget" description="Copy your base URL, hit the endpoints from your frontend, and when the timer expires — it all disappears." delay={0.3} accentColor="border-lime-500/40" />
          </div>

          {/* Flow diagram */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { Icon: Code2, label: "Your Spec", style: "border-orange-500/30 bg-orange-500/8 text-orange-400" },
              { Icon: ArrowRight, label: "", style: "border-transparent bg-transparent text-neutral-700" },
              { Icon: Cpu, label: "Gemini AI", style: "border-amber-500/30 bg-amber-500/8 text-amber-400" },
              { Icon: ArrowRight, label: "", style: "border-transparent bg-transparent text-neutral-700" },
              { Icon: Database, label: "Live Endpoint", style: "border-lime-500/30 bg-lime-500/8 text-lime-400" },
              { Icon: ArrowRight, label: "", style: "border-transparent bg-transparent text-neutral-700" },
              { Icon: GitBranch, label: "Your Frontend", style: "border-sky-500/30 bg-sky-500/8 text-sky-400" },
              { Icon: ArrowRight, label: "", style: "border-transparent bg-transparent text-neutral-700" },
              { Icon: Trash2, label: "Auto-Cleanup", style: "border-red-500/30 bg-red-500/8 text-red-400" },
            ].map(({ Icon, label, style }, i) =>
              label ? (
                <div key={i} className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border ${style}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold">{label}</span>
                </div>
              ) : (
                <Icon key={i} className={`w-5 h-5 ${style}`} />
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* ── DEMO / CODE ── */}
      <section id="demo" className="relative py-32 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#84cc16" }}>
                Live Demo
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-5 tracking-tight leading-tight">
                From description
                <br />
                <span style={{ background: "linear-gradient(90deg, #f97316, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  to endpoint — fast.
                </span>
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed mb-8">
                Write a few lines. Bob reads your intent, generates real handlers with realistic mock data, and hands you a URL you can call right now.
              </p>

              <div className="space-y-4">
                {[
                  { Icon: Terminal, text: "Paste into fetch(), axios, or curl immediately", color: "text-orange-400" },
                  { Icon: Clock, text: "Countdown timer shows remaining endpoint lifetime", color: "text-amber-400" },
                  { Icon: Trash2, text: "Endpoint self-destructs when the timer runs out", color: "text-red-400" },
                  { Icon: Sparkles, text: "Gemini generates realistic, typed mock responses", color: "text-lime-400" },
                ].map(({ Icon, text, color }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-neutral-400 text-sm">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <CodeBlock />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="relative py-32 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: "#f97316" }}>
              Use Cases
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4 tracking-tight">Built for every stage</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "🎨", title: "Frontend Devs", description: "Prototype without waiting for the backend team. Wire up real HTTP calls in minutes." },
              { icon: "⚡", title: "Hackathons", description: "Ship a working product in hours. Temporary infra that matches your hackathon timeline." },
              { icon: "🧪", title: "QA & Testing", description: "Create ephemeral test environments that are identical and disposable every run." },
              { icon: "📚", title: "Tutorials", description: "Give students a real API to practice against without cloud setup or accounts." },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl border transition-all"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-40 px-6 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[1000px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(249,115,22,0.14) 0%, transparent 65%)", filter: "blur(60px)" }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8" style={{ border: "1px solid rgba(249,115,22,0.35)", background: "rgba(249,115,22,0.1)", color: "#fb923c" }}>
              <Sparkles className="w-3.5 h-3.5" />
              No signup required
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight mb-6">
              Stop waiting for
              <br />
              <span style={{ background: "linear-gradient(90deg, #f97316 0%, #eab308 50%, #84cc16 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                the backend.
              </span>
            </h2>

            <p className="text-neutral-500 text-xl max-w-xl mx-auto mb-12 leading-relaxed">Describe what you need. Bob builds it. You ship faster. The rest disappears on its own.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => setSignupOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl text-black font-black text-lg transition-all"
                style={{ background: "linear-gradient(135deg, #f97316, #eab308)", boxShadow: "0 0 60px rgba(249,115,22,0.5), inset 0 1px 0 rgba(255,255,255,0.25)" }}
              >
                <Wrench className="w-5 h-5" />
                Build Your First API
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-orange-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on GitHub
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}>
              <HardHat className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-neutral-600 text-sm font-semibold">© 2025 Bob the Builder. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <a href="#" className="hover:text-orange-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* ── SIGNUP MODAL ── */}
      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
    </div>
  );
}
