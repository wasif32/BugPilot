// This file is a client component because AppSidebar and Header (with SidebarTrigger) use client-side hooks.
"use client";
import { SidebarProvider } from "@/components/ui/sidebar"; // Your Sidebar Provider
import { AppSidebar } from "@/components/app-sidebar";     // Your custom sidebar
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

export default function HomeLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider> {/* This context provider manages the state of the sidebar */}
      {/* Main container for the entire layout: full screen height, column direction */}
      <div className="flex
        flex-col min-h-screen bg-gray-950 w-full">
        
        {/* The Header component is at the very top of the screen */}
        {/* It now includes the SidebarTrigger for mobile views */}
        <Header />

        {/* This div structures the main content area, side-by-side: Sidebar + Page Content */}
        <div className="flex flex-1"> {/* `flex-1` makes this div take up remaining vertical space */}
          {/* The AppSidebar component, which renders the actual sidebar structure */}
          {/* It's assumed that the Sidebar component (from ui/sidebar) itself handles its desktop fixed position and mobile overlay behavior via SidebarProvider */}
          <AppSidebar />

          {/* The main content area where individual pages will be rendered */}
          {/* `flex-1` makes it take up remaining horizontal space */}
          {/* `p-6` adds padding around the content */}
          {/* `overflow-auto` allows the content to scroll independently if it overflows */}
          <main className="flex-1 overflow-auto bg-gray-900">
            {children} {/* This is where your page.tsx content (e.g., Dashboard) will appear */}
          </main>
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
}

