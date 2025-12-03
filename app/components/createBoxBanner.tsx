import { TBoxType } from "app/lib/api/mysify/schema";
import { useState } from "react";

import {
  Gift,
  Package,
  Shuffle,
  Sparkles,
  ChevronRight,
  Box,
} from "lucide-react";

export function CreateMysteryBoxBanner() {
  const [selectedType, setSelectedType] = useState<TBoxType | null>(null);

  return (
    <div className="rounded-xl bg-white shadow-sm border border-[#e1e3e5] overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#008060] to-[#004c3f] px-6 py-4 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Create a Mystery Box
            </h2>
            <p className="text-sm text-white/80">
              Surprise your customers with curated or random products
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-sm text-[#6d7175] mb-5">
          Mystery boxes are a great way to increase excitement and clear
          inventory. Choose how you'd like to set up your mystery box:
        </p>

        {/* Choice Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Bundle Option */}
          <button
            onClick={() => setSelectedType("bundle")}
            className={`relative p-5 rounded-lg border-2 text-left transition-all ${
              selectedType === "bundle"
                ? "border-[#008060] bg-[#f0fdf9]"
                : "border-[#e1e3e5] hover:border-[#8c9196] bg-white"
            }`}
          >
            {selectedType === "bundle" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#008060] flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            <div className="w-12 h-12 rounded-lg bg-[#fef3cd] flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-[#b98900]" />
            </div>
            <h3 className="font-semibold text-[#202223] mb-1">
              Mystery Bundle
            </h3>
            <p className="text-sm text-[#6d7175]">
              Curate a bundle of mystery items. Customers receive multiple
              surprise products in one box.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#637381] bg-[#f6f6f7] px-2 py-1 rounded">
                <Box className="w-3 h-3" />
                3-5 items
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#637381] bg-[#f6f6f7] px-2 py-1 rounded">
                <Sparkles className="w-3 h-3" />
                Higher value
              </span>
            </div>
          </button>

          {/* Single Item Option */}
          <button
            onClick={() => setSelectedType("item")}
            className={`relative p-5 rounded-lg border-2 text-left transition-all ${
              selectedType === "item"
                ? "border-[#008060] bg-[#f0fdf9]"
                : "border-[#e1e3e5] hover:border-[#8c9196] bg-white"
            }`}
          >
            {selectedType === "item" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#008060] flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            <div className="w-12 h-12 rounded-lg bg-[#e3f1df] flex items-center justify-center mb-3">
              <Shuffle className="w-6 h-6 text-[#008060]" />
            </div>
            <h3 className="font-semibold text-[#202223] mb-1">
              Random Single Item
            </h3>
            <p className="text-sm text-[#6d7175]">
              One randomly selected item from your inventory. Perfect for
              affordable mystery options.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#637381] bg-[#f6f6f7] px-2 py-1 rounded">
                <Gift className="w-3 h-3" />1 item
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#637381] bg-[#f6f6f7] px-2 py-1 rounded">
                <Sparkles className="w-3 h-3" />
                Quick setup
              </span>
            </div>
          </button>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e1e3e5]">
          <button className="text-sm text-[#6d7175] hover:text-[#202223] transition-colors">
            Learn more about mystery boxes
          </button>
          <button
            disabled={!selectedType}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              selectedType
                ? "bg-[#008060] text-white hover:bg-[#006e52] shadow-sm"
                : "bg-[#f6f6f7] text-[#8c9196] cursor-not-allowed"
            }`}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
