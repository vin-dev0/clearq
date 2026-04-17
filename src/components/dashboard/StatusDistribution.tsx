"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function StatusDistribution({ data = [] }: { data: { name: string, value: number, color: string }[] }) {
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1; // Avoid division by zero

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6">
      <h3 className="text-lg font-semibold text-white">Status Distribution</h3>
      <p className="text-sm text-zinc-400">Current ticket breakdown</p>

      <div className="mt-4 flex items-center">
        <div className="h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3 pl-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-zinc-300">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{item.value}</span>
                <span className="text-xs text-zinc-500">
                  ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



