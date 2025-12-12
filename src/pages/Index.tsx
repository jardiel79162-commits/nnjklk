import { useState, useCallback } from "react";
import { VideoDropzone } from "@/components/VideoDropzone";
import { UploadProgress } from "@/components/UploadProgress";
import { ShareLink } from "@/components/ShareLink";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";

type UploadStatus = "idle" | "uploading" | "processing" | "complete" | "error";

const Index = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const generateSlug = () => {
    return `jtc${Math.random().toString(36).substring(2, 8)}`;
  };

  const handleUpload = useCallback(async (file: File) => {
    setUploadStatus("uploading");
    setUploadProgress(0);
    setShareLink(null);
    setErrorMessage("");

    const slug = generateSlug();
    const fileExt = file.name.split(".").pop();
    const fileName = `${slug}.${fileExt}`;
    const storagePath = `uploads/${fileName}`;

    try {
      // Simulate progress for better UX (Supabase doesn't have built-in progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(95);
      setUploadStatus("processing");

      // Save video metadata to database
      const { error: dbError } = await supabase.from("videos").insert({
        slug,
        filename: fileName,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        storage_path: storagePath,
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
  }, []);

  const resetUpload = () => {
    setUploadStatus("idle");
    setUploadProgress(0);
    setShareLink(null);
    setErrorMessage("");
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
                onFileSelect={handleUpload}
                disabled={uploadStatus !== "idle"}
              />
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
