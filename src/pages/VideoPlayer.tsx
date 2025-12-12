import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, Eye, EyeOff, Clock } from "lucide-react";

interface VideoData {
  id: string;
  slug: string;
  filename: string;
  original_name: string;
  mime_type: string;
  storage_path: string;
  expires_at: string | null;
  password_hash: string | null;
}

const VideoPlayer = () => {
  const { slug } = useParams<{ slug: string }>();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  const simpleHash = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  useEffect(() => {
    const fetchVideo = async () => {
      if (!slug) {
        setError("Link inválido");
        setLoading(false);
        return;
      }

      try {
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

        // Check if video is expired
        if (data.expires_at) {
          const expirationDate = new Date(data.expires_at);
          if (expirationDate < new Date()) {
            setIsExpired(true);
            setLoading(false);
            return;
          }
        }

        setVideo(data);

        // Check if password is required
        if (data.password_hash) {
          setNeedsPassword(true);
          setLoading(false);
          return;
        }

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !password) return;

    setPasswordError("");
    const inputHash = await simpleHash(password);

    if (inputHash === video.password_hash) {
      const { data: urlData } = supabase.storage
        .from("videos")
        .getPublicUrl(video.storage_path);

      setVideoUrl(urlData.publicUrl);
      setNeedsPassword(false);
    } else {
      setPasswordError("Senha incorreta");
    }
  };

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

  if (isExpired) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <Clock className="w-16 h-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Este vídeo expirou</p>
        <a href="/" className="text-primary hover:underline">
          Voltar ao início
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">{error}</p>
        <a href="/" className="text-primary hover:underline">
          Voltar ao início
        </a>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Vídeo protegido</h1>
              <p className="text-muted-foreground mt-1">
                Digite a senha para acessar
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {passwordError && (
              <p className="text-sm text-red-500 text-center">{passwordError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Acessar
            </button>
          </form>
        </div>
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
