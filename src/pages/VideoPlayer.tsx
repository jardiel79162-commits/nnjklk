import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface VideoData {
  id: string;
  slug: string;
  filename: string;
  original_name: string;
  mime_type: string;
  storage_path: string;
}

const VideoPlayer = () => {
  const { slug } = useParams<{ slug: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!slug) {
        setError("Link inválido");
        setLoading(false);
        return;
      }

      try {
        // Fetch video metadata
        const { data, error: dbError } = await supabase
          .from("videos")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (dbError) throw dbError;

        if (!data) {
          setError("Vídeo não encontrado");
          setLoading(false);
          return;
        }

        setVideo(data);

        // Get public URL for the video
        const { data: urlData } = supabase.storage
          .from("videos")
          .getPublicUrl(data.storage_path);

        setVideoUrl(urlData.publicUrl);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching video:", err);
        setError("Erro ao carregar o vídeo");
        setLoading(false);
      }
    };

    fetchVideo();
  }, [slug]);

  // Update document title
  useEffect(() => {
    if (video) {
      document.title = video.original_name;
    }
    return () => {
      document.title = "VideoLink";
    };
  }, [video]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">{error}</p>
        <a
          href="/"
          className="text-primary hover:underline"
        >
          Voltar ao início
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {videoUrl && (
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="max-w-full max-h-full w-full h-full object-contain"
          style={{ backgroundColor: "black" }}
        >
          Seu navegador não suporta vídeos HTML5.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
