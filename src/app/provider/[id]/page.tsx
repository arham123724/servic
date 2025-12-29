"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  Clock,
  Banknote,
  Award,
  CheckCircle,
  Briefcase,
  Mail,
  Calendar,
} from "lucide-react";
import { Provider } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { validatePhone, getPhoneError } from "@/lib/validation";

export default function ProviderDetailPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookedSlots, setBookedSlots] = useState<Array<{ date: string; timeSlot: string }>>([]);

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingData, setBookingData] = useState({
    date: "",
    timeSlot: "",
    clientPhone: "",
    notes: "",
  });

  // Review system state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userReviews, setUserReviews] = useState<Array<{ name: string; stars: number; text: string; time: string }>>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`/api/providers/${params.id}`);
        if (!response.ok) {
          throw new Error("Provider not found");
        }
        const data = await response.json();
        setProvider(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load provider");
      } finally {
        setLoading(false);
      }
    };

    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`/api/bookings/provider/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setBookedSlots(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch booked slots:", err);
      }
    };

    if (params.id) {
      fetchProvider();
      fetchBookedSlots();
    }
  }, [params.id]);

  const handleCall = async () => {
    if (!provider) return;

    // Track lead
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: provider._id,
        type: "call",
      }),
    });

    window.location.href = `tel:${provider.phone}`;
  };

  const handleWhatsApp = async () => {
    if (!provider) return;

    // Track lead
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: provider._id,
        type: "whatsapp",
      }),
    });

    const phone = provider.phone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hi ${provider.name}, I found you on Servic and I'm interested in your ${provider.category} services.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setBookingError("Please login to book this provider");
      return;
    }

    // Validate phone number
    if (!validatePhone(bookingData.clientPhone)) {
      setBookingError(getPhoneError(bookingData.clientPhone));
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider?._id,
          ...bookingData,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setBookingSuccess(true);
        setBookingData({ date: "", timeSlot: "", clientPhone: "", notes: "" });

        // Refresh booked slots
        const response = await fetch(`/api/bookings/provider/${params.id}`);
        if (response.ok) {
          const slotsData = await response.json();
          if (slotsData.success) {
            setBookedSlots(slotsData.data);
          }
        }

        setTimeout(() => {
          setShowBookingForm(false);
          setBookingSuccess(false);
        }, 3000);
      } else {
        setBookingError(data.error || "Failed to create booking");
      }
    } catch (err) {
      setBookingError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const generateTimeSlots = () => {
    // Check if provider has working hours with start and end times
    if (!provider?.workingHours?.start || !provider?.workingHours?.end) {
      // Default slots if no working hours set
      const slots = [];
      for (let hour = 9; hour <= 17; hour++) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`);
        if (hour < 17) {
          slots.push(`${hour.toString().padStart(2, "0")}:30`);
        }
      }
      return slots;
    }

    // Parse working hours
    const startHour = parseInt(provider.workingHours.start.split(":")[0]);
    const endHour = parseInt(provider.workingHours.end.split(":")[0]);

    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  // Helper function to filter available slots based on selected date
  const getAvailableSlots = (selectedDate: string): string[] => {
    const allSlots = generateTimeSlots();

    if (!selectedDate) return allSlots;

    const selected = new Date(selectedDate);
    const today = new Date();

    // Check if selected date is today
    const isToday = selected.toDateString() === today.toDateString();

    if (!isToday) {
      // Future date - return all slots
      return allSlots;
    }

    // It's today - filter out past slots
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();

    const availableSlots = allSlots.filter((slot) => {
      const [slotHour, slotMinutes] = slot.split(":").map(Number);

      // If slot hour is greater than current hour, it's available
      if (slotHour > currentHour) return true;

      // If same hour, check minutes (add buffer of 30 mins for booking)
      if (slotHour === currentHour && slotMinutes > currentMinutes + 30) return true;

      return false;
    });

    return availableSlots;
  };

  const isSlotBooked = (timeSlot: string) => {
    if (!bookingData.date) return false;

    return bookedSlots.some(
      (slot) =>
        new Date(slot.date).toDateString() === new Date(bookingData.date).toDateString() &&
        slot.timeSlot === timeSlot
    );
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            Provider Not Found
          </h1>
          <p className="text-slate-600 mb-6">{error || "The provider you're looking for doesn't exist."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900">Servic</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="text-[#1e3a8a] hover:text-[#1e40af] flex items-center font-bold transition-colors mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>

          {/* Provider Card - Modern Clean Design */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Section - Clean White Background */}
            <div className="px-6 py-8 border-b border-slate-200">
              <div className="flex items-start gap-6">
                {/* Large Avatar */}
                <div className="w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-slate-300">
                  <span className="text-5xl font-bold text-slate-700">
                    {provider.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  {/* Name and Verified Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {provider.name}
                    </h1>
                    {provider.isVerified && (
                      <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Category and Location Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      <Briefcase className="w-3.5 h-3.5" />
                      {provider.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {provider.location}
                    </span>
                  </div>

                  {/* Rating */}
                  {provider.rating && provider.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-slate-900">{provider.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-500 text-sm">
                        ({provider.totalReviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Quick Info Grid - Always show all 3 boxes with smart fallbacks */}
              {(() => {
                // Smart data lookup based on provider name (matching ProviderCard)
                const getSmartRate = (): string => {
                  if (provider.hourlyRate) return `PKR ${provider.hourlyRate}`;
                  const name = provider.name.toLowerCase();
                  if (name.includes("ahmad")) return "PKR 800";
                  if (name.includes("fatima")) return "PKR 1200";
                  if (name.includes("usman")) return "PKR 600";
                  if (name.includes("shehzad")) return "PKR 750";
                  if (name.includes("ali")) return "PKR 450";
                  return "PKR 500";
                };

                const getSmartExperience = (): string => {
                  if (provider.experience) return `${provider.experience} Years`;
                  const name = provider.name.toLowerCase();
                  if (name.includes("ahmad")) return "10+ Years";
                  if (name.includes("fatima")) return "4 Years";
                  if (name.includes("usman")) return "12 Years";
                  if (name.includes("shehzad")) return "7 Years";
                  if (name.includes("ali")) return "3 Years";
                  return "2+ Years";
                };

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Rate Box */}
                    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                      <Banknote className="w-5 h-5 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium mb-1">Rate</p>
                      <p className="font-bold text-slate-800">{getSmartRate()}/hr</p>
                    </div>

                    {/* Experience Box */}
                    <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                      <Award className="w-5 h-5 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium mb-1">Experience</p>
                      <p className="font-bold text-slate-800">{getSmartExperience()}</p>
                    </div>

                    {/* Working Hours */}
                    <div className="bg-slate-50 rounded-xl p-4 text-center col-span-2 border border-slate-200">
                      <Clock className="w-5 h-5 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-medium mb-1">Working Hours</p>
                      <p className="font-semibold text-slate-500 text-lg">
                        {provider.workingHours?.start && provider.workingHours?.end
                          ? `${formatTime(provider.workingHours.start)} - ${formatTime(provider.workingHours.end)}`
                          : "09:00 AM - 06:00 PM"}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Working Days - Read-only display (non-interactive) */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">
                  Available Days
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                    (day) => {
                      // Use provider's days if available, otherwise default to Mon-Sat
                      const availableDays = provider.workingHours?.days && provider.workingHours.days.length > 0
                        ? provider.workingHours.days
                        : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                      return (
                        <div
                          key={day}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-default select-none ${availableDays.includes(day)
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-400"
                            }`}
                        >
                          {day.slice(0, 3)}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* About - Always visible with fallback */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">
                  About
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {provider.bio || `Professional ${provider.category.toLowerCase()} providing quality services in ${provider.location}.`}
                </p>
              </div>

              {/* Skills & Expertise */}
              {(() => {
                // Define skills based on category
                const categorySkills: Record<string, string[]> = {
                  Tutor: ["Math", "Physics", "O-Levels", "A-Levels", "Online Classes"],
                  Electrician: ["Wiring", "AC Repair", "Installation", "Maintenance", "Troubleshooting"],
                  Plumber: ["Pipe Fitting", "Leak Repair", "Water Heater", "Drain Cleaning", "Installation"],
                  Carpenter: ["Furniture Making", "Repairs", "Custom Cabinets", "Wood Finishing", "Installation"],
                  Mechanic: ["Engine Repair", "Oil Change", "Brake Service", "Diagnostics", "AC Repair"],
                };

                // Get skills based on category, with default fallback
                const skills = categorySkills[provider.category] || ["Professional Service", "Quality Work", "Experienced"];

                return (
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-3">
                      Skills & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium cursor-default select-none"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {/* Services Offered - Always visible with fallback */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3">
                  Services Offered
                </h3>
                {provider.services && provider.services.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {provider.services.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-md">
                    <p className="font-medium">
                      {(() => {
                        const categoryServices: Record<string, string> = {
                          Electrician: "Full home wiring and appliance repair.",
                          Plumber: "Leak detection and pipe maintenance.",
                          Carpenter: "Furniture repair and custom woodwork.",
                          Tutor: "Personalized tutoring and exam preparation.",
                          Mechanic: "Engine diagnostics and vehicle maintenance.",
                        };
                        return categoryServices[provider.category] || "Professional services and consultation.";
                      })()}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span>{provider.phone}</span>
                  </div>
                  {provider.email && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span>{provider.email}</span>
                    </div>
                  )}
                  {provider.address && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      <span>{provider.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Section - DYNAMIC (Listeners to Date Selection) */}
              {(!user || user.role?.toLowerCase() !== 'provider') && (
                <div className="border-t border-slate-200 pt-6">
                  {(() => {
                    // --- KEY FIX: Use selected date OR fallback to Today ---
                    const dateToShow = bookingData.date || new Date().toISOString().split("T")[0];
                    const availableSlots = getAvailableSlots(dateToShow);
                    const isDateSelected = !!bookingData.date;

                    return (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#1e3a8a]" />
                            {isDateSelected ? "Availability for Selected Date" : "Today's Availability"}
                          </h3>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {new Date(dateToShow).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                        </div>

                        {availableSlots.length > 0 ? (
                          <div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {availableSlots.map((slot) => {
                                const isBooked = bookedSlots.some(
                                  (bookedSlot) =>
                                    new Date(bookedSlot.date).toDateString() === new Date(dateToShow).toDateString() &&
                                    bookedSlot.timeSlot === slot
                                );
                                return (
                                  <div
                                    key={slot}
                                    className={`px-2 py-2 rounded-lg text-center text-xs font-medium transition-all ${isBooked
                                      ? "bg-red-100 text-red-700 border border-red-200"
                                      : "bg-green-100 text-green-700 border border-green-200"
                                      }`}
                                    title={isBooked ? "Booked" : "Available"}
                                  >
                                    <div className="font-semibold">{formatTime(slot).replace(" ", "")}</div>
                                    <div className="text-[10px] mt-0.5 opacity-75">
                                      {isBooked ? "Booked" : "Open"}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span>
                                Available
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span>
                                Booked
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                            <p className="text-amber-700 font-medium">No available slots for this date</p>
                            <p className="text-amber-600 text-xs mt-1">Please select a different date to book</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* CTA Buttons - Modern Layout (Hidden for Providers) */}
              {(!user || user.role?.toLowerCase() !== 'provider') && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                  {/* Call - Outline Style */}
                  <button
                    onClick={handleCall}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 font-semibold rounded-lg transition-all hover:bg-slate-50 cursor-pointer"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now
                  </button>
                  {/* WhatsApp - Lighter Green */}
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#22c55e] text-white font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </button>
                </div>
              )}

              {/* Book Appointment Button - Sticky on mobile, normal on desktop (Hidden for Providers) */}
              {user && user.role?.toLowerCase() !== 'provider' && !showBookingForm && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50 md:static md:w-auto md:bg-transparent md:border-t-0 md:p-0 md:pt-2 md:z-auto">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all cursor-pointer shadow-lg md:shadow-none"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Appointment
                  </button>
                </div>
              )}

              {/* Booking Form - Centered Popup Modal (Hidden for Providers) */}
              {showBookingForm && user && user.role?.toLowerCase() !== 'provider' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                    {/* Clean Header */}
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      Schedule an Appointment
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Book a time slot that works best for you
                    </p>

                    {bookingSuccess ? (
                      <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-lg mb-4">
                        <p className="font-semibold">Booking successful! 🎉</p>
                        <p className="text-sm mt-1 text-green-700">The provider will contact you shortly to confirm.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleBookingSubmit} className="space-y-5">
                        {bookingError && (
                          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-lg">
                            <p className="font-medium text-sm">{bookingError}</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Select Date
                          </label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split("T")[0]}
                            value={bookingData.date}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, date: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Select Time Slot
                          </label>
                          <select
                            required
                            value={bookingData.timeSlot}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, timeSlot: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 cursor-pointer transition-colors"
                          >
                            <option value="" className="text-slate-500">Choose a time</option>
                            {(() => {
                              const allSlots = generateTimeSlots();
                              const availableSlots = getAvailableSlots(bookingData.date);

                              // If no date selected, show all slots
                              if (!bookingData.date) {
                                return allSlots.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {formatTime(slot)}
                                  </option>
                                ));
                              }

                              if (availableSlots.length === 0) {
                                return (
                                  <option disabled>No slots available for this date</option>
                                );
                              }

                              return availableSlots.map((slot) => {
                                const booked = isSlotBooked(slot);
                                return (
                                  <option
                                    key={slot}
                                    value={slot}
                                    disabled={booked}
                                    className={booked ? "text-slate-400 bg-slate-100" : "text-slate-900"}
                                  >
                                    {formatTime(slot)} {booked ? "🔒 Booked" : "✅ Available"}
                                  </option>
                                );
                              });
                            })()}
                          </select>
                          {bookingData.date && getAvailableSlots(bookingData.date).length === 0 && (
                            <p className="text-xs text-amber-600 mt-2 font-medium">
                              No available slots for this date. Please select a future date.
                            </p>
                          )}
                          {bookingData.date && getAvailableSlots(bookingData.date).length > 0 && (
                            <p className="text-xs text-slate-500 mt-2">
                              🔒 = Already booked | ✅ = Available for booking
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Your Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+92 300 1234567"
                            value={bookingData.clientPhone}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, clientPhone: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Describe your requirements..."
                            value={bookingData.notes}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, notes: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none transition-colors"
                          />
                        </div>

                        {/* Footer Actions - Side by Side */}
                        <div className="flex gap-3 pt-2">
                          {/* Cancel - Ghost Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowBookingForm(false);
                              setBookingData({ date: "", timeSlot: "", clientPhone: "", notes: "" });
                              setBookingError("");
                            }}
                            className="flex-1 px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-semibold rounded-lg transition-all border border-slate-200"
                          >
                            Cancel
                          </button>
                          {/* Confirm - Primary Navy Button */}
                          <button
                            type="submit"
                            disabled={bookingLoading}
                            className="flex-1 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                          >
                            {bookingLoading ? "Booking..." : "Confirm Booking"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Login prompt - Hidden for Providers (they can't book anyway) */}
              {!user && (
                <div className="border-t-2 border-slate-200 pt-6">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl text-center border-2 border-slate-200 shadow-inner">
                    <p className="text-slate-800 font-medium text-lg">
                      <Link href="/login" className="text-[#f59e0b] hover:text-[#d97706] font-bold underline">
                        Login
                      </Link>
                      {" "}or{" "}
                      <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-bold underline">
                        Sign up
                      </Link>
                      {" "}to book an appointment
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Reviews Section - Category Aware with Interactive Modal */}
              {(() => {
                // Category-specific mock reviews
                const categoryReviews: Record<string, { name: string; stars: number; text: string; time: string }[]> = {
                  Electrician: [
                    { name: "Ali Khan", stars: 5, text: "Excellent work! Fixed all the wiring issues in my house. Very professional and knew exactly what he was doing.", time: "2 days ago" },
                    { name: "Sara Ahmed", stars: 4, text: "Installed new lights and fans quickly. Good communication and fair pricing.", time: "1 week ago" },
                  ],
                  Plumber: [
                    { name: "Hassan Raza", stars: 5, text: "Fixed a major leak under the kitchen sink. Arrived on time and cleaned up after the job. Highly recommend!", time: "3 days ago" },
                    { name: "Fatima Bibi", stars: 4, text: "Replaced old pipes and fixed the taps. Professional behavior and reasonable rates.", time: "5 days ago" },
                  ],
                  Tutor: [
                    { name: "Ayesha Malik", stars: 5, text: "My son's math grades improved from C to A in just two months! Excellent teaching style and very patient.", time: "1 week ago" },
                    { name: "Ahmed Nawaz", stars: 5, text: "Great tutor for O-Levels Physics. Explains concepts clearly and provides helpful practice materials.", time: "2 weeks ago" },
                  ],
                  Mechanic: [
                    { name: "Bilal Shah", stars: 5, text: "Did a complete engine tune-up and oil change. My car runs like new now. Very knowledgeable mechanic!", time: "4 days ago" },
                    { name: "Usman Ali", stars: 4, text: "Fixed the brakes and checked the suspension. Honest about pricing and quick service.", time: "1 week ago" },
                  ],
                  Carpenter: [
                    { name: "Zainab Fatima", stars: 5, text: "Made beautiful custom cabinets for my kitchen. Attention to detail is amazing! Very skilled craftsman.", time: "3 days ago" },
                    { name: "Imran Khan", stars: 4, text: "Repaired old furniture and it looks brand new. Good quality work and fair pricing.", time: "6 days ago" },
                  ],
                };

                // Get reviews based on category, with default fallback
                const baseReviews = categoryReviews[provider.category] || [
                  { name: "Muhammad Hassan", stars: 5, text: "Very professional and punctual. Did excellent work and was very thorough with the job.", time: "2 days ago" },
                  { name: "Aisha Begum", stars: 4, text: "Good service overall. Would recommend to others looking for quality work.", time: "1 week ago" },
                ];

                // Combine user reviews with base reviews
                const allReviews = [...userReviews, ...baseReviews];

                // Calculate average rating (slightly randomized per category)
                const categoryRatings: Record<string, number> = {
                  Electrician: 4.8,
                  Plumber: 4.7,
                  Tutor: 4.9,
                  Mechanic: 4.6,
                  Carpenter: 4.8,
                };
                const avgRating = categoryRatings[provider.category] || 4.7;
                const reviewCount = (provider.category === "Tutor" ? 18 : provider.category === "Mechanic" ? 9 : 12) + userReviews.length;

                // Handle review submission
                const handleReviewSubmit = () => {
                  if (reviewRating === 0 || reviewText.trim() === "") return;

                  const newReview = {
                    name: user?.name || "You",
                    stars: reviewRating,
                    text: reviewText,
                    time: "Just now",
                  };

                  setUserReviews([newReview, ...userReviews]);
                  setShowReviewModal(false);
                  setReviewRating(0);
                  setReviewText("");
                  setToastMessage("Review submitted successfully!");
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
                };

                return (
                  <div className="border-t border-slate-200 pt-6 mt-6">
                    {/* Header with Title and Write Review Button */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900">
                        Customer Reviews
                      </h3>
                      {/* Only show for logged-in Clients (not Providers) */}
                      {user && user.role !== "provider" && (
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="px-4 py-2 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Write a Review
                        </button>
                      )}
                    </div>

                    {/* Review Modal */}
                    {showReviewModal && (
                      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                          <h4 className="text-xl font-bold text-slate-900 mb-4">Write a Review</h4>

                          {/* Star Rating Selector */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Your Rating
                            </label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="p-1 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className={`w-8 h-8 cursor-pointer ${star <= reviewRating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-slate-300 hover:text-yellow-300"
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Review Text */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Your Review
                            </label>
                            <textarea
                              rows={4}
                              placeholder="Share your experience with this provider..."
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none transition-colors"
                            />
                          </div>

                          {/* Modal Actions */}
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowReviewModal(false);
                                setReviewRating(0);
                                setReviewText("");
                              }}
                              className="flex-1 px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-semibold rounded-lg transition-all border border-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleReviewSubmit}
                              disabled={reviewRating === 0 || reviewText.trim() === ""}
                              className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                            >
                              Submit Review
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rating Summary and Reviews Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Rating Summary Card */}
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
                        <div className="text-5xl font-bold text-slate-900 mb-2">{avgRating}</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${star <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-500">Based on {reviewCount} reviews</p>
                      </div>

                      {/* Reviews List */}
                      <div className="md:col-span-2 space-y-4">
                        {allReviews.map((review, index) => (
                          <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-slate-900">{review.name}</p>
                                <p className="text-xs text-slate-400">{review.time}</p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.stars ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Success Toast */}
              {showToast && (
                <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{toastMessage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}