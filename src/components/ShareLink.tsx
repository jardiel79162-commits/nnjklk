import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareLinkProps {
  link: string;
}

export function ShareLink({ link }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Seu vídeo está pronto!
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Compartilhe o link abaixo
        </p>
      </div>

      <div className="flex items-center gap-2 p-3 bg-secondary rounded-xl border border-border">
        <input
          type="text"
          value={link}
          readOnly
          className="flex-1 bg-transparent text-sm font-mono text-foreground outline-none truncate"
        />
        <button
          onClick={copyToClipboard}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
            copied
              ? "bg-green-500/20 text-green-400"
              : "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar
            </>
          )}
        </button>
      </div>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Abrir em nova aba
      </a>
    </div>
  );
}
