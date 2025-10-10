-- Add DELETE and UPDATE policies for checklist-media storage bucket

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'checklist-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own uploads (e.g., metadata)
CREATE POLICY "Users can update own uploads"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'checklist-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to delete any uploads in checklist-media
CREATE POLICY "Admins can delete any checklist media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'checklist-media' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update any uploads in checklist-media
CREATE POLICY "Admins can update any checklist media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'checklist-media' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);