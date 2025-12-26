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
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            Service Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all cursor-pointer"
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
          <label className="block text-sm font-medium text-slate-600 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            City
          </label>
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">All Cities</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button (visual only, filtering is instant) */}
        <div className="flex items-end">
          <button className="w-full md:w-auto px-8 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
