"use client";

import { Phone, MessageCircle, MapPin, BadgeCheck } from "lucide-react";
import { Provider } from "@/types";

interface ProviderCardProps {
  provider: Provider;
}

const categoryColors: Record<string, string> = {
  Electrician: "bg-yellow-100 text-yellow-800",
  Plumber: "bg-blue-100 text-blue-800",
  Tutor: "bg-purple-100 text-purple-800",
  Carpenter: "bg-amber-100 text-amber-800",
  Mechanic: "bg-gray-100 text-gray-800",
};

export default function ProviderCard({ provider }: ProviderCardProps) {
  const handleCall = async () => {
    try {
      // Log the lead first
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: provider._id, type: "call" }),
      });
    } catch (error) {
      console.error("Failed to log lead:", error);
    }
    // Open phone dialer
    window.location.href = `tel:${provider.phone}`;
  };

  const handleWhatsApp = async () => {
    try {
      // Log the lead first
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: provider._id, type: "whatsapp" }),
      });
    } catch (error) {
      console.error("Failed to log lead:", error);
    }
    // Open WhatsApp (remove + from number for wa.me)
    const cleanPhone = provider.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-slate-100">
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-800">
              {provider.name}
            </h3>
            {provider.isVerified && (
              <BadgeCheck className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              categoryColors[provider.category] || "bg-slate-100 text-slate-800"
            }`}
          >
            {provider.category}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{provider.location}</span>
        </div>

        {/* Bio */}
        {provider.bio && (
          <p className="text-slate-600 text-sm line-clamp-2 mb-4">
            {provider.bio}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-slate-100">
        <button
          onClick={handleCall}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-medium transition-colors duration-200 cursor-pointer"
        >
          <Phone className="w-5 h-5" />
          <span>Call</span>
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#25D366] hover:bg-[#1fb855] text-white font-medium transition-colors duration-200 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
