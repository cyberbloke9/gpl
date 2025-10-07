import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface PhotoUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  required?: boolean;
}

export const PhotoUpload = ({ label, value, onChange, required }: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | undefined>(value);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
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
            id={`photo-${label}`}
          />
          <label htmlFor={`photo-${label}`}>
            <Button type="button" variant="outline" asChild>
              <span>
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};
