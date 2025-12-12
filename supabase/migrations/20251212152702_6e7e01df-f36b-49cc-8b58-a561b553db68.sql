-- Add expiration and password fields to videos table
ALTER TABLE public.videos 
ADD COLUMN expires_at timestamp with time zone DEFAULT NULL,
ADD COLUMN password_hash text DEFAULT NULL;

-- Create index for expiration queries
CREATE INDEX idx_videos_expires_at ON public.videos(expires_at) WHERE expires_at IS NOT NULL;