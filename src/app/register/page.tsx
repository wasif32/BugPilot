import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { RegisterForm } from "@/components/register-form"
export default function LoginPage() {
  return (
    <div className="!bg-gray-900 bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="text-white flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <Avatar className="size-14 mb-2 mr-8 mt-3">
  <AvatarImage src="bugpilot-logo.png" />

</Avatar>
          </div>
          <h1 className=" text-2xl">BugPilot</h1>
        </a>
       <RegisterForm />
      </div>
    </div>
  )
}