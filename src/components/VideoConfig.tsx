import { useState } from "react";
import { Clock, Lock, Infinity, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoConfigData {
  expiresIn: "unlimited" | "1h" | "24h" | "7d" | "30d";
  password: string;
}

interface VideoConfigProps {
  config: VideoConfigData;
  onChange: (config: VideoConfigData) => void;
}

const EXPIRATION_OPTIONS = [
  { value: "unlimited", label: "Ilimitado", icon: Infinity },
  { value: "1h", label: "1 hora", icon: Clock },
  { value: "24h", label: "24 horas", icon: Clock },
  { value: "7d", label: "7 dias", icon: Clock },
  { value: "30d", label: "30 dias", icon: Clock },
] as const;

export function VideoConfig({ config, onChange }: VideoConfigProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [usePassword, setUsePassword] = useState(false);

  const handleExpirationChange = (value: VideoConfigData["expiresIn"]) => {
    onChange({ ...config, expiresIn: value });
  };

  const handlePasswordChange = (password: string) => {
    onChange({ ...config, password });
  };

  const toggleUsePassword = () => {
    if (usePassword) {
      onChange({ ...config, password: "" });
    }
    setUsePassword(!usePassword);
  };

  return (
    <div className="space-y-6 p-6 rounded-2xl bg-card border border-border animate-fade-in">
      {/* Expiration */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Clock className="w-4 h-4 text-primary" />
          Tempo de expiração
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {EXPIRATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleExpirationChange(option.value)}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                config.expiresIn === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Lock className="w-4 h-4 text-primary" />
            Proteger com senha
          </label>
          <button
            type="button"
            onClick={toggleUsePassword}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors duration-200",
              usePassword ? "bg-primary" : "bg-secondary"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                usePassword ? "translate-x-7" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {usePassword && (
          <div className="relative animate-fade-in">
            <input
              type={showPassword ? "text" : "password"}
              value={config.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Digite a senha"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
