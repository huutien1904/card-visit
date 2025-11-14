"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateQRCode } from "@/lib/qr-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirebaseCards, BusinessCard } from "@/hooks/use-firebase-cards";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createSlug } from "@/lib/slug-utils";
import { CoverImageSelector } from "@/components/cover-image-selector";
import { COVER_IMAGES } from "@/lib/cover-images";
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
  phone1?: string;
  phone2?: string;
  email1?: string;
  email2?: string;
  address?: string;
  avatar?: string;
  imageCover?: string;
}

export function BusinessCardForm({ onSubmit, onPreview, initialData, isEditMode }: BusinessCardFormProps) {
  const { createCard, updateCard } = useFirebaseCards();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    title: initialData?.title || "",
    phone1: initialData?.phone1 || "",
    phone2: initialData?.phone2 || "",
    email1: initialData?.email1 || "",
    email2: initialData?.email2 || "",
    address: initialData?.address || "",
    avatar: initialData?.avatar || "",
    imageCover: initialData?.imageCover || COVER_IMAGES[0].path, // Default to first cover image
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        title: initialData.title || "",
        phone1: initialData.phone1 || "",
        phone2: initialData.phone2 || "",
        email1: initialData.email1 || "",
        email2: initialData.email2 || "",
        address: initialData.address || "",
        avatar: initialData.avatar || "",
        imageCover: initialData.imageCover || COVER_IMAGES[0].path,
      });
    }
  }, [initialData]);

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
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

    if (!formData.phone1.trim()) {
      newErrors.phone1 = "Số điện thoại 1 là bắt buộc";
    } else if (!validatePhone(formData.phone1)) {
      newErrors.phone1 = "Số điện thoại 1 không hợp lệ";
    }

    if (!formData.email1.trim()) {
      newErrors.email1 = "Email 1 là bắt buộc";
    } else if (!validateEmail(formData.email1)) {
      newErrors.email1 = "Email 1 không hợp lệ";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    if (!formData.avatar.trim()) {
      newErrors.avatar = "Ảnh đại diện là bắt buộc";
    }

    if (!formData.imageCover.trim()) {
      newErrors.imageCover = "Ảnh nền là bắt buộc";
    } else {
      const isPresetCover = COVER_IMAGES.some((cover) => cover.path === formData.imageCover);
      const isCustomUpload = formData.imageCover.startsWith("data:image/");

      if (!isPresetCover && !isCustomUpload) {
        newErrors.imageCover = "Vui lòng chọn ảnh nền từ danh sách hoặc upload ảnh riêng";
      }
    }

    if (formData.phone2 && !validatePhone(formData.phone2)) {
      newErrors.phone2 = "Số điện thoại 2 không hợp lệ";
    }

    if (formData.email2 && !validateEmail(formData.email2)) {
      newErrors.email2 = "Email 2 không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field as keyof FormErrors]) {
      const newErrors = { ...errors };
      delete newErrors[field as keyof FormErrors];
      setErrors(newErrors);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi kích thước file",
          description: "Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Lỗi định dạng file",
          description: "Vui lòng chọn file hình ảnh.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setFormData({ ...formData, [type]: imageUrl });

        if (errors.avatar) {
          const newErrors = { ...errors };
          delete newErrors.avatar;
          setErrors(newErrors);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomCoverUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi kích thước file",
        description: "Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi định dạng file",
        description: "Vui lòng chọn file hình ảnh.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setFormData({ ...formData, imageCover: imageUrl });

      if (errors.imageCover) {
        const newErrors = { ...errors };
        delete newErrors.imageCover;
        setErrors(newErrors);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePreview = () => {
    if (!validateForm()) {
      return;
    }

    const previewData: BusinessCardData = {
      id: generateId(),
      slug: createSlug(formData.name), // Generate preview slug
      ...formData,
      createdAt: new Date().toISOString(),
    };

    onPreview?.(previewData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cardData = {
        name: formData.name,
        title: formData.title,
        phone1: formData.phone1,
        phone2: formData.phone2,
        email1: formData.email1,
        email2: formData.email2,
        address: formData.address,
        avatar: formData.avatar,
        imageCover: formData.imageCover,
      };

      let result;

      if (isEditMode && initialData?.id) {
        result = await updateCard(initialData.id, cardData);
        toast({
          title: "Thành công!",
          description: "Card visit đã được cập nhật thành công!",
        });
      } else {
        result = await createCard(cardData);
        toast({
          title: "Thành công!",
          description: "Card visit đã được tạo thành công!",
        });
      }

      const cardWithQR: BusinessCardData = {
        id: result.id,
        slug: result.slug,
        ...formData,
        qrCode: await generateQRCode({
          id: result.id,
          slug: result.slug,
          ...formData,
          createdAt: result.createdAt,
        }),
        createdAt: result.createdAt,
      };

      onSubmit(cardWithQR);

      // Navigate to my-cards page after successful creation/update
      router.push("/my-cards");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      toast({
        title: "Có lỗi xảy ra",
        description: `Lỗi khi lưu card visit: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl text-center pt-4">
          {isEditMode ? "Chỉnh sửa Card Visit" : "Tạo Card Visit Mới"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Họ và tên */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nhập họ và tên"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Chức vụ */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Chức vụ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Nhập chức vụ"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="phone1" className="text-sm font-medium">
              Số điện thoại 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone1"
              type="tel"
              placeholder="Nhập số điện thoại chính"
              value={formData.phone1}
              onChange={(e) => handleInputChange("phone1", e.target.value)}
              className={errors.phone1 ? "border-red-500" : ""}
            />
            {errors.phone1 && <p className="text-sm text-red-500 mt-1">{errors.phone1}</p>}
          </div>

          <div>
            <Label htmlFor="phone2" className="text-sm font-medium">
              Số điện thoại 2 <span className="text-gray-400">(Tùy chọn)</span>
            </Label>
            <Input
              id="phone2"
              type="tel"
              placeholder="Nhập số điện thoại phụ"
              value={formData.phone2}
              onChange={(e) => handleInputChange("phone2", e.target.value)}
              className={errors.phone2 ? "border-red-500" : ""}
            />
            {errors.phone2 && <p className="text-sm text-red-500 mt-1">{errors.phone2}</p>}
          </div>

          <div>
            <Label htmlFor="email1" className="text-sm font-medium">
              Email 1 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email1"
              type="email"
              placeholder="Nhập email chính"
              value={formData.email1}
              onChange={(e) => handleInputChange("email1", e.target.value)}
              className={errors.email1 ? "border-red-500" : ""}
            />
            {errors.email1 && <p className="text-sm text-red-500 mt-1">{errors.email1}</p>}
          </div>

          <div>
            <Label htmlFor="email2" className="text-sm font-medium">
              Email 2 <span className="text-gray-400">(Tùy chọn)</span>
            </Label>
            <Input
              id="email2"
              type="email"
              placeholder="Nhập email phụ"
              value={formData.email2}
              onChange={(e) => handleInputChange("email2", e.target.value)}
              className={errors.email2 ? "border-red-500" : ""}
            />
            {errors.email2 && <p className="text-sm text-red-500 mt-1">{errors.email2}</p>}
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium">
              Địa chỉ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="Nhập địa chỉ"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
          </div>

          <div>
            <Label htmlFor="avatar" className="text-sm font-medium">
              Ảnh đại diện <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2 flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => avatarInputRef.current?.click()}
                className="shrink-0"
              >
                Chọn ảnh đại diện
              </Button>
              {formData.avatar && (
                <div className="flex items-center gap-2">
                  <img
                    src={formData.avatar}
                    alt="Avatar Preview"
                    className="w-16 h-16 object-cover rounded-full border"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleInputChange("avatar", "")}>
                    ✕ Xóa
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "avatar")}
              className="hidden"
            />
            {errors.avatar && <p className="text-sm text-red-500 mt-1">{errors.avatar}</p>}
          </div>

          <div>
            <Label htmlFor="imageCover" className="text-sm font-medium">
              Ảnh bìa <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              <CoverImageSelector
                selectedCover={formData.imageCover}
                onCoverChange={(coverPath) => handleInputChange("imageCover", coverPath)}
                onCustomUpload={handleCustomCoverUpload}
              />
            </div>
            {errors.imageCover && <p className="text-sm text-red-500 mt-1">{errors.imageCover}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button type="button" variant="outline" onClick={handlePreview} className="flex-1" disabled={isSubmitting}>
              Xem trước
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : isEditMode ? "Cập nhật Card" : "Tạo Card Visit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
