import { Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <Globe className="h-4 w-4" />
            <span className="font-medium">GEOSHIFT</span>
            <span>by Proforce Galaxies © 2025</span>
          </div>
          
          <nav className="flex items-center space-x-6">
            <a 
              href="#privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#documentation" 
              className="hover:text-foreground transition-colors"
            >
              Documentation
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};