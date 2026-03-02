"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Copy, Check, ExternalLink, Zap, Loader, ArrowLeft, HardHat, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GeneratedBackend {
  id: string;
  description: string;
  endpoints: string[];
  dashboardUrl: string;
  createdAt: string;
}

export default function GeneratorPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedBackend | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe your backend");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call your backend API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) throw new Error("Failed to generate backend");

      const data = await response.json();
      setGenerated(data);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/${data.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-neutral-200 overflow-x-hidden" style={{ backgroundColor: "#080808" }}>
      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          borderBottom: "1px solid rgba(249,115,22,0.12)",
          background: "rgba(8,8,8,0.85)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316 0%, #eab308 100%)" }}>
            <HardHat className="w-4 h-4 text-black" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">
            Bob <span className="text-orange-400">the Builder</span>
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </motion.nav>

      {/* Background elements */}
      <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none opacity-20" style={{ background: "radial-gradient(ellipse, #f97316 0%, transparent 70%)", filter: "blur(80px)" }} />

      {/* Main Content */}
      <div className="relative pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          {!generated ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Header */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
                  style={{ border: "1px solid rgba(249,115,22,0.35)", background: "rgba(249,115,22,0.1)", color: "#fb923c" }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  AI-Powered Backend Generator
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-6">
                  <span className="text-white">Describe Your</span>
                  <br />
                  <span style={{ background: "linear-gradient(90deg, #f97316 0%, #eab308 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Perfect Backend.
                  </span>
                </h1>

                <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  Tell Bob what you need. We'll generate a live, callable HTTPS endpoint with all your required functionality — instantly.
                </p>
              </div>

              {/* Form */}
              <motion.form
                onSubmit={handleGenerate}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative rounded-3xl overflow-hidden mb-8"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="p-8">
                  <label className="block text-sm font-semibold text-neutral-300 mb-4">Describe Your Backend</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Example: A REST API for a todo app with endpoints to create, read, update, and delete todos. Include authentication and database integration."
                    className="w-full h-40 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                  />

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-black font-bold text-base transition-all disabled:opacity-50"
                    style={{
                      background: loading ? "rgba(249,115,22,0.5)" : "linear-gradient(135deg, #f97316, #eab308)",
                      boxShadow: "0 0 40px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Generating Your Backend...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate Backend
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>

              {/* Info Cards */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-3 gap-6"
              >
                {[
                  { icon: Zap, title: "Lightning Fast", desc: "Get live endpoints in seconds" },
                  { icon: Terminal, title: "Auto-Generated", desc: "No infrastructure setup needed" },
                  { icon: HardHat, title: "Self-Cleaning", desc: "Auto-deletes when you're done" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="group relative p-6 rounded-2xl border transition-all"
                    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <item.icon className="w-6 h-6 mb-3 text-orange-400" />
                    <h3 className="text-white font-bold mb-2">{item.title}</h3>
                    <p className="text-neutral-500 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            // Success View - Redirecting to Dashboard
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4"
                >
                  <Check className="w-8 h-8 text-green-400" />
                </motion.div>
                <h2 className="text-4xl font-black text-white mb-2">Backend Generated!</h2>
                <p className="text-neutral-400 mb-8">Your live API endpoint is ready. Redirecting to dashboard...</p>

                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }} className="inline-block">
                  <Loader className="w-8 h-8 text-orange-400" />
                </motion.div>

                <p className="text-neutral-600 text-sm mt-8 font-mono">{generated?.id}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
