"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, User, LogOut, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  // Fetch and update pending bookings count
  const fetchNewBookingsCount = async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/bookings/my-provider-bookings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const pendingCount = data.data.filter((b: any) => b.status === 'pending').length;
          setNewBookingsCount(pendingCount);
        }
      }
    } catch (error) {
      console.error("Failed to fetch new bookings count:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNewBookingsCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNewBookingsCount, 30000);

    // Listen for manual refresh events (dispatched when booking is accepted/rejected/read)
    const handler = () => fetchNewBookingsCount();
    window.addEventListener("refresh-booking-count", handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-booking-count", handler);
    };
  }, [user]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900">Servic</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-[#1e3a8a] font-medium transition-colors"
            >
              Join as Provider
            </Link>

            {user && (
              <Link
                href="/provider/schedule"
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-[#1e3a8a] font-medium transition-colors relative"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">My Schedule</span>
                {newBookingsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-50 text-rose-600 border border-rose-100 text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                    {newBookingsCount}
                  </span>
                )}
              </Link>
            )}

            {loading ? (
              <div className="w-24 h-10 bg-slate-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-slate-600">
                  <div className="w-8 h-8 bg-[#1e3a8a] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-600 hover:text-[#1e3a8a] font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <User className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
