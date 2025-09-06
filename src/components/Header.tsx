import { Button } from "@/components/ui/button";
import { HelpCircle, LogIn, LogOut, RotateCcw, MessageSquare, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  onClearSearch: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header = ({ onClearSearch, isLoggedIn, onLogin, onLogout }: HeaderProps) => {
  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">GEOSHIFT</h1>
              <p className="text-xs opacity-90">Detect. Monitor. Act.</p>
            </div>
          </div>
        </div>

        <nav className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSearch}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Search
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear all search criteria</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </TooltipTrigger>
            <TooltipContent>Get help and documentation</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send us feedback</TooltipContent>
          </Tooltip>

          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onLogin}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};