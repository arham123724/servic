"use client";

import { useState } from "react";
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

// Mock appointment data with email fields for filtering
interface Appointment {
    id: number;
    clientName: string;
    clientEmail: string;
    providerName: string;
    providerEmail: string;
    service: string;
    date: string;
    time: string;
    status: "pending" | "confirmed" | "cancelled";
}

const initialAppointments: Appointment[] = [
    {
        id: 1,
        clientName: "Ali Client",
        clientEmail: "client@demo.com",
        providerName: "Ahmad Electrician",
        providerEmail: "provider@demo.com",
        service: "Electrician",
        date: "2025-12-29",
        time: "10:00 AM",
        status: "pending",
    },
    {
        id: 2,
        clientName: "Demo Client",
        clientEmail: "client@demo.com",
        providerName: "Fatima Tutor",
        providerEmail: "fatima@tutor.com",
        service: "Tutor",
        date: "2025-12-30",
        time: "02:00 PM",
        status: "confirmed",
    },
    {
        id: 3,
        clientName: "Hassan Raza",
        clientEmail: "hassan@gmail.com",
        providerName: "Demo Provider",
        providerEmail: "provider@demo.com",
        service: "Plumber",
        date: "2025-01-04",
        time: "11:00 AM",
        status: "pending",
    },
    {
        id: 4,
        clientName: "Demo Client",
        clientEmail: "client@demo.com",
        providerName: "Usman Mechanic",
        providerEmail: "usman@mechanic.com",
        service: "Mechanic",
        date: "2025-01-10",
        time: "09:00 AM",
        status: "confirmed",
    },
    {
        id: 5,
        clientName: "Zainab Fatima",
        clientEmail: "zainab@gmail.com",
        providerName: "Demo Provider",
        providerEmail: "provider@demo.com",
        service: "Electrician",
        date: "2025-01-15",
        time: "03:00 PM",
        status: "pending",
    },
];

export default function SchedulePage() {
    const { user, loading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

    // Filter appointments by user email (show if user is client OR provider)
    const myAppointments = user
        ? appointments.filter(
            (appt) => appt.clientEmail === user.email || appt.providerEmail === user.email
        )
        : [];

    // Sort by date (earliest first)
    const sortedAppointments = [...myAppointments].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group appointments into Today, Upcoming, and Past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAppointments = sortedAppointments.filter((appt) => {
        const apptDate = new Date(appt.date);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() === today.getTime();
    });

    const upcomingAppointments = sortedAppointments.filter((appt) => {
        const apptDate = new Date(appt.date);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() > today.getTime();
    });

    const pastAppointments = sortedAppointments.filter((appt) => {
        const apptDate = new Date(appt.date);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() < today.getTime();
    });

    // Handle confirm booking (Provider action)
    const handleConfirm = (id: number) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === id ? { ...apt, status: "confirmed" as const } : apt
            )
        );
    };

    // Handle cancel booking (Provider action)
    const handleCancel = (id: number) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === id ? { ...apt, status: "cancelled" as const } : apt
            )
        );
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
            default:
                return {
                    bg: "bg-slate-100",
                    text: "text-slate-800",
                    icon: null,
                    label: status,
                };
        }
    };

    // Render appointment card
    const renderAppointmentCard = (appointment: Appointment, isProvider: boolean) => {
        const statusBadge = getStatusBadge(appointment.status);

        return (
            <div
                key={appointment.id}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Appointment Details */}
                    <div className="flex-1">
                        {/* Title - Different based on role */}
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {isProvider ? (
                                <span className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-500" />
                                    {appointment.clientName}
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-slate-500" />
                                    {appointment.providerName}
                                </span>
                            )}
                        </h3>

                        {/* Service */}
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {appointment.service}
                            </span>
                        </div>

                        {/* Date & Time */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formatDate(appointment.date)}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {appointment.time}
                            </span>
                        </div>
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

                        {/* Provider Action Buttons (only for pending status) */}
                        {isProvider && appointment.status === "pending" && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleConfirm(appointment.id)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => handleCancel(appointment.id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
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

    return (
        <div className="min-h-screen bg-slate-50 overflow-y-scroll">
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

                    {/* Appointments Sections */}
                    {sortedAppointments.length === 0 ? (
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
                        <div className="space-y-8">
                            {/* Today's Appointments */}
                            {todayAppointments.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h2 className="text-xl font-bold text-slate-800">📅 Today</h2>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                            {todayAppointments.length}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {todayAppointments.map((appt) => renderAppointmentCard(appt, isProvider))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Appointments */}
                            {upcomingAppointments.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h2 className="text-xl font-bold text-slate-800">🔮 Upcoming</h2>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                            {upcomingAppointments.length}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        {upcomingAppointments.map((appt) => renderAppointmentCard(appt, isProvider))}
                                    </div>
                                </div>
                            )}

                            {/* Past Appointments */}
                            {pastAppointments.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <h2 className="text-xl font-bold text-slate-800 text-slate-500">📜 Past</h2>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                                            {pastAppointments.length}
                                        </span>
                                    </div>
                                    <div className="space-y-4 opacity-70">
                                        {pastAppointments.map((appt) => renderAppointmentCard(appt, isProvider))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
