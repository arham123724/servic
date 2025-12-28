"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
    Calendar,
    Clock,
    User,
    Briefcase,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";
import Header from "@/components/Header";
import { Booking } from "@/types";

export default function SchedulePage() {
    const { user, loading } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) {
                setDataLoading(false);
                return;
            }

            try {
                // Fetch both client bookings and provider bookings
                const [clientRes, providerRes] = await Promise.all([
                    fetch("/api/bookings"),
                    fetch("/api/bookings/my-provider-bookings"),
                ]);

                const clientData = await clientRes.json();
                const providerData = await providerRes.json();

                const allBookings: Booking[] = [];

                // Add client bookings (bookings I made)
                if (clientData.success && clientData.data) {
                    allBookings.push(...clientData.data);
                }

                // Add provider bookings (bookings made to me as a provider)
                if (providerData.success && providerData.data) {
                    // Avoid duplicates by checking if booking already exists
                    providerData.data.forEach((booking: Booking) => {
                        if (!allBookings.find((b) => b._id === booking._id)) {
                            allBookings.push(booking);
                        }
                    });
                }

                setBookings(allBookings);
            } catch (err) {
                setError("Failed to load bookings");
                console.error(err);
            } finally {
                setDataLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        } else {
            setDataLoading(false);
        }
    }, [user]);

    // Handle confirm booking (Provider action)
    const handleConfirm = async (id: string) => {
        setUpdatingBookingId(id);
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "confirmed", isNew: false }),
            });

            const data = await res.json();
            if (data.success) {
                setBookings((prev) =>
                    prev.map((b) =>
                        b._id === id ? { ...b, status: "confirmed", isNew: false } : b
                    )
                );
            }
        } catch (error) {
            console.error("Error confirming booking:", error);
        } finally {
            setUpdatingBookingId(null);
        }
    };

    // Handle cancel booking (Provider action)
    const handleCancel = async (id: string) => {
        setUpdatingBookingId(id);
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled", isNew: false }),
            });

            const data = await res.json();
            if (data.success) {
                setBookings((prev) =>
                    prev.map((b) =>
                        b._id === id ? { ...b, status: "cancelled", isNew: false } : b
                    )
                );
            }
        } catch (error) {
            console.error("Error cancelling booking:", error);
        } finally {
            setUpdatingBookingId(null);
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    bg: "bg-yellow-100",
                    text: "text-yellow-800",
                    icon: <AlertCircle className="w-4 h-4" />,
                    label: "Pending",
                };
            case "confirmed":
                return {
                    bg: "bg-green-100",
                    text: "text-green-800",
                    icon: <CheckCircle className="w-4 h-4" />,
                    label: "Confirmed ✅",
                };
            case "cancelled":
                return {
                    bg: "bg-red-100",
                    text: "text-red-800",
                    icon: <XCircle className="w-4 h-4" />,
                    label: "Cancelled",
                };
            case "completed":
                return {
                    bg: "bg-blue-100",
                    text: "text-blue-800",
                    icon: <CheckCircle className="w-4 h-4" />,
                    label: "Completed ✓",
                };
            default:
                return {
                    bg: "bg-slate-100",
                    text: "text-slate-800",
                    icon: null,
                    label: status,
                };
        }
    };

    if (loading || dataLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="py-16">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                            {error}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Header />
                <main className="py-16">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-800 mb-4">
                            Please Login to View Your Schedule
                        </h1>
                        <p className="text-slate-600 mb-6">
                            You need to be logged in to view your appointments.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
                        >
                            Login to Continue
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const isProvider = user.role === "provider";
    const formatTime = (time: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    // Sort bookings by date
    const sortedBookings = [...bookings].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            My Schedule
                        </h1>
                        <p className="text-slate-600">
                            {isProvider
                                ? "Manage your upcoming appointments and client bookings."
                                : "View your booked appointments with service providers."}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                            <User className="w-4 h-4" />
                            Logged in as: {isProvider ? "Provider" : "Client"}
                        </div>
                    </div>

                    {/* Appointments List */}
                    <div className="space-y-4">
                        {sortedBookings.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                    No Appointments Yet
                                </h3>
                                <p className="text-slate-500">
                                    {isProvider
                                        ? "You don't have any bookings yet."
                                        : "You haven't booked any services yet."}
                                </p>
                            </div>
                        ) : (
                            sortedBookings.map((booking) => {
                                const statusBadge = getStatusBadge(booking.status);
                                // Check if this is a booking made TO you (you're the provider)
                                const isProviderBooking = booking.userId !== user?.id;
                                // Get provider name from populated data
                                const providerInfo = booking.providerId as { name?: string; category?: string } | undefined;

                                return (
                                    <div
                                        key={booking._id}
                                        className={`bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow ${
                                            booking.isNew ? "ring-2 ring-yellow-300" : ""
                                        }`}
                                    >
                                        {/* Booking Type Badge */}
                                        <div className="mb-3 flex items-center gap-2 flex-wrap">
                                            {isProviderBooking ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                    📥 Booking from Client
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                                    📤 Your Booking
                                                </span>
                                            )}
                                            {booking.isNew && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full animate-pulse">
                                                    ✨ NEW
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            {/* Appointment Details */}
                                            <div className="flex-1">
                                                {/* Title - Different based on whether it's a provider booking */}
                                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                                    {isProviderBooking ? (
                                                        <span className="flex items-center gap-2">
                                                            <User className="w-5 h-5 text-slate-500" />
                                                            {booking.clientName}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <Briefcase className="w-5 h-5 text-slate-500" />
                                                            {providerInfo?.name || "Provider"}
                                                        </span>
                                                    )}
                                                </h3>

                                                {/* Service/Category */}
                                                {providerInfo?.category && (
                                                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                            {providerInfo.category}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Date & Time */}
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(booking.date)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {formatTime(booking.timeSlot)}
                                                    </span>
                                                </div>

                                                {/* Notes */}
                                                {booking.notes && (
                                                    <p className="text-sm text-slate-500 mt-2">
                                                        📝 {booking.notes}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="flex items-center gap-3">
                                                {/* Status Badge */}
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}
                                                >
                                                    {statusBadge.icon}
                                                    {statusBadge.label}
                                                </span>

                                                {/* Provider Action Buttons (only for pending status and provider bookings) */}
                                                {isProviderBooking && booking.status === "pending" && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleConfirm(booking._id)}
                                                            disabled={updatingBookingId === booking._id}
                                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold rounded-lg transition-colors"
                                                        >
                                                            {updatingBookingId === booking._id ? "..." : "Confirm"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(booking._id)}
                                                            disabled={updatingBookingId === booking._id}
                                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold rounded-lg transition-colors"
                                                        >
                                                            {updatingBookingId === booking._id ? "..." : "Cancel"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 p-4 bg-slate-100 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Status Legend:</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                                Pending - Awaiting confirmation
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                Confirmed - Appointment set
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                Cancelled - Appointment cancelled
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
