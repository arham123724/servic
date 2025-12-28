"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft, // Imported for the Back Button
} from "lucide-react";
import { Booking } from "@/types";
import Header from "@/components/Header";

export default function ProviderSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const newBookingsCount = bookings.filter((b) => b.isNew).length;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        // Fetch both client bookings and provider bookings
        const [clientRes, providerRes] = await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/bookings/my-provider-bookings"),
        ]);

        const clientData = await clientRes.json();
        const providerData = await providerRes.json();

        const allBookings = [];

        // Add client bookings
        if (clientData.success && clientData.data) {
          allBookings.push(...clientData.data);
        }

        // Add provider bookings
        if (providerData.success && providerData.data) {
          allBookings.push(...providerData.data);
        }

        // --- CRITICAL FIX: DEDUPLICATION LOGIC ---
        // This removes duplicate bookings if the API returns the same item twice
        // It creates a Map using the _id as the key, effectively keeping only unique items
        const uniqueBookings = Array.from(
          new Map(allBookings.map((item) => [item._id, item])).values()
        );
        // -----------------------------------------

        setBookings(uniqueBookings);
      } catch (err) {
        setError("Failed to load bookings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    setUpdatingBookingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed", isNew: false }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: "confirmed", isNew: false } : b
          )
        );
      }
    } catch (error) {
      console.error("Error approving booking:", error);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    setUpdatingBookingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", isNew: false }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId ? { ...b, status: "cancelled", isNew: false } : b
          )
        );
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const markAsRead = async (bookingId: string) => {
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isNew: false }),
      });

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, isNew: false } : b))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    filter === "all" ? true : booking.status === filter
  );

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600">Loading schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ADDED BACK BUTTON HERE */}
        <div className="mb-6">
          <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors w-fit">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-800">
              My Schedule
            </h1>
            {newBookingsCount > 0 && (
              <span className="bg-[#f59e0b] text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse shadow-md">
                {newBookingsCount} New
              </span>
            )}
          </div>
          <p className="text-slate-600">
            View and manage your appointments
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as typeof filter)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === status
                  ? "bg-[#1e3a8a] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "all" && ` (${bookings.length})`}
                {status !== "all" &&
                  ` (${bookings.filter((b) => b.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {sortedBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No bookings found
            </h3>
            <p className="text-slate-500">
              {filter === "all"
                ? "You don't have any bookings yet."
                : `No ${filter} bookings at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map((booking) => {
              // FIXED: Check if logged-in user is the PROVIDER for this booking
              // Compare the booking's providerEmail with the logged-in user's email
              const isProviderForThisBooking =
                user?.role === "provider" &&
                booking.providerEmail?.toLowerCase() === user?.email?.toLowerCase();

              return (
                <div
                  key={booking._id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border-l-4 ${isProviderForThisBooking ? "border-l-green-500" : "border-l-blue-500"
                    } ${booking.isNew ? "ring-2 ring-red-300" : ""}`}
                  onClick={() => booking.isNew && markAsRead(booking._id)}
                >
                  <div className="p-6">
                    {/* Booking Type Badge and New Badge */}
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      {isProviderForThisBooking ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          📥 Booking from Client
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          📤 Your Booking
                        </span>
                      )}
                      {booking.isNew && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                          ✨ NEW
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${isProviderForThisBooking ? "bg-green-600" : "bg-[#2563EB]"
                          }`}>
                          {booking.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">
                            {booking.clientName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.date)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">
                        {formatTime(booking.timeSlot)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a
                        href={`tel:${booking.clientPhone}`}
                        className="text-sm hover:text-[#1e3a8a] font-medium"
                      >
                        {booking.clientPhone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a
                        href={`mailto:${booking.clientEmail}`}
                        className="text-sm hover:text-[#1e3a8a] font-medium"
                      >
                        {booking.clientEmail}
                      </a>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">
                            Notes:
                          </p>
                          <p className="text-sm text-slate-600">
                            {booking.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Approve/Reject buttons for provider bookings that are pending */}
                  {isProviderForThisBooking && booking.status === "pending" && (
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleApproveBooking(booking._id)}
                        disabled={updatingBookingId === booking._id}
                        className="flex-1 bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {updatingBookingId === booking._id ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking._id)}
                        disabled={updatingBookingId === booking._id}
                        className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <XCircle className="w-4 h-4" />
                        {updatingBookingId === booking._id ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}