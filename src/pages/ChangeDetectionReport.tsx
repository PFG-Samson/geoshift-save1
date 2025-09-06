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
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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
  AreaChart
} from "recharts";

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
    toast.info(`Downloading report as ${format}...`);
    // In production, this would trigger actual file download
    setTimeout(() => {
      toast.success(`Report downloaded as ${format}`);
    }, 1500);
  };

  const handleViewOnMap = () => {
    navigate("/", { 
      state: { 
        showComparison: true,
        ...reportData 
      } 
    });
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Change Detection Analysis Report</h1>
              <p className="text-muted-foreground mt-2">
                {format(reportData.startDate, "MMM dd, yyyy")} - {format(reportData.endDate, "MMM dd, yyyy")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleViewOnMap}>
                <Map className="h-4 w-4 mr-2" />
                View on Map
              </Button>
              <div className="flex gap-1">
                <Button onClick={() => handleDownload("PDF")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDownload("GeoJSON")}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Size Distribution</TabsTrigger>
            <TabsTrigger value="temporal">Temporal Analysis</TabsTrigger>
            <TabsTrigger value="categories">Change Categories</TabsTrigger>
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
            <Card>
              <CardHeader>
                <CardTitle>Change Intensity Over Time</CardTitle>
                <CardDescription>Monthly progression of detected changes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="400">
                  <AreaChart data={reportData.changeIntensity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Change Categories</CardTitle>
                <CardDescription>Breakdown of changes by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height="400">
                  <PieChart>
                    <Pie
                      data={reportData.changeByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, value }) => `${category}: ${value}%`}
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
                        border: "1px solid hsl(var(--border))"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ChangeDetectionReport;