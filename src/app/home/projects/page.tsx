
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";
import Link from "next/link";
import { NewProjectDialog } from "@/components/NewProjectDialog";

// Import the Skeleton component
import { Skeleton } from "@/components/ui/skeleton";

// --- INTERFACES ---
interface Projects {
  _id: string;
  name: string;
  description?: string;
  updatedAt: string;
  members: any[];
}
// --- END INTERFACES ---


export default function ProjectsPage() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Projects[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Wrap fetchProjects in useCallback to prevent unnecessary re-creations
  const fetchProjects = useCallback(async () => {
    setLoading(true); // Set loading to true when fetching starts
    setError(null); // Clear any previous errors

    if (!user || !token) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<Projects[]>("/projects", {
        headers: { Authorization: `Bearer ${token}` }, // Ensure token is sent
      });
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again."); // Set a user-friendly error message
      setProjects([]); // Clear projects on error
    } finally {
      setLoading(false); // Set loading to false when fetching ends (success or error)
    }
  }, [user, token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  };

  // --- Render Loading State with Skeletons ---
  if (loading) {
    return (
      <div className="text-white p-8 bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-10 w-48 bg-gray-700 mb-2" /> {/* Projects Title */}
            <Skeleton className="h-6 w-64 bg-gray-700" /> {/* Description */}
          </div>
          <Skeleton className="h-10 w-40 bg-gray-700 rounded-md" /> {/* New Project Button */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => ( // Render 6 skeleton cards
            <div key={i} className="bg-[#2B2E3E] rounded-lg p-6 shadow-lg border border-[#3C4155]">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-3/4 bg-gray-700" /> {/* Project Name */}
              </div>
              <Skeleton className="h-4 w-full mb-2 bg-gray-700" /> {/* Description line 1 */}
              <Skeleton className="h-4 w-5/6 mb-4 bg-gray-700" /> {/* Description line 2 */}
              <div className="flex justify-between items-center text-gray-400 text-sm">
                <Skeleton className="h-4 w-24 bg-gray-700" /> {/* Date */}
                <Skeleton className="h-4 w-24 bg-gray-700" /> {/* Members */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="text-red-500 p-8 bg-gray-900 min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-semibold mb-4">{error}</p>
        <button
          onClick={fetchProjects}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  // --- Render Loaded Content ---
  return (
    <div className="text-white p-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="text-gray-400 mt-1">Manage your projects and track progress</p>
        </div>
        <span><NewProjectDialog onProjectCreated={fetchProjects} /></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Link key={project._id} href={`/home/${project._id}/tickets`}>
              <div className="bg-[#2B2E3E] rounded-lg p-6 shadow-lg border border-[#3C4155] hover:border-blue-500 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold truncate">{project.name}</h2>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {project.description || "No description provided."}
                </p>

                <div className="flex justify-between items-center text-gray-400 text-sm">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <UsersIcon />
                    <span>
                      {project.members?.length || 0}{" "}
                      {project.members?.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400 text-center col-span-full py-10">No projects found. Create a new one!</p>
        )}
      </div>
    </div>
  );
}

// --- Icon Components (kept as is) ---
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-calendar"
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-users"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);