import { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { uploadMedia } from '@/lib/storage-helpers';
import { toast } from 'sonner';

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create preview immediately for better UX
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to Supabase Storage
      const url = await uploadMedia(file, userId, checklistId, fieldName);
      onChange(url);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      setPreview(undefined);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt={label} className="w-32 h-32 object-cover rounded border" />
          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id={`photo-${fieldName}`}
            disabled={uploading}
          />
          <label htmlFor={`photo-${fieldName}`}>
            <Button type="button" variant="outline" asChild disabled={uploading}>
              <span>
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
