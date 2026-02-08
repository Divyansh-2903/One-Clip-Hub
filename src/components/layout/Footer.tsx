import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Download from YouTube, Instagram & Pinterest in one click.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <div className="flex flex-col gap-2">
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Platforms</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">YouTube</span>
              <span className="text-sm text-muted-foreground">Instagram</span>
              <span className="text-sm text-muted-foreground">Pinterest</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            OneClip is for downloading content you own or have permission to download. Users must comply with YouTube, Instagram, and Pinterest Terms of Service and all copyright laws.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            © {new Date().getFullYear()} OneClip. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
