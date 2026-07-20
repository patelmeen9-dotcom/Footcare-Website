"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-card shadow-soft-lg flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col text-center gap-1">
          <h1 className="text-xl font-bold tracking-tight text-primary">
            Foot<span className="text-accent">Care</span> Portal
          </h1>
          <p className="text-caption text-foreground/50">
            Sign in to manage catalogs, promotions, and imports.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-button text-caption font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-small font-bold text-foreground/60 uppercase">
              Email Address
            </label>
            <div className="relative flex items-center bg-secondary/30 border border-border rounded-input px-3 py-2.5 focus-within:border-primary">
              <Mail className="h-5 w-5 text-foreground/30 absolute left-3" />
              <input
                type="email"
                required
                placeholder="admin@footcare.com"
                className="w-full pl-8 outline-none text-caption bg-transparent text-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label-small font-bold text-foreground/60 uppercase">
              Password
            </label>
            <div className="relative flex items-center bg-secondary/30 border border-border rounded-input px-3 py-2.5 focus-within:border-primary">
              <Lock className="h-5 w-5 text-foreground/30 absolute left-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full pl-8 pr-8 outline-none text-caption bg-transparent text-foreground"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-foreground/45 hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-button text-caption hover:bg-accent hover:text-accent-foreground transition-all shadow-soft-sm mt-2 disabled:opacity-disabled cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center text-label-small text-foreground/40">
          Demo Credentials: <span className="font-mono font-bold text-foreground/60">admin@footcare.com / Password123</span>
        </div>
      </div>
    </div>
  );
}
