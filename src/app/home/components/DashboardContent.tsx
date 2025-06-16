"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";

import {
  Folder,
  Bug,
  Clock,
  CheckCircle,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// Import the Skeleton component
import { Skeleton } from "@/components/ui/skeleton";

// --- INTERFACES ---
interface Stats {
  totalProjects: number;
  openIssues: number;
  inProgress: number;
  completed: number;
}

type ActivityType = "info" | "success" | "warning";

interface Activity {
  message: string;
  type: ActivityType;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  __v: number;
}

interface Ticket {
  _id: string;
  title: string;
  description?: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  project: string;
  assignee?: string;
  createdBy: string;
  __v: number;
}
// --- END INTERFACES ---

export default function DashboardContent() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    openIssues: 0,
    inProgress: 0,
    completed: 0,
  });

  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Small delay to make skeleton visible for demonstration
      // In a real app, you wouldn't typically add artificial delays.
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!user || !token) return setLoading(false);

      try {
        const [projectsRes, ticketsRes] = await Promise.all([
          api.get<Project[]>("/projects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get<Ticket[]>("/tickets/my-tickets", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const tickets = ticketsRes.data;

        const openIssues = tickets.filter(t => t.status === "To Do").length;
        const inProgress = tickets.filter(t => t.status === "In Progress").length;
        const completed = tickets.filter(t => t.status === "Done").length;

        setStats({
          totalProjects: projectsRes.data.length,
          openIssues,
          inProgress,
          completed,
        });

      } catch (error) {
        console.error("Dashboard data error:", error);
        // Optionally, set an error state to display a message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]); // Added dummyActivities to dependencies

  // --- Loading State with Skeletons ---
  if (loading) {
    return (
      <div className="space-y-6 p-4 bg-gray-900 min-h-screen">
        <Skeleton className="h-10 w-64 mb-2 bg-gray-700" /> {/* Title Skeleton */}
        <Skeleton className="h-6 w-48 mb-6 bg-gray-700" /> {/* Welcome message Skeleton */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full bg-gray-700 rounded-lg" />
          ))}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <Skeleton className="h-8 w-48 mb-3 bg-gray-700" /> {/* Recent Activity Title Skeleton */}
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4 rounded-full bg-gray-700" /> {/* Icon Skeleton */}
                <Skeleton className="h-5 w-3/4 bg-gray-700" /> {/* Message Skeleton */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (!user) {
    window.location.href = "/"; // Redirect to login if user is not authenticated
    return null; // Prevent rendering the rest of the component
  }

  // --- Loaded Content ---
  return (
    <div className="space-y-6 p-4 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <p className="text-gray-300">Welcome back, {user.name}!</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Bug className="w-6 h-6" />} label="Open Issues" value={stats.openIssues} color="bg-red-600" />
        <StatCard icon={<Clock className="w-6 h-6" />} label="In Progress" value={stats.inProgress} color="bg-yellow-500" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />} label="Completed" value={stats.completed} color="bg-green-600" />
        <StatCard icon={<Folder className="w-6 h-6" />} label="Total Projects" value={stats.totalProjects} color="bg-blue-600" />
      </div>
    </div>
  );
}

// --- StatCard Component ---
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-lg flex items-center space-x-4 ${color} text-white`}>
      <div>{icon}</div>
      <div>
        <p className="text-sm">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// --- Utility for Activity Icon ---
function getActivityIcon(type: ActivityType) {
  const icons: Record<ActivityType, JSX.Element> = {
    success: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    warning: <AlertCircle className="w-4 h-4 text-yellow-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
  };
  return <span>{icons[type]}</span>;
}