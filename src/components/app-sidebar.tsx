// Assuming your AppSidebar is in app/components/AppSidebar.tsx (or wherever it's located)
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpenDot} from "lucide-react";
import { Avatar} from "@/components/ui/avatar";
import bugpilotlogo from "./bugpilot-logo.png";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
	const { logout } = useAuth();
	const pathname = usePathname();
	


	// Handle logout
	const handleLogout = () => {
		
		window.location.href = "/"
			logout();

	}	
	// Menu items
	const items = [
		{ title: "Dashboard", url: "/home", icon: Home },
		{ title: "Projects", url: "/home/projects", icon: FolderOpenDot },,
	];

	return (
		<Sidebar className="flex flex-col h-full w-64 bg-white border-r shadow-sm !border-gray-700">
			<SidebarContent className="flex flex-col flex-grow bg-gray-800">
				<SidebarGroup className="!p-0">
				
					<SidebarGroupLabel className="text-2xl font-bold text-white pt-2 mt-3 mb-5">
					<Avatar className="size-12 mr-3 mt-1">
					<Image
                src={bugpilotlogo} // Pass the imported image module directly
                alt="BugPilot Logo"
                width={48} // Specify the intrinsic width of the image (e.g., matching size-12 which is 48px)
                height={48} // Specify the intrinsic height of the image
                className="rounded-full object-cover" // Ensure the image fits within the circular avatar
              />

</Avatar>
						BugPilot
					</SidebarGroupLabel>
					<div className="mt-auto py-3 border-t border-gray-700">
					</div>
					<SidebarGroupContent>
						<SidebarMenu className="space-y-1">
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link
											href={item.url}
											className={`
												flex items-center text-white gap-3 p-7 rounded-sm transition-colors duration-200
												${
													pathname === item.url
														? "bg-blue-600 text-white font-medium shadow-sm hover:!bg-blue-600 hover:text-white"
														: "text-gray-300 hover:!bg-gray-700 hover:text-white"
												}
											`}
										>
											<item.icon className="!h-5.5 !w-5.5" />
											<span className="text-lg">{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
							
						</SidebarMenu>
					</SidebarGroupContent>
					<Link href="" className="gap-3 items-center
					mt-83 flex p-4 bg-orange-700 text-white rounded-sm" onClick={handleLogout}>
				<LogOut className="!h-5.5 !w-5.5"/>
				<span className="text-lg">Logout</span>
			</Link>
				</SidebarGroup>
			</SidebarContent>
			
		</Sidebar>
	);
}
