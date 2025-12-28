"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; import { validateEmail, getEmailError } from "@/lib/validation";
export default function LoginPage() {
  const router = useRouter();
  const { login, setDemoUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError(getEmailError(formData.email));
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Failed to login. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-slate-900 p-2 rounded-lg shadow-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900">Servic</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Minimalist Design */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Clean White Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            {/* Header - No Background Color */}
            <div className="px-8 pt-8 pb-6 text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
              <p className="text-slate-600">
                Log in to your Servic account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button - Deep Slate/Navy */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </button>

              {/* Demo Access Section */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium">
                    — OR Access Demo Account —
                  </span>
                </div>
              </div>

              {/* Demo Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      const result = await login("demo_client@servic.com", "password123");
                      if (result.success) {
                        router.push("/");
                      } else {
                        setError(result.error || "Demo login failed. Please try again.");
                      }
                    } catch {
                      setError("Demo login failed. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  👨‍💼 Demo as Client
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      const result = await login("demo_provider@servic.com", "password123");
                      if (result.success) {
                        router.push("/provider/schedule");
                      } else {
                        setError(result.error || "Demo login failed. Please try again.");
                      }
                    } catch {
                      setError("Demo login failed. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  🛠️ Demo as Provider
                </button>
              </div>

              {/* Signup Link */}
              <p className="text-center text-slate-600 text-sm pt-2">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-slate-900 hover:text-slate-700 font-semibold hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
