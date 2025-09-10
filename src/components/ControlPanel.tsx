import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Play, Brain, FileText, BarChart3 } from "lucide-react";
import { format, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UsgsIntegration } from "@/components/UsgsIntegration";

const imageryOptions = [
  { value: "modis", label: "MODIS Terra - True Color" },
  { value: "viirs", label: "VIIRS SNPP - True Color" },
  { value: "landsat-true", label: "Landsat - True Colour" },
  { value: "landsat-ndvi", label: "MODIS - NDVI" },
  { value: "landsat-temp", label: "MODIS - Land Surface Temperature" },
  { value: "night-lights", label: "VIIRS - Black Marble (Night Lights)" },
];

interface ControlPanelProps {
  onViewResult: (imagery: string, startDate: Date | undefined, endDate: Date | undefined) => void;
  onChangeDetection: () => void;
  onUsgsSceneSelect?: (beforeScene: any, afterScene: any) => void;
}

export const ControlPanel = ({ 
  onViewResult, 
  onChangeDetection,
  onUsgsSceneSelect
}: ControlPanelProps) => {
  const navigate = useNavigate();
  const [firstImagery, setFirstImagery] = useState("");
  const [secondImagery, setSecondImagery] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleViewResult = () => {
    if (!firstImagery || !startDate || !endDate) {
      toast.error("Please select imagery and dates");
      return;
    }
    
    // Check if dates are valid
    if (isAfter(startDate, endDate)) {
      toast.error("Start date must be before end date");
      return;
    }
    
    // Check if dates are not too far in the future
    const today = new Date();
    if (isAfter(startDate, today) || isAfter(endDate, today)) {
      toast.warning("Selected dates are in the future. Imagery may not be available.");
    }
    
    // Check date range for different imagery types
    const minDate = new Date("2000-01-01");
    if (isBefore(startDate, minDate) || isBefore(endDate, minDate)) {
      toast.warning("Limited imagery available before year 2000");
    }
    
    onViewResult(firstImagery, startDate, endDate);
    toast.success("Loading NASA Earthdata imagery...");
  };

  const handleChangeDetection = () => {
    if (!firstImagery || !secondImagery) {
      toast.error("Please select imagery first");
      return;
    }
    onChangeDetection();
    toast.info("AI change detection initiated (Demo)");
  };


  const handleGenerateReport = () => {
    if (!firstImagery || !startDate || !endDate) {
      toast.error("Please select imagery and dates first");
      return;
    }
    
    // Navigate to report page with current selection
    navigate("/report", { 
      state: { 
        imagery: firstImagery,
        startDate,
        endDate
      }
    });
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Search Criteria</h2>
            
            {/* First Imagery Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="first-imagery">First Imagery</Label>
                <Select value={firstImagery} onValueChange={setFirstImagery}>
                  <SelectTrigger id="first-imagery" className="w-full mt-1">
                    <SelectValue placeholder="Select imagery type" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Second Imagery Selection */}
              <div>
                <Label htmlFor="second-imagery">Second Imagery</Label>
                <Select value={secondImagery} onValueChange={setSecondImagery}>
                  <SelectTrigger id="second-imagery" className="w-full mt-1">
                    <SelectValue placeholder="Select imagery type" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* USGS Integration */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3">USGS Satellite Imagery</h3>
            <UsgsIntegration 
              startDate={startDate}
              endDate={endDate}
              onSceneSelect={onUsgsSceneSelect}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t">
            <Button 
              onClick={handleViewResult} 
              className="w-full"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              View Result
            </Button>
            
            <Button 
              onClick={handleChangeDetection}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <Brain className="mr-2 h-4 w-4" />
              Change Detection (AI)
            </Button>
            
            <Button 
              onClick={handleGenerateReport}
              variant="default"
              className="w-full"
              size="lg"
              disabled={!firstImagery || !startDate || !endDate}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};