"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Copy, Check, ExternalLink, Code2, Database, Clock, HardHat, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const params = useParams();
  const backendId = params.id as string;
  const [copied, setCopied] = useState<string | null>(null);

  // Mock data - in production would fetch from your API
  const mockBackendData = {
    id: backendId,
    name: "Generated Backend API",
    description:
      "A REST API for a todo app with endpoints to create, read, update, and delete todos. Includes authentication and database integration.",
    endpoints: [
      "GET /api/todos - Retrieve all todos",
      "GET /api/todos/:id - Retrieve todo by ID",
      "POST /api/todos - Create new todo",
      "PUT /api/todos/:id - Update todo",
      "PATCH /api/todos/:id - Partially update todo",
      "DELETE /api/todos/:id - Delete todo",
      "POST /api/auth/register - Register new user",
      "POST /api/auth/login - User login",
      "GET /api/auth/profile - Get user profile",
    ],
    baseUrl: `https://api.example.com/v1/${backendId}`,
    status: "Active",
    createdAt: new Date().toLocaleDateString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
    requestsUsed: "1,234",
    responseTime: "145ms",
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
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
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 text-white">
              Backend Dashboard
            </h1>
            <p className="text-neutral-400">ID: <span className="font-mono text-orange-400">{mockBackendData.id}</span></p>
          </motion.div>

          {/* Status Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Status", value: mockBackendData.status, icon: "🟢" },
              { label: "Created", value: mockBackendData.createdAt, icon: "📅" },
              { label: "Expires", value: mockBackendData.expiresAt, icon: "⏰" },
              { label: "Response Time", value: mockBackendData.responseTime, icon: "⚡" },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-4 rounded-2xl border"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <p className="text-neutral-500 text-xs font-semibold uppercase mb-2">{card.label}</p>
                <p className="text-white font-bold text-lg">{card.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* API Base URL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative rounded-2xl overflow-hidden border mb-8"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="p-8">
              <h2 className="text-sm font-semibold text-neutral-300 mb-4">API Base URL</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm overflow-x-auto">
                  {mockBackendData.baseUrl}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => copyToClipboard(mockBackendData.baseUrl, "baseUrl")}
                  className="p-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {copied === "baseUrl" ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-neutral-400" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Endpoints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden border mb-8"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="p-8">
              <h2 className="text-sm font-semibold text-neutral-300 mb-6 flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Available Endpoints
              </h2>
              <div className="space-y-3">
                {mockBackendData.endpoints.map((endpoint, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="p-4 rounded-xl border group transition-all hover:border-orange-500/50"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white font-mono text-sm">{endpoint}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => copyToClipboard(endpoint, `endpoint-${i}`)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {copied === `endpoint-${i}` ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-neutral-500" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative rounded-2xl overflow-hidden border mb-8"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="p-8">
              <h2 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Description
              </h2>
              <p className="text-neutral-400 leading-relaxed">{mockBackendData.description}</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
            >
              <ExternalLink className="w-4 h-4" />
              Test API
            </motion.button>
            <Link href="/generator" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full px-6 py-4 rounded-xl text-black font-bold text-base transition-all"
                style={{ background: "linear-gradient(135deg, #f97316, #eab308)" }}
              >
                Generate Another
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
