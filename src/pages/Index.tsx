import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ControlPanel } from "@/components/ControlPanel";
import { MapView } from "@/components/MapView";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedImagery, setSelectedImagery] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleClearSearch = () => {
    // Clear all search criteria
    window.location.reload();
    toast.success("Search criteria cleared");
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success("Login successful (Demo)");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.info("Logged out successfully");
  };

  const handleViewResult = (imagery: string, start: Date | undefined, end: Date | undefined) => {
    setSelectedImagery(imagery);
    setStartDate(start);
    setEndDate(end);
    setShowComparison(true);
  };

  const handleChangeDetection = () => {
    // AI change detection placeholder
    toast.info("AI Change Detection: This feature will analyze changes between selected imagery");
  };

  const handleGenerateSummary = () => {
    // AI summary generation placeholder
    toast.info("AI Summary: This feature will generate a comprehensive report of the current view");
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        onClearSearch={handleClearSearch}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ControlPanel
          onViewResult={handleViewResult}
          onChangeDetection={handleChangeDetection}
          onGenerateSummary={handleGenerateSummary}
        />
        
        <MapView
          showComparison={showComparison}
          onComparisonClose={() => setShowComparison(false)}
          selectedImagery={selectedImagery}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
