"use client";

import { Provider } from "@/types";
import ProviderCard from "./ProviderCard";
import { Users } from "lucide-react";

interface ProviderGridProps {
  providers: Provider[];
  loading: boolean;
}

export default function ProviderGrid({ providers, loading }: ProviderGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
          >
            <div className="p-5">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="flex border-t border-slate-100">
              <div className="flex-1 h-14 bg-slate-200"></div>
              <div className="flex-1 h-14 bg-slate-300"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">
          No providers found
        </h3>
        <p className="text-slate-500">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {providers.map((provider) => (
        <ProviderCard key={provider._id} provider={provider} />
      ))}
    </div>
  );
}
