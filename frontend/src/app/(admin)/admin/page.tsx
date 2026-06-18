"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  AlertTriangle,
  MapPin,
  Phone,
  TrendingUp,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import proxy from "@/lib/proxy";
import { useSocket } from "@/hooks/use-socket";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface IDashboardData {
  stats: {
    totalUsers: number;
    pendingSitters: number;
    activeBookings: number;
    totalRevenue: number;
  };
  recentActivity: IRecentActivity[];
}

interface IRecentActivity {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  parent: { user: { name: string } };
  babysitter: { user: { name: string } };
}

interface IPendingUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// Mock chart data - In production, fetch from backend
const bookingsTrendData = [
  { date: "Mon", bookings: 12, revenue: 4800 },
  { date: "Tue", bookings: 19, revenue: 7600 },
  { date: "Wed", bookings: 15, revenue: 6000 },
  { date: "Thu", bookings: 22, revenue: 8800 },
  { date: "Fri", bookings: 28, revenue: 11200 },
  { date: "Sat", bookings: 35, revenue: 14000 },
  { date: "Sun", bookings: 31, revenue: 12400 },
];

const statusData = [
  { name: "Confirmed", value: 45, color: "#10b981" },
  { name: "Pending", value: 25, color: "#f59e0b" },
  { name: "Completed", value: 20, color: "#0ea5e9" },
  { name: "Cancelled", value: 10, color: "#ef4444" },
];

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
];

// Loading Skeletons
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="h-3 w-32 mt-4" />
      </div>
    ))}
  </div>
);

const ChartSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
    <Skeleton className="h-6 w-48 mb-6" />
    <Skeleton className="h-64 w-full" />
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState<IDashboardData | null>(null);
  const [pendingUsers, setPendingUsers] = useState<IPendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Real Data Fetching
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          proxy.get("/admin/stats"),
          proxy.get("/admin/approvals"),
        ]);

        if (statsRes.data.success) setData(statsRes.data);
        if (pendingRes.data.success)
          setPendingUsers(pendingRes.data.users.slice(0, 5));
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // SOS Alert Listener
  const { socket } = useSocket("admin_room");

  useEffect(() => {
    if (socket) {
      socket.on(
        "newSOSAlert",
        (alert: {
          user: { name: string; phoneNumber: string };
          latitude: number;
          longitude: number;
        }) => {
          const toastId = toast.error(
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-600 font-black">
                <AlertTriangle className="animate-bounce" />
                <span>EMERGENCY SOS ALERT!</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {alert.user.name} is in danger!
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Phone size={12} /> {alert.user.phoneNumber}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} /> {alert.latitude}, {alert.longitude}
              </div>
              <button
                onClick={() => toast.dismiss(toastId)}
                className="mt-2 bg-red-600 text-white py-1.5 rounded-lg text-xs font-black uppercase tracking-widest"
              >
                Take Action
              </button>
            </div>,
            { duration: Infinity, position: "top-right" }
          );
        }
      );
    }

    return () => {
      if (socket) socket.off("newSOSAlert");
    };
  }, [socket]);

  const statsList = [
    {
      title: "Total Users",
      value: data?.stats.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Pending Approvals",
      value: data?.stats.pendingSitters || 0,
      icon: UserCheck,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      trend: "Action Needed",
      trendUp: false,
    },
    {
      title: "Active Bookings",
      value: data?.stats.activeBookings || 0,
      icon: Calendar,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Total Revenue",
      value: `৳${data?.stats.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      trend: "+23.1%",
      trendUp: true,
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  } as const;

  if (loading) {
    return (
      <div className="space-y-8">
        <StatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Stats Grid with Animated Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsList.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {stat.title}
                  </p>
                  <motion.h3
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 + 0.2, type: "spring" as const }}
                    className="text-3xl font-bold text-slate-800"
                  >
                    {stat.value}
                  </motion.h3>
                </div>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`p-3 rounded-xl ${stat.bgColor} ${stat.iconColor}`}
                >
                  <stat.icon className="h-6 w-6" />
                </motion.div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold">
                {stat.trendUp && <TrendingUp className="h-3 w-3 text-green-500" />}
                <span className={stat.trendUp ? "text-green-600" : "text-orange-600"}>
                  {stat.trend}
                </span>
                <span className="text-slate-400 ml-1">vs last week</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Trend Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-600" />
                Bookings Trend
              </h3>
              <p className="text-xs text-slate-500 mt-1">Last 7 days performance</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={bookingsTrendData}>
              <defs>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#14b8a6"
                strokeWidth={3}
                fill="url(#colorBookings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Booking Status</h3>
              <p className="text-xs text-slate-500 mt-1">Current distribution</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Revenue Analytics */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Revenue Analytics
            </h3>
            <p className="text-xs text-slate-500 mt-1">Monthly revenue comparison</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value) => [`৳${value}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="#a855f7" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pending Approvals and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals Table */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Pending Approvals
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Babysitters waiting for verification
              </p>
            </div>
            <Link
              href="/admin/approvals"
              className="text-sm text-teal-600 font-bold hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No pending approvals found.
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-xs text-white uppercase font-bold">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/approvals?id=${user.id}`}
                          className="inline-flex items-center gap-1 text-teal-600 font-bold hover:underline bg-teal-50 px-3 py-1 rounded-md text-xs"
                        >
                          <Eye className="h-3 w-3" /> Review
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Live Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">Live</span>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {data?.recentActivity.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">
                No recent bookings.
              </p>
            ) : (
              data?.recentActivity.map((booking: IRecentActivity) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative pl-4 border-l-2 border-slate-100 pb-4 last:pb-0"
                >
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-teal-500 rounded-full border-2 border-white" />

                  <div>
                    <p className="text-sm text-slate-800 leading-snug">
                      <span className="font-bold">
                        {booking.parent.user.name}
                      </span>{" "}
                      booked{" "}
                      <span className="font-bold text-teal-600">
                        {booking.babysitter.user.name}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                        ৳{booking.totalAmount}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          booking.status === "PENDING"
                            ? "bg-orange-100 text-orange-600"
                            : booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{" "}
                      {new Date(booking.createdAt).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
