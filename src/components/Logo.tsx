import { Play } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo = ({ className = "", showText = true }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-9 h-9 flex items-center justify-center">
        <div className="absolute inset-0 rounded-xl gradient-primary opacity-20" />
        <Play className="w-5 h-5 text-primary fill-primary" />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          <span className="gradient-text">One</span>
          <span className="text-foreground">Clip</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
