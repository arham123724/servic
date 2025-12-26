"use client";

import { useState, useEffect, useCallback } from "react";
import { Wrench, Plus } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ProviderGrid from "@/components/ProviderGrid";
import { Provider, ApiResponse } from "@/types";

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [locations, setLocations] = useState<string[]>([]);

  // Fetch all providers on mount
  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch("/api/providers");
        const data: ApiResponse<Provider[]> = await res.json();

        if (data.success && data.data) {
          setProviders(data.data);
          setFilteredProviders(data.data);

          // Extract unique locations
          const uniqueLocations = [
            ...new Set(data.data.map((p) => p.location)),
          ];
          setLocations(uniqueLocations);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, []);

  // Filter providers when category or location changes
  const filterProviders = useCallback(() => {
    let filtered = [...providers];

    if (category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (location !== "all") {
      filtered = filtered.filter((p) => p.location === location);
    }

    setFilteredProviders(filtered);
  }, [providers, category, location]);

  useEffect(() => {
    filterProviders();
  }, [filterProviders]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Wrench className="w-8 h-8 text-[#2563EB]" />
              <span className="text-xl font-bold text-slate-800">
                LocalServe
              </span>
            </div>
            <Link
              href="/register"
              className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Register as Provider</span>
              <span className="sm:hidden">Register</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#2563EB] to-[#1e40af] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Find Trusted Local Services
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Connect with verified electricians, plumbers, tutors, carpenters,
            and mechanics in your city. Quick, reliable, and hassle-free.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar
              category={category}
              location={location}
              locations={locations}
              onCategoryChange={setCategory}
              onLocationChange={setLocation}
            />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Service Providers
              </h2>
              <p className="text-slate-500 mt-1">
                {loading
                  ? "Loading..."
                  : `${filteredProviders.length} provider${
                      filteredProviders.length !== 1 ? "s" : ""
                    } found`}
              </p>
            </div>
          </div>

          {/* Provider Grid */}
          <ProviderGrid providers={filteredProviders} loading={loading} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="w-6 h-6 text-[#2563EB]" />
            <span className="text-lg font-semibold text-white">LocalServe</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} LocalServe. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Connecting you with trusted local service professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
