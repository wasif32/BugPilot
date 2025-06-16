"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow p-4 flex justify-between max-w-7xl mx-auto">
      <Link href="/" className="font-bold text-xl text-blue-600">BugTracker</Link>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-gray-700">Hi, {user.name}</span>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link href="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
