import { GalleryVerticalEnd } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"; 

export default function LoginPage() {
  return (
    <div className="!bg-gray-900 bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="text-white flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <Avatar className="size-14 mr-8 mt-3">
  <AvatarImage src="bugpilot-logo.png" />

</Avatar>
          </div>
          <h1 className="mt-2 text-2xl">BugPilot</h1>
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
