import { useState, useEffect, useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/lib/storage-helpers";
import { toast } from "sonner";

interface PhotoUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  required?: boolean;
  userId: string;
  checklistId: string;
  fieldName: string;
}

export const PhotoUpload = ({ label, value, onChange, required, userId, checklistId, fieldName }: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Sync preview with value prop (but only if it's different)
  useEffect(() => {
    if (value && value !== preview && !uploading) {
      setPreview(value);
    }
  }, [value]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      // Clean up previous object URL if exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      // Create preview immediately for better UX
      const previewUrl = URL.createObjectURL(file);
      objectUrlRef.current = previewUrl;
      setPreview(previewUrl);

      // Upload to Supabase Storage
      const url = await uploadMedia(file, userId, checklistId, fieldName);

      // Update parent component with the permanent URL
      onChange(url);

      // Clean up object URL and use the permanent URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreview(url);

      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo. Please try again.");

      // Revert preview on error
      setPreview(value);

      // Clean up object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    } finally {
      setUploading(false);

      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    // Clean up object URL if exists
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPreview(undefined);
    onChange("");

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt={label}
            className="w-32 h-32 object-cover rounded border"
            onError={(e) => {
              console.error("Image load error:", e);
              e.currentTarget.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect width="128" height="128" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="16" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
            }}
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={uploading}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            /* ANDROID FIX: Remove capture attribute for better compatibility */
            onChange={handleFileChange}
            className="hidden"
            id={`photo-${fieldName}`}
            disabled={uploading}
          />
          <label htmlFor={`photo-${fieldName}`}>
            <Button type="button" variant="outline" asChild disabled={uploading}>
              <span className="cursor-pointer">
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};
