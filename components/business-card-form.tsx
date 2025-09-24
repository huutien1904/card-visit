"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
    // image: initialData?.image || "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.title || !formData.company || !formData.email) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc (Họ tên, Chức vụ, Công ty, Email)");
      return;
    }

    const cardData: BusinessCardData = {
      id: initialData?.id || generateId(),
      ...formData,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    try {
      const existingCards = JSON.parse(localStorage.getItem("businessCards") || "[]");
      const updatedCards = existingCards.filter((card: BusinessCardData) => card.id !== cardData.id);
      updatedCards.push(cardData);

      localStorage.setItem("businessCards", JSON.stringify(updatedCards));
      onSubmit(cardData);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      alert("Có lỗi xảy ra khi lưu card visit. Vui lòng thử lại.");
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
              />
            </div>
            <div>
              <Label htmlFor="title">Chức vụ *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Giám đốc kinh doanh"
                required
              />
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
            />
          </div>

          {/* <div>
            <Label htmlFor="image">Ảnh đại diện</Label>
            <div className="space-y-2">
              <Input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {formData.image && (
                <div className="flex items-center gap-2">
                  <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded-full border" />
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage}>
                    Xóa ảnh
                  </Button>
                </div>
              )}
            </div>
          </div> */}

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
              />
            </div>
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+84 123 456 789"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://company.com"
            />
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
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.twitter}
                onChange={(e) => handleInputChange("twitter", e.target.value)}
                placeholder="https://twitter.com/username"
              />
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
            <Button type="submit" className="w-full cursor-pointer">
              {isEditMode ? "Cập nhật card visit" : "Tạo card visit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
