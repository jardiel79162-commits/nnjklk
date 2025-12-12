import { useState, useCallback } from "react";
import { VideoDropzone } from "@/components/VideoDropzone";
import { UploadProgress } from "@/components/UploadProgress";
import { ShareLink } from "@/components/ShareLink";
import { VideoConfig, VideoConfigData } from "@/components/VideoConfig";
import { supabase } from "@/integrations/supabase/client";
import { Play, ArrowRight } from "lucide-react";

type UploadStatus = "idle" | "configuring" | "uploading" | "processing" | "complete" | "error";

const Index = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoConfig, setVideoConfig] = useState<VideoConfigData>({
    expiresIn: "unlimited",
    password: "",
  });

  const generateSlug = () => {
    return `jtc${Math.random().toString(36).substring(2, 8)}`;
  };

  const calculateExpirationDate = (expiresIn: VideoConfigData["expiresIn"]): Date | null => {
    if (expiresIn === "unlimited") return null;
    
    const now = new Date();
    switch (expiresIn) {
      case "1h":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "24h":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "7d":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const simpleHash = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus("configuring");
    setErrorMessage("");
  };

  const handleStartUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setUploadProgress(0);
    setShareLink(null);

    const slug = generateSlug();
    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${slug}.${fileExt}`;
    const storagePath = `uploads/${fileName}`;

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(95);
      setUploadStatus("processing");

      const expiresAt = calculateExpirationDate(videoConfig.expiresIn);
      const passwordHash = videoConfig.password 
        ? await simpleHash(videoConfig.password) 
        : null;

      const { error: dbError } = await supabase.from("videos").insert({
        slug,
        filename: fileName,
        original_name: selectedFile.name,
        mime_type: selectedFile.type,
        size_bytes: selectedFile.size,
        storage_path: storagePath,
        expires_at: expiresAt?.toISOString() || null,
        password_hash: passwordHash,
      });

      if (dbError) {
        throw dbError;
      }

      setUploadProgress(100);
      setUploadStatus("complete");
      setShareLink(`${window.location.origin}/v/${slug}`);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(error.message || "Erro ao fazer upload");
    }
  }, [selectedFile, videoConfig]);

  const resetUpload = () => {
    setUploadStatus("idle");
    setUploadProgress(0);
    setShareLink(null);
    setErrorMessage("");
    setSelectedFile(null);
    setVideoConfig({ expiresIn: "unlimited", password: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ambient background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg space-y-8">
          {/* Logo / Title */}
          <div className="text-center space-y-2 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
              <Play className="w-8 h-8 text-primary fill-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground font-display">
              VideoLink
            </h1>
            <p className="text-muted-foreground">
              Faça upload do seu vídeo e compartilhe com um link
            </p>
          </div>

          {/* Upload area */}
          <div className="space-y-6">
            {uploadStatus === "idle" && (
              <VideoDropzone
                onFileSelect={handleFileSelect}
                disabled={false}
              />
            )}

            {uploadStatus === "configuring" && selectedFile && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary fill-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>

                <VideoConfig config={videoConfig} onChange={setVideoConfig} />

                <button
                  onClick={handleStartUpload}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Iniciar Upload
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={resetUpload}
                  className="w-full py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}

            {(uploadStatus === "uploading" ||
              uploadStatus === "processing" ||
              uploadStatus === "error") && (
              <div className="p-6 rounded-2xl bg-card border border-border">
                <UploadProgress
                  progress={uploadProgress}
                  status={uploadStatus}
                  error={errorMessage}
                />
                {uploadStatus === "error" && (
                  <button
                    onClick={resetUpload}
                    className="mt-4 w-full py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}

            {uploadStatus === "complete" && shareLink && (
              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <ShareLink link={shareLink} />
                <button
                  onClick={resetUpload}
                  className="w-full py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
                >
                  Enviar outro vídeo
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground relative z-10">
        <p>Seus vídeos são armazenados de forma segura</p>
      </footer>
    </div>
  );
};

export default Index;
