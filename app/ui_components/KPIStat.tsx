import {
  LayoutGrid,
  Activity,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const accentConfig = {
  primary: {
    icon: LayoutGrid,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    valueColor: "text-indigo-600",
  },
  active: {
    icon: Activity,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    valueColor: "text-indigo-600",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-600",
  },
  danger: {
    icon: AlertCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    valueColor: "text-red-600",
  },
  warning: {
    icon: Activity,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    valueColor: "text-amber-600",
  },
} as const;

export function KPIStat({
  label,
  value,
  hint,
  color = "rgb(var(--primary))",
  accent = "primary",
}: {
  label: string;
  value: number | string;
  hint?: string;
  color?: string;
  accent?: "primary" | "active" | "success" | "danger" | "warning";
}) {
  const config = accentConfig[accent] ?? accentConfig.primary;
  const Icon = config.icon;

  return (
    <article
      className="
        flex items-start justify-between gap-4 rounded-2xl border border-slate-200/60
        bg-white p-5
        shadow-[0_2px_12px_rgba(0,0,0,0.06)]
        transition-all duration-200 ease-out
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
      "
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className={`mt-1.5 text-2xl font-bold tabular-nums tracking-tight ${config.valueColor}`}>
          {value}
        </p>
        {hint ? (
          <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>
        ) : null}
      </div>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${config.iconBg} ${config.iconColor}`}
      >
        <Icon className="h-6 w-6" strokeWidth={2.5} />
      </div>
    </article>
  );
}
