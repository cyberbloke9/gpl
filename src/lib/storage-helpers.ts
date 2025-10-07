import { supabase } from '@/integrations/supabase/client';

export const compressImage = async (file: File, maxSizeMB = 1): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => resolve(blob!),
          'image/jpeg',
          0.85
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const uploadMedia = async (
  file: File,
  userId: string,
  checklistId: string,
  fieldName: string
): Promise<string> => {
  const compressed = await compressImage(file);
  const fileName = `${userId}/${checklistId}/${fieldName}_${Date.now()}.jpg`;
  
  const { data, error } = await supabase.storage
    .from('checklist-media')
    .upload(fileName, compressed, { upsert: true });
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('checklist-media')
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
};
