// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import { cn } from "@/lib/utils";
// import api from "@/lib/api";
// import { useAuth } from "@/components/AuthProvider";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// export function RegisterForm({
//   className,
//   ...props
// }: React.ComponentProps<"div">) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const { login } = useAuth();
//   const router = useRouter();

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const { data, status } = await api.post("/auth/register", {
//         name,
//         email,
//         password,
//       });

//       if (status === 201) {
//         login(data.token, data.user);
//         router.push("/home");
//       }
//     } catch (err: any) {
//       const msg = err.response?.data?.message || "Registration failed. Please try again.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card className="!w-full !max-w-md !rounded-lg !border-gray-700 bg-gray-800 text-card-foreground">
//         <CardHeader className="text-center">
//           <CardTitle className="text-xl text-white">Create an account</CardTitle>
//           <CardDescription className="text-gray-400">
//             Register with your BugPilot account
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleRegister} className="grid gap-6">
//             {[
//               { id: "name", label: "Name", type: "text", value: name, onChange: setName },
//               { id: "email", label: "Email", type: "email", value: email, onChange: setEmail },
//               { id: "password", label: "Password", type: "password", value: password, onChange: setPassword },
//             ].map(({ id, label, type, value, onChange }) => (
//               <div className="grid gap-3" key={id}>
//                 <Label htmlFor={id} className="text-gray-300">
//                   {label}
//                 </Label>
//                 <Input
//                   id={id}
//                   type={type}
//                   placeholder={`Enter your ${label.toLowerCase()}`}
//                   required
//                   value={value}
//                   onChange={(e) => onChange(e.target.value)}
//                   className="bg-gray-700 text-white border-none focus:!border-white focus:!ring-white focus:outline-none"
//                 />
//               </div>
//             ))}

//             {error && <p className="text-sm text-red-500 text-center">{error}</p>}

//             <Button
//               type="submit"
//               className="w-full bg-blue-600 hover:bg-blue-700"
//               disabled={loading}
//             >
//               {loading ? "Registering..." : "Register"}
//             </Button>

//             <div className="text-center text-sm text-gray-400">
//               Already have an account?{" "}
//               <Link href="/login" className="text-blue-500 hover:underline">
//                 Login
//               </Link>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [serverEmail, setServerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { status } = await api.post("/auth/send-otp", { email });

      if (status === 200) {
        setServerEmail(email);
        setStep("verify");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to send OTP. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, status } = await api.post("/auth/verify-otp", {
        name,
        email: serverEmail,
        password,
        otp,
      });

      if (status === 201) {
        login(data.token, data.user);
        router.push("/home");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "OTP verification failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="!w-full !max-w-md !rounded-lg !border-gray-700 bg-gray-800 text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">Create an account</CardTitle>
          <CardDescription className="text-gray-400">
            Register with your BugPilot account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={step === "register" ? handleSendOTP : handleVerifyOTP}
            className="grid gap-6"
          >
            {step === "register" ? (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-700 text-white border-none focus:!border-white focus:!ring-white"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 text-white border-none focus:!border-white focus:!ring-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="otp" className="text-gray-300">
                    OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the 6-digit OTP"
                    value={otp}
                    required
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-gray-700 text-white border-none focus:!border-white focus:!ring-white"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 text-white border-none focus:!border-white focus:!ring-white"
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : step === "register"
                ? "Send OTP"
                : "Verify & Register"}
            </Button>

            <div className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
