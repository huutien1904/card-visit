"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { generateQRCode } from "@/lib/qr-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BusinessCardData } from "@/app/page";

interface BusinessCardFormProps {
  onSubmit: (data: BusinessCardData) => void;
  onPreview?: (data: BusinessCardData) => void;
  initialData?: BusinessCardData;
  isEditMode?: boolean;
}

interface FormErrors {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
}

export function BusinessCardForm({ onSubmit, onPreview, initialData, isEditMode }: BusinessCardFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    title: initialData?.title || "",
    company: initialData?.company || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    website: initialData?.website || "",
    address: initialData?.address || "",
    bio: initialData?.bio || "",
    linkedin: initialData?.linkedin || "",
    twitter: initialData?.twitter || "",
    backgroundColor: initialData?.backgroundColor || "#ffffff",
    textColor: initialData?.textColor || "#000000",
    image: initialData?.image || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // URL is optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Họ và tên là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Chức vụ là bắt buộc";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Chức vụ phải có ít nhất 2 ký tự";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Tên công ty là bắt buộc";
    } else if (formData.company.trim().length < 2) {
      newErrors.company = "Tên công ty phải có ít nhất 2 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Optional fields validation
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (formData.website && !validateUrl(formData.website)) {
      newErrors.website = "URL website không hợp lệ";
    }

    if (formData.linkedin && !validateUrl(formData.linkedin)) {
      newErrors.linkedin = "URL LinkedIn không hợp lệ";
    }

    if (formData.twitter && !validateUrl(formData.twitter)) {
      newErrors.twitter = "URL Twitter không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        alert("Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, PNG hoặc GIF.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange("image", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    handleInputChange("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.files = null;
    }
  };

  const handlePreview = () => {
    console.log("Preview data:", formData);

    if (onPreview) {
      const cardData: BusinessCardData = {
        id: initialData?.id || generateId(),
        ...formData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };
      onPreview(cardData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cardData: BusinessCardData = {
        id: initialData?.id || generateId(),
        ...formData,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };

      // Generate QR code for the card
      const qrCode = await generateQRCode(cardData);
      cardData.qrCode = qrCode;

      const existingCards = JSON.parse(localStorage.getItem("businessCards") || "[]");
      const updatedCards = existingCards.filter((card: BusinessCardData) => card.id !== cardData.id);
      updatedCards.push(cardData);

      localStorage.setItem("businessCards", JSON.stringify(updatedCards));

      // Show success message
      if (isEditMode) {
        alert("Card visit đã được cập nhật thành công!");
      } else {
        alert("Card visit đã được tạo thành công!");
      }

      onSubmit(cardData);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      alert("Có lỗi xảy ra khi lưu card visit. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin card visit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Họ và tên *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="title">Chức vụ *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Giám đốc kinh doanh"
                required
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="company">Công ty *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Công ty ABC"
              required
              className={errors.company ? "border-red-500" : ""}
            />
            {errors.company && <p className="text-sm text-red-500 mt-1">{errors.company}</p>}
          </div>

          <div>
            <Label htmlFor="image">Ảnh đại diện</Label>
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500">
                Chấp nhận JPG, PNG, GIF. Tối đa 5MB. Ảnh sẽ được lưu trên thiết bị của bạn.
              </p>
              {formData.image && (
                <div className="flex items-center gap-2">
                  <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded-full border" />
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage}>
                    Xóa ảnh
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="example@company.com"
                required
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+84 123 456 789"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://company.com"
              className={errors.website ? "border-red-500" : ""}
            />
            {errors.website && <p className="text-sm text-red-500 mt-1">{errors.website}</p>}
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
            />
          </div>

          <div>
            <Label htmlFor="bio">Giới thiệu</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Mô tả ngắn về bản thân hoặc công việc..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 ký tự</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className={errors.linkedin ? "border-red-500" : ""}
              />
              {errors.linkedin && <p className="text-sm text-red-500 mt-1">{errors.linkedin}</p>}
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => handleInputChange("twitter", e.target.value)}
                placeholder="https://twitter.com/username"
                className={errors.twitter ? "border-red-500" : ""}
              />
              {errors.twitter && <p className="text-sm text-red-500 mt-1">{errors.twitter}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backgroundColor">Màu nền</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.backgroundColor}
                  onChange={(e) => handleInputChange("backgroundColor", e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="textColor">Màu chữ</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => handleInputChange("textColor", e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.textColor}
                  onChange={(e) => handleInputChange("textColor", e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent cursor-pointer"
              onClick={handlePreview}
            >
              Xem trước
            </Button>
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : isEditMode ? "Cập nhật card visit" : "Tạo card visit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
