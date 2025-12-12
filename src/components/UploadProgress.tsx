import { cn } from "@/lib/utils";
import { Loader2, Check } from "lucide-react";

interface UploadProgressProps {
  progress: number;
  status: "idle" | "uploading" | "processing" | "complete" | "error";
  error?: string;
}

export function UploadProgress({ progress, status, error }: UploadProgressProps) {
  const getStatusText = () => {
    switch (status) {
      case "uploading":
        return `Enviando... ${progress}%`;
      case "processing":
        return "Processando...";
      case "complete":
        return "Upload concluído!";
      case "error":
        return error || "Erro no upload";
      default:
        return "";
    }
  };

  if (status === "idle") return null;

  return (
    <div className="w-full space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {getStatusText()}
        </span>
        {status === "uploading" && (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        )}
        {status === "processing" && (
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        )}
        {status === "complete" && (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-background" />
          </div>
        )}
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            status === "error" ? "bg-destructive" : "gradient-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
