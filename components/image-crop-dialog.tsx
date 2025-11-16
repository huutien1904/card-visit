"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
  circularCrop?: boolean;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  circularCrop = true,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = useCallback((image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return Promise.reject(new Error("Failed to get canvas context"));
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return Promise.resolve(canvas.toDataURL("image/jpeg", 0.95));
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!imgRef.current) {
      return;
    }

    try {
      if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
        onCropComplete(imageSrc);
        onOpenChange(false);
        return;
      }

      const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedImageUrl);
      onOpenChange(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  }, [completedCrop, getCroppedImg, onCropComplete, onOpenChange, imageSrc]);

  const handleScaleChange = (value: number[]) => {
    setScale(value[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Cắt và điều chỉnh ảnh</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5" />
            <Slider min={0.5} max={3} step={0.1} value={[scale]} onValueChange={handleScaleChange} className="flex-1" />
            <ZoomIn className="w-5 h-5" />
            <span className="text-sm text-muted-foreground min-w-[60px] text-right">{Math.round(scale * 100)}%</span>
          </div>

          <div className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circularCrop}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                style={{
                  transform: `scale(${scale})`,
                  maxWidth: "100%",
                  maxHeight: "60vh",
                }}
                onLoad={() => {
                  if (imgRef.current) {
                    const { width, height } = imgRef.current;
                    const cropSize = Math.min(width, height) * 0.9;
                    setCrop({
                      unit: "px",
                      width: cropSize,
                      height: cropSize,
                      x: (width - cropSize) / 2,
                      y: (height - cropSize) / 2,
                    });
                  }
                }}
              />
            </ReactCrop>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Kéo để di chuyển vùng chọn, sử dụng thanh trượt để zoom in/out
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleCropComplete}>Áp dụng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
