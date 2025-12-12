-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view videos (public links)
CREATE POLICY "Anyone can view videos"
ON public.videos
FOR SELECT
USING (true);

-- Allow anyone to insert videos (no auth required for upload)
CREATE POLICY "Anyone can upload videos"
ON public.videos
FOR INSERT
WITH CHECK (true);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('videos', 'videos', true, 524288000);

-- Storage policies for videos bucket
CREATE POLICY "Anyone can view video files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Anyone can upload video files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'videos');

-- Create function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_video_slug()
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    new_slug := substr(md5(random()::text || clock_timestamp()::text), 1, 8);
    SELECT EXISTS(SELECT 1 FROM public.videos WHERE slug = new_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
  END LOOP;
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql SET search_path = public;