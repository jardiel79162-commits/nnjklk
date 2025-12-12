import { useCallback, useState } from "react";
import { Upload, Film, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export function VideoDropzone({ onFileSelect, disabled }: VideoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return "Formato não suportado. Use MP4, WebM, OGG, MOV, AVI ou MKV.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Arquivo muito grande. Máximo: 500MB.";
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[300px] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-card/50",
          disabled && "opacity-50 cursor-not-allowed",
          selectedFile && "border-primary/30 bg-card"
        )}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-4 p-6 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center">
                <Film className="w-10 h-10 text-primary" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/80 transition-colors"
              >
                <X className="w-4 h-4 text-destructive-foreground" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground truncate max-w-[280px]">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-6">
            <div
              className={cn(
                "w-20 h-20 rounded-xl flex items-center justify-center transition-all duration-300",
                isDragging
                  ? "bg-primary/30 scale-110"
                  : "bg-secondary group-hover:bg-primary/20"
              )}
            >
              <Upload
                className={cn(
                  "w-10 h-10 transition-colors duration-300",
                  isDragging
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary"
                )}
              />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Arraste seu vídeo aqui
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground/70 mt-3">
                MP4, WebM, MOV • Máx. 500MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive text-center animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
