"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function TicketChart({ data = [] }: { data?: any[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Ticket Activity</h3>
          <p className="text-sm text-zinc-400">Created vs Resolved this week</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-teal-500" />
            <span className="text-zinc-400">Created</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400" />
            <span className="text-zinc-400">Resolved</span>
          </div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#a1a1aa" }}
            />
            <Area
              type="monotone"
              dataKey="created"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#createdGradient)"
            />
            <Area
              type="monotone"
              dataKey="resolved"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#resolvedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



