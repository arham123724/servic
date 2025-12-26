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
  DollarSign,
  Award,
  CheckCircle,
  Briefcase,
  Mail,
} from "lucide-react";
import { Provider } from "@/types";

export default function ProviderDetailPage() {
  const params = useParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    if (params.id) {
      fetchProvider();
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
      `Hi ${provider.name}, I found you on LocalService and I'm interested in your ${provider.category} services.`
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

  if (loading) {
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
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">
                Local<span className="text-[#2563EB]">Service</span>
              </span>
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
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2563EB] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Link>

          {/* Provider Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#2563EB] to-[#1e40af] px-6 py-8 text-white">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-bold">
                    {provider.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {provider.name}
                    </h1>
                    {provider.isVerified && (
                      <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-blue-100">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {provider.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {provider.location}
                    </span>
                  </div>

                  {/* Rating */}
                  {provider.rating && provider.rating > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-blue-100">
                        ({provider.totalReviews || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {provider.hourlyRate && (
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <DollarSign className="w-6 h-6 text-[#2563EB] mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Hourly Rate</p>
                    <p className="font-semibold text-slate-800">
                      PKR {provider.hourlyRate}
                    </p>
                  </div>
                )}

                {provider.experience && (
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <Award className="w-6 h-6 text-[#2563EB] mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Experience</p>
                    <p className="font-semibold text-slate-800">
                      {provider.experience} years
                    </p>
                  </div>
                )}

                {provider.workingHours && (
                  <div className="bg-slate-50 rounded-lg p-4 text-center col-span-2">
                    <Clock className="w-6 h-6 text-[#2563EB] mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Working Hours</p>
                    <p className="font-semibold text-slate-800">
                      {formatTime(provider.workingHours.start)} - {formatTime(provider.workingHours.end)}
                    </p>
                  </div>
                )}
              </div>

              {/* Working Days */}
              {provider.workingHours?.days && provider.workingHours.days.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Working Days
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                      (day) => (
                        <span
                          key={day}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            provider.workingHours?.days?.includes(day)
                              ? "bg-[#2563EB] text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {provider.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    About
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{provider.bio}</p>
                </div>
              )}

              {/* Services */}
              {provider.services && provider.services.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Services Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.services.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-2 bg-blue-50 text-[#2563EB] rounded-lg text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

              {/* CTA Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={handleCall}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-[#22C55E] hover:bg-[#16a34a] text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
