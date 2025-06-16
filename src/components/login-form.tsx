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

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, status } = await api.post("/auth/login", { email, password });
      if (status === 200) {
        login(data.token, data.user);
        router.push("/home");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="!w-full !max-w-md !rounded-lg !border-gray-700 bg-gray-800 text-card-foreground">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">Welcome back</CardTitle>
          <CardDescription className="text-gray-400">
            Login with your BugPilot account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 text-white border-none focus:!ring-white focus:!border-white focus:outline-none"
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm text-gray-300 underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-none focus:!ring-white focus:!border-white focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>.
      </div>
    </div>
  );
}
