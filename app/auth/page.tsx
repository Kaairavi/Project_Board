"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { handleAuth, loginUser, registerUser } from "@/app/lib/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAuthAction(formData: FormData) {
    setError(null);
    const result = await handleAuth(mode, formData) as any;
    
    if (result.success) {
      router.push(`/${result.role?.toLowerCase()}/dashboard`);
    } else {
      setError(result.error || "An error occurred");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          To-Do Manager
        </h1>
        <p className="text-center text-slate-500 mb-6">
          {mode === "login"
            ? "Welcome back! Login to continue"
            : "Create an account to get started"}
        </p>

        {/* Toggle */}
        <div className="flex mb-6 bg-slate-100 rounded-lg p-1">
          {["login", "register"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setMode(item as any);
                setError(null);
              }}
              className={`w-1/2 py-2 rounded-lg font-medium transition-all
                ${
                  mode === item
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
            >
              {item === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        <motion.form action={handleAuthAction} 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4">
          {mode === "register" && (
            <input
              name="username"
              type="text"
              required
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg border border-slate-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-lg border border-slate-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-slate-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </motion.form>


        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 To-Do Management System
        </p>
      </motion.div>
    </div>
  );
}
