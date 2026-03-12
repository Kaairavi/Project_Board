"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Folder, ArrowRight, CheckCircle2 } from "lucide-react";
import ProgressRing from "./ProgressRing";

export default function ProjectCard({
  project,
  variant = 'admin'
}: {
  project: any;
  variant?: 'admin' | 'manager';
}) {
  // Calculate progress safely
  const progressRaw =
    project.totalTasks > 0
      ? (project.completedTasks / project.totalTasks) * 100
      : 0;
  const progress = Math.round(progressRaw);

  const isCompleted = progress === 100;

  return (
    <Link href={`/${variant}/projects/${project.ProjectID}`} className="block h-full cursor-pointer">
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 h-full flex flex-col gap-4
                   shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Decorative Gradient Background (Top) */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${variant === 'manager'
          ? 'from-violet-500 via-fuchsia-500 to-pink-500'
          : 'from-indigo-500 via-purple-500 to-pink-500'
          }`} />

        {/* Header: Icon & Progress */}
        <div className="flex justify-between items-start pt-1">
          <div className={`p-3 rounded-xl ${isCompleted
            ? 'bg-green-100 text-green-600'
            : variant === 'manager'
              ? 'bg-violet-50 text-violet-600 dark:bg-slate-700/50 dark:text-violet-400'
              : 'bg-indigo-50 text-indigo-600 dark:bg-slate-700/50 dark:text-indigo-400'
            }`}>
            <Folder className="w-6 h-6" />
          </div>

          <div className="shrink-0 relative">
            <ProgressRing progress={progress} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
              {progress}%
            </span>
          </div>
        </div>

        {/* Main Content Info */}
        <div className="flex flex-col flex-grow">
          <h3 className={`text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug mb-1.5 transition-colors line-clamp-2 ${variant === 'manager' ? 'group-hover:text-violet-600' : 'group-hover:text-indigo-600'
            }`}>
            {project.ProjectName}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              {project.users?.UserName || "Unknown Project Manager"}
            </p>
            {project.activeMembersCount !== undefined && (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-xs font-medium text-slate-600 dark:text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                {project.activeMembersCount} {project.activeMembersCount === 1 ? 'member' : 'members'}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Stats & Bar */}
        <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{project.completedTasks}</span>
                <span className="text-slate-400 mx-1">/</span>
                {project.totalTasks} Tasks
              </span>
            </div>

            <div className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${variant === 'manager' ? 'text-violet-600' : 'text-indigo-600'
              }`}>
              Details <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Progress Bar Line */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${isCompleted
                ? 'bg-green-500'
                : variant === 'manager'
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
