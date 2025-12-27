"use client";

import { Search, MapPin, Briefcase } from "lucide-react";
import { CATEGORIES } from "@/models/Provider";

interface SearchBarProps {
  category: string;
  location: string;
  locations: string[];
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
}

export default function SearchBar({
  category,
  location,
  locations,
  onCategoryChange,
  onLocationChange,
}: SearchBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-100">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            Service Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] hover:border-slate-300 transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            City
          </label>
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] hover:border-slate-300 transition-all cursor-pointer"
          >
            <option value="all">All Cities</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button - Now the prominent element with Deep Navy */}
        <div className="flex items-end">
          <button className="w-full md:w-auto px-10 py-3.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform cursor-pointer">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
