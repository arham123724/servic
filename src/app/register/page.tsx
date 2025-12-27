"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  ArrowLeft,
  User,
  Phone,
  FileText,
  Briefcase,
  MapPin,
  CheckCircle,
  Mail,
  DollarSign,
  Clock,
  Award,
  ListChecks,
} from "lucide-react";
import { CATEGORIES } from "@/models/Provider";
import { validateEmail, validatePhone, getEmailError, getPhoneError } from "@/lib/validation";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [servicesInput, setServicesInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bio: "",
    category: "",
    location: "",
    address: "",
    hourlyRate: "",
    experience: "",
    services: [] as string[],
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleAddService = () => {
    if (servicesInput.trim() && !formData.services.includes(servicesInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, servicesInput.trim()],
      }));
      setServicesInput("");
    }
  };

  const handleRemoveService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (
      !formData.name ||
      !formData.phone ||
      !formData.category ||
      !formData.location
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Validate phone number
    if (!validatePhone(formData.phone)) {
      setError(getPhoneError(formData.phone));
      setLoading(false);
      return;
    }

    // Validate email if provided
    if (formData.email && !validateEmail(formData.email)) {
      setError(getEmailError(formData.email));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        bio: formData.bio || undefined,
        category: formData.category,
        location: formData.location,
        address: formData.address || undefined,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        experience: formData.experience ? Number(formData.experience) : undefined,
        services: formData.services.length > 0 ? formData.services : undefined,
        workingHours: {
          start: formData.workingHoursStart,
          end: formData.workingHoursEnd,
          days: formData.workingDays,
        },
      };

      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.error || "Failed to register. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Registration Successful!
          </h2>
          <p className="text-slate-600 mb-4">
            Your profile has been submitted. Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
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

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2563EB] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#2563EB] to-[#1e40af] px-6 py-8 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                Register as a Service Provider
              </h1>
              <p className="text-blue-100 mt-2">
                Join our platform and connect with customers in your area.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Basic Information Section */}
              <div className="border-b border-slate-200 pb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+923001234567"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Service Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all cursor-pointer"
                      required
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="border-b border-slate-200 pb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Location
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Karachi, Lahore, Islamabad"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Full Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address, area"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details Section */}
              <div className="border-b border-slate-200 pb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hourly Rate */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Hourly Rate (PKR)
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Award className="w-4 h-4 inline mr-1" />
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g., 5"
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Bio / Description
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell customers about your experience, skills, and services..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Services */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <ListChecks className="w-4 h-4 inline mr-1" />
                    Services Offered
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={servicesInput}
                      onChange={(e) => setServicesInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddService())}
                      placeholder="Add a service (e.g., AC Repair)"
                      className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.services.map((service) => (
                        <span
                          key={service}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => handleRemoveService(service)}
                            className="hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Working Hours Section */}
              <div className="pb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                  <Clock className="w-5 h-5 inline mr-1" />
                  Working Hours
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="workingHoursStart"
                      value={formData.workingHoursStart}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="workingHoursEnd"
                      value={formData.workingHoursEnd}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.workingDays.includes(day)
                            ? "bg-[#2563EB] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
