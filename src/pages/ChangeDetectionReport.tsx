import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Map, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Layers,
  Square,
  Activity,
  FileJson,
  FileImage,
  Table,
  ArrowLeft,
  Share2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ReportData {
  imagery: string;
  startDate: Date;
  endDate: Date;
  statistics: {
    totalChangedArea: number;
    percentageChanged: number;
    numberOfPolygons: number;
    averagePolygonSize: number;
    largestChange: number;
    changeType: string;
  };
  polygonSizeDistribution: Array<{ range: string; count: number }>;
  changeIntensity: Array<{ date: string; intensity: number }>;
  changeByCategory: Array<{ category: string; value: number; color: string }>;
}

const ChangeDetectionReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Get data from location state or generate mock data
    const state = location.state as any;
    if (state?.imagery && state?.startDate && state?.endDate) {
      generateReportData(state);
    } else {
      // Mock data for demonstration
      generateReportData({
        imagery: "modis",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-01")
      });
    }
  }, [location]);

  const generateReportData = (params: any) => {
    setIsGenerating(true);
    // Simulate API call to generate report
    setTimeout(() => {
      setReportData({
        imagery: params.imagery,
        startDate: params.startDate,
        endDate: params.endDate,
        statistics: {
          totalChangedArea: 4567.89,
          percentageChanged: 12.5,
          numberOfPolygons: 234,
          averagePolygonSize: 19.52,
          largestChange: 125.3,
          changeType: "Deforestation"
        },
        polygonSizeDistribution: [
          { range: "0-10", count: 45 },
          { range: "10-25", count: 78 },
          { range: "25-50", count: 65 },
          { range: "50-100", count: 35 },
          { range: "100+", count: 11 }
        ],
        changeIntensity: [
          { date: "Jan", intensity: 65 },
          { date: "Feb", intensity: 72 },
          { date: "Mar", intensity: 78 },
          { date: "Apr", intensity: 85 },
          { date: "May", intensity: 92 },
          { date: "Jun", intensity: 88 },
          { date: "Jul", intensity: 95 },
          { date: "Aug", intensity: 98 },
          { date: "Sep", intensity: 94 },
          { date: "Oct", intensity: 89 },
          { date: "Nov", intensity: 85 },
          { date: "Dec", intensity: 82 }
        ],
        changeByCategory: [
          { category: "Forest Loss", value: 35, color: "hsl(var(--destructive))" },
          { category: "Urban Growth", value: 25, color: "hsl(var(--primary))" },
          { category: "Water Body Change", value: 20, color: "hsl(var(--info))" },
          { category: "Agricultural", value: 15, color: "hsl(var(--success))" },
          { category: "Other", value: 5, color: "hsl(var(--muted-foreground))" }
        ]
      });
      setIsGenerating(false);
      toast.success("Report generated successfully");
    }, 2000);
  };

  const handleDownload = (format: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 300);

    // Simulate actual download
    setTimeout(() => {
      clearInterval(interval);
      setDownloadProgress(100);
      
      // Create downloadable content based on format
      if (format === "PDF") {
        generatePDFReport();
      } else if (format === "Excel") {
        generateExcelReport();
      } else if (format === "GeoJSON") {
        generateGeoJSONReport();
      } else if (format === "PNG") {
        generateImageReport();
      }
      
      toast.success(`Report downloaded as ${format}`);
      setIsDownloading(false);
      setDownloadProgress(0);
    }, 2000);
  };

  const generatePDFReport = () => {
    // In production, use jsPDF or similar library
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `change-detection-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateExcelReport = () => {
    // In production, use xlsx or similar library
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `change-detection-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateGeoJSONReport = () => {
    // Generate GeoJSON with change polygons
    const geoJSON = {
      type: "FeatureCollection",
      features: reportData?.changeByCategory.map((cat, index) => ({
        type: "Feature",
        properties: {
          category: cat.category,
          value: cat.value,
          color: cat.color
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[]]] // In production, use actual coordinates
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `change-detection-${format(new Date(), 'yyyy-MM-dd')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateImageReport = () => {
    // In production, use html2canvas or similar library
    toast.info("Capturing report as image...");
    setTimeout(() => {
      toast.success("Report saved as PNG");
    }, 1000);
  };

  const handleViewOnMap = () => {
    navigate("/", { 
      state: { 
        showComparison: true,
        ...reportData 
      } 
    });
  };

  const handleShare = () => {
    const reportUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Change Detection Analysis Report',
        text: `Analysis from ${format(reportData?.startDate || new Date(), "MMM dd, yyyy")} to ${format(reportData?.endDate || new Date(), "MMM dd, yyyy")}`,
        url: reportUrl,
      }).catch(() => {
        navigator.clipboard.writeText(reportUrl);
        toast.success("Report link copied to clipboard");
      });
    } else {
      navigator.clipboard.writeText(reportUrl);
      toast.success("Report link copied to clipboard");
    }
  };

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Activity className="h-12 w-12 animate-pulse text-primary" />
              <p className="text-muted-foreground">Generating report...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Change Detection Analysis Report</h1>
                <p className="text-muted-foreground mt-2">
                  {format(reportData.startDate, "MMM dd, yyyy")} - {format(reportData.endDate, "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleViewOnMap}>
                <Map className="h-4 w-4 mr-2" />
                View on Map
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={isDownloading}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleDownload("PDF")}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("Excel")}>
                    <Table className="h-4 w-4 mr-2" />
                    Excel Spreadsheet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("GeoJSON")}>
                    <FileJson className="h-4 w-4 mr-2" />
                    GeoJSON Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload("PNG")}>
                    <FileImage className="h-4 w-4 mr-2" />
                    PNG Image
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Download Progress */}
      {isDownloading && (
        <div className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Preparing download...</span>
              <Progress value={downloadProgress} className="flex-1 max-w-xs h-2" />
              <span className="text-sm font-medium">{downloadProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Changed Area</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Square className="h-5 w-5 text-primary" />
                {reportData.statistics.totalChangedArea.toFixed(2)} km²
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Percentage Changed</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                {reportData.statistics.percentageChanged}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Change Polygons</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Layers className="h-5 w-5 text-info" />
                {reportData.statistics.numberOfPolygons}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Primary Change Type</CardDescription>
              <CardTitle className="text-2xl">
                <Badge variant="destructive" className="text-sm">
                  {reportData.statistics.changeType}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Interactive Map</TabsTrigger>
            <TabsTrigger value="distribution">Size Distribution</TabsTrigger>
            <TabsTrigger value="temporal">Temporal Analysis</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    Analysis of satellite imagery from {reportData.imagery.toUpperCase()} sensor reveals significant 
                    environmental changes between {format(reportData.startDate, "MMMM yyyy")} and {format(reportData.endDate, "MMMM yyyy")}.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Average Polygon Size:</span>
                      <span className="font-medium">{reportData.statistics.averagePolygonSize.toFixed(2)} km²</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Largest Change Area:</span>
                      <span className="font-medium">{reportData.statistics.largestChange.toFixed(2)} km²</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Data Source:</span>
                      <span className="font-medium">{reportData.imagery.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Analysis Period:</span>
                      <span className="font-medium">
                        {Math.ceil((reportData.endDate.getTime() - reportData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Change Map</CardTitle>
                <CardDescription>Explore detected changes spatially with interactive controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Map Controls */}
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch id="heatmap" />
                        <Label htmlFor="heatmap" className="text-sm">Show Heatmap</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="clusters" />
                        <Label htmlFor="clusters" className="text-sm">Cluster Polygons</Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Opacity:</Label>
                      <Slider className="w-32" defaultValue={[70]} max={100} step={10} />
                    </div>
                  </div>

                  {/* Map Placeholder - In production, integrate with Leaflet/Mapbox */}
                  <div className="relative h-[500px] bg-muted rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium">Interactive Map View</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {reportData.statistics.numberOfPolygons} change polygons detected
                        </p>
                        <div className="mt-4 flex gap-2 justify-center">
                          <Badge variant="destructive">Forest Loss: 35%</Badge>
                          <Badge variant="default">Urban Growth: 25%</Badge>
                          <Badge variant="secondary">Water Change: 20%</Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Map Legend */}
                    <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur p-3 rounded-lg shadow-lg">
                      <p className="text-xs font-semibold mb-2">Legend</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-destructive rounded" />
                          <span className="text-xs">High Change</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-warning rounded" />
                          <span className="text-xs">Medium Change</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-success rounded" />
                          <span className="text-xs">Low Change</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Panel */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Max Change Area</p>
                      <p className="text-lg font-semibold">{reportData.statistics.largestChange.toFixed(1)} km²</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Change Density</p>
                      <p className="text-lg font-semibold">0.45 polygons/km²</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Coverage</p>
                      <p className="text-lg font-semibold">{reportData.statistics.percentageChanged}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Polygon Size Distribution</CardTitle>
                <CardDescription>Distribution of detected change polygons by area</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="400">
                  <BarChart data={reportData.polygonSizeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))"
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      name="Number of Polygons"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temporal">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Intensity Over Time</CardTitle>
                  <CardDescription>Monthly progression of detected changes with trend analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height="400">
                    <AreaChart data={reportData.changeIntensity}>
                      <defs>
                        <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          padding: "8px"
                        }}
                        formatter={(value: any) => [`${value}%`, "Change Intensity"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="intensity" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#colorIntensity)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Temporal Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Peak Change Month</CardDescription>
                    <CardTitle className="text-xl">August 2024</CardTitle>
                    <p className="text-sm text-muted-foreground">98% intensity</p>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Average Monthly Change</CardDescription>
                    <CardTitle className="text-xl">84.3%</CardTitle>
                    <p className="text-sm text-muted-foreground">±12.4% variation</p>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Trend Direction</CardDescription>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      Increasing
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">+17% overall</p>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Categories Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of detected changes by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div>
                      <ResponsiveContainer width="100%" height="400">
                        <PieChart>
                          <Pie
                            data={reportData.changeByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ category, value }) => `${value}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {reportData.changeByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              padding: "8px"
                            }}
                            formatter={(value: any) => [`${value}%`, "Coverage"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Category Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        Category Breakdown
                      </h4>
                      {reportData.changeByCategory.map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium">{category.category}</span>
                            </div>
                            <span className="text-sm font-semibold">{category.value}%</span>
                          </div>
                          <Progress value={category.value} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {category.category === "Forest Loss" && "Critical deforestation detected in northwestern regions"}
                            {category.category === "Urban Growth" && "Rapid urbanization in suburban areas"}
                            {category.category === "Water Body Change" && "Seasonal variations and drought impacts"}
                            {category.category === "Agricultural" && "Crop rotation and land use changes"}
                            {category.category === "Other" && "Minor changes and unclassified areas"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Recommendations</CardTitle>
                  <CardDescription>Based on detected change patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <Activity className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">High Priority: Forest Conservation</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          35% forest loss detected requires immediate intervention. Consider implementing protected zones.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-warning mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Monitor Urban Expansion</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Urban growth rate of 25% may require infrastructure planning and zoning updates.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-info/10 border border-info/20 rounded-lg">
                      <Layers className="h-5 w-5 text-info mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Water Resource Management</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          20% change in water bodies suggests drought conditions. Review water conservation policies.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChangeDetectionReport;