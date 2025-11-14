"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COVER_IMAGES } from "@/lib/cover-images";
import { Check, Upload } from "lucide-react";
import React, { useRef } from "react";

interface CoverImageSelectorProps {
  selectedCover: string;
  onCoverChange: (coverPath: string) => void;
  onCustomUpload?: (file: File) => void;
  className?: string;
}

export function CoverImageSelector({
  selectedCover,
  onCoverChange,
  onCustomUpload,
  className,
}: CoverImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCustomUpload) {
      onCustomUpload(file);
    }
  };

  const isCustomImage = selectedCover && !COVER_IMAGES.some((cover) => cover.path === selectedCover);

  return (
    <div className={`space-y-3 ${className || ""}`}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {COVER_IMAGES.map((cover) => (
            <Card
              key={cover.id}
              className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedCover === cover.path ? "ring-2 ring-blue-500 ring-offset-2" : "hover:shadow-md"
              }`}
              onClick={() => onCoverChange(cover.path)}
            >
              <div className="relative aspect-video overflow-hidden rounded-md">
                <img src={cover.preview} alt={cover.name} className="h-full w-full object-cover" />
                {selectedCover === cover.path && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2 text-center">
                <p className="text-sm font-medium text-gray-700">{cover.name}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Upload Custom Image Section */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload ảnh riêng
            </Button>
            {isCustomImage && (
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 rounded border overflow-hidden">
                  <img src={selectedCover} alt="Custom cover" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm text-green-600">✓ Đã upload</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {selectedCover && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 mb-2">Ảnh bìa đã chọn:</p>
          <div className="relative aspect-video w-32 mx-auto overflow-hidden rounded-md border">
            <img src={selectedCover} alt="Selected cover" className="h-full w-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}
