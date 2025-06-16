// src/components/Header.tsx
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Import SidebarTrigger
import { useAuth } from "./AuthProvider";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex sticky top-0 border-b border-gray-700 items-center  px-6 py-4.5 bg-gray-800 text-white shadow-md">

      <div className="md:hidden">
        <SidebarTrigger />
      </div>



      <div className="flex ml-auto">
        <div className="text-lg font-medium">Welcome {user?.name}</div>
      </div>

    </header>
  );
}