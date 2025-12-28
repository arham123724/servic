"use client";

import { useState, useEffect, useCallback } from "react";
import { Briefcase } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ProviderGrid from "@/components/ProviderGrid";
import Header from "@/components/Header";
import { Provider, ApiResponse } from "@/types";

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  // Input state (for dropdowns - changes freely without filtering)
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Active state (controls actual filtering - only changes on Search click)
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLocation, setActiveLocation] = useState("all");

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

  // Filter providers ONLY when active filters change (triggered by Search button)
  const filterProviders = useCallback(() => {
    let filtered = [...providers];

    if (activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    if (activeLocation !== "all") {
      filtered = filtered.filter((p) => p.location === activeLocation);
    }

    setFilteredProviders(filtered);
  }, [providers, activeCategory, activeLocation]);

  useEffect(() => {
    filterProviders();
  }, [filterProviders]);

  // Search handler - copies input values to active values, triggering the filter
  const handleSearch = () => {
    setActiveCategory(selectedCategory);
    setActiveLocation(selectedLocation);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Hero Section - Modern Clean Design */}
      <section className="bg-white border-b border-slate-200 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900">
            Find Trusted Local Services
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            Connect with verified electricians, plumbers, tutors, carpenters,
            and mechanics in your city. Quick, reliable, and hassle-free.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar
              category={selectedCategory}
              location={selectedLocation}
              locations={locations}
              onCategoryChange={setSelectedCategory}
              onLocationChange={setSelectedLocation}
              onSearch={handleSearch}
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
                  : `${filteredProviders.length} provider${filteredProviders.length !== 1 ? "s" : ""
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
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">Servic</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Servic. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Connecting you with trusted local service professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
