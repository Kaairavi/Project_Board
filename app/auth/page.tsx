"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { handleAuth } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, LayoutDashboard, ArrowRight, Sparkles } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleAuthAction(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await handleAuth(mode, formData) as any;
    
    if (result.success) {
      router.push(`/${result.role?.toLowerCase()}/dashboard`);
    } else {
      setError(result.error || "An error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 font-sans selection:bg-indigo-500/30">
      
      {/* Left side - Dynamic Brand Area (Hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] relative border-r border-indigo-100 dark:border-slate-800 flex-col justify-between overflow-hidden bg-slate-50 dark:bg-slate-900">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-3xl bg-indigo-400 dark:bg-indigo-900 mix-blend-multiply dark:mix-blend-lighten animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-3xl bg-purple-400 dark:bg-purple-900 mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full opacity-30 blur-3xl bg-blue-300 dark:bg-blue-800 mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-4000" />

        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 ring-1 ring-indigo-200 dark:ring-indigo-500/30 shadow-sm">
              <LayoutDashboard className="size-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Project Board</span>
          </div>
        </div>

        <div className="relative z-10 p-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
              Manage your work. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600">
                Empower your team.
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Join thousands of professionals who organize, track, and conquer their projects with our intuitive platform.
            </p>
          </motion.div>

          <div className="mt-10 flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex -space-x-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className={`size-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`} style={{ backgroundColor: `hsl(${i * 45 + 200}, 70%, 50%)`}}>
                  {String.fromCharCode(64+i)}
                </div>
              ))}
            </div>
            <p>Trusted by 10k+ users</p>
          </div>
        </div>
      </div>

      {/* Right side - Form Area */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="w-full max-w-md mx-auto relative z-10">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 text-indigo-600 dark:text-indigo-400 justify-center">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 ring-1 ring-indigo-200 dark:ring-indigo-500/30">
               <LayoutDashboard className="size-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Project Board</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              {mode === "login" 
                ? "Please enter your details to sign in to your account." 
                : "Enter your information to get started with Project Board."}
            </p>

            {/* Segmented Control */}
            <div className="flex p-1 mb-8 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "login"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white ring-1 ring-slate-200/50 dark:ring-slate-600/50"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/30"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === "register"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white ring-1 ring-slate-200/50 dark:ring-slate-600/50"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/30"
                }`}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-2">
                    <Sparkles className="size-4 shrink-0" /> {/* Just using an icon for flair */}
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form action={handleAuthAction} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <User className="size-5" />
                      </div>
                      <input
                        name="username"
                        type="text"
                        required
                        placeholder="Username"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail className="size-5" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="size-5" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              {mode === "login" && (
                <div className="flex justify-end pt-1">
                  <a href="#" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,39%)] hover:shadow-[0_6px_20px_rgba(79,70,229,23%)] hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none disabled:transform-none"
              >
                {isLoading ? (
                  <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                By continuing, you agree to our <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</a> and <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
