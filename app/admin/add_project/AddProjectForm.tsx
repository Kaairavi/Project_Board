"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, User, FolderPlus } from "lucide-react";
import { createProject } from "./actions";

type Manager = { UserID: number; UserName: string; Email: string };

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function AddProjectForm({ managers }: { managers: Manager[] }) {
  const [state, formAction] = useActionState(createProject, {});

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-lg"
    >
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-6"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to projects
      </Link>

      <motion.div
        variants={item}
        className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 shadow-sm p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">
            <FolderPlus className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              New project
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create a project and assign a manager
            </p>
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 text-sm"
            >
              {state.error}
            </motion.div>
          )}

          <motion.div variants={item} className="space-y-1.5">
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              id="projectName"
              name="projectName"
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Q1 Marketing Campaign"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent dark:focus:ring-slate-500 transition-shadow"
            />
          </motion.div>

          <motion.div variants={item} className="space-y-1.5">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={255}
              placeholder="Brief description of the project (optional)"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent dark:focus:ring-slate-500 transition-shadow resize-none"
            />
          </motion.div>

          <motion.div variants={item} className="space-y-1.5">
            <label
              htmlFor="createdBy"
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <User className="size-4 text-slate-500" aria-hidden />
              Manager
            </label>
            <select
              id="createdBy"
              name="createdBy"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent dark:focus:ring-slate-500 transition-shadow appearance-none cursor-pointer bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378818c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                paddingRight: "2.5rem",
              }}
            >
              <option value="">No manager</option>
              {managers.length === 0 ? (
                <option value="" disabled>
                  No managers found
                </option>
              ) : (
                managers.map((m) => (
                  <option key={m.UserID} value={m.UserID}>
                    {m.UserName} ({m.Email})
                  </option>
                ))
              )}
            </select>
          </motion.div>

          <motion.div
            variants={item}
            className="flex gap-3 pt-2"
          >
            <Link
              href="/admin/projects"
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </Link>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
            >
              Create project
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
