"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/dropdown";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
  ThumbsUp,
} from "lucide-react";

export default function ReportsClient({
  volumeData = [],
  responseTimeData = [],
  satisfactionData = [],
  channelData = [],
  stats
}: {
  volumeData: any[];
  responseTimeData: any[];
  satisfactionData: any[];
  channelData: any[];
  stats: any;
}) {
  const [dateRange, setDateRange] = React.useState("30d");

  const metrics = [
    {
      label: "Total Tickets",
      value: stats.total.toString(),
      change: 0,
      icon: CheckCircle2,
      color: "teal",
    },
    {
      label: "Avg. Response Time",
      value: responseTimeData.some(d => d.time !== null) 
        ? `${Math.round(responseTimeData.reduce((acc, d) => acc + (d.time || 0), 0) / responseTimeData.filter(d => d.time !== null).length)}m` 
        : "No Data",
      change: 0,
      icon: Clock,
      color: "cyan",
    },
    {
      label: "Resolution Rate",
      value: stats.total > 0 ? `${stats.resolutionRate}%` : "No Data",
      change: 0,
      icon: TrendingUp,
      color: "emerald",
    },
    {
      label: "CSAT Score",
      value: stats.csat > 0 ? `${stats.csat}/5` : "No Data",
      change: 0,
      icon: ThumbsUp,
      color: "amber",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-zinc-400">
            Track performance metrics and customer satisfaction
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onChange={setDateRange}
            options={[
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
              { value: "1y", label: "Last year" },
            ]}
            className="w-40"
          />
          <Button variant="outline">
            <Calendar className="h-4 w-4" />
            Custom Range
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{metric.label}</p>
                  <p className="mt-1 text-3xl font-bold text-white">{metric.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {metric.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                    )}
                    <span
                      className={
                        metric.change >= 0 ? "text-emerald-400" : "text-rose-400"
                      }
                    >
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-xs text-zinc-500">vs last period</span>
                  </div>
                </div>
                <div className={`rounded-xl bg-${metric.color}-500/10 p-3`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-400`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ticket Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#14b8a6"
                    fill="url(#createdGrad)"
                    name="Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#22d3ee"
                    fill="url(#resolvedGrad)"
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Average Response Time (minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: "#14b8a6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-48 w-48">
                {satisfactionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={satisfactionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {satisfactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #3f3f46",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-zinc-700 text-xs text-zinc-500">
                    No ratings yet
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                {satisfactionData.length > 0 ? (
                  satisfactionData.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-zinc-300">{item.name}</span>
                      </div>
                      <span className="font-semibold text-white">{item.value}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 italic">No customer feedback has been collected yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={12} width={60} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="tickets" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



