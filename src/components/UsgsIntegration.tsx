import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Satellite, Calendar, Cloud } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const USGS_BASE = "https://m2m.cr.usgs.gov/api/api/json/stable";

interface UsgsScene {
  entityId: string;
  displayId: string;
  acquisitionDate: string;
  cloudCover?: number;
  browseUrl?: string;
}

interface UsgsIntegrationProps {
  startDate?: Date;
  endDate?: Date;
  onSceneSelect?: (beforeScene: UsgsScene | null, afterScene: UsgsScene | null) => void;
}

export function UsgsIntegration({ startDate, endDate, onSceneSelect }: UsgsIntegrationProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [credentials, setCredentials] = useState({
    username: localStorage.getItem("usgs_username") || "",
    password: localStorage.getItem("usgs_password") || ""
  });
  const [scenes, setScenes] = useState<UsgsScene[]>([]);
  const [selectedBefore, setSelectedBefore] = useState<string>("");
  const [selectedAfter, setSelectedAfter] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const saveCredentials = () => {
    localStorage.setItem("usgs_username", credentials.username);
    localStorage.setItem("usgs_password", credentials.password);
    setShowSettings(false);
    toast.success("USGS credentials saved");
    loadScenes();
  };

  const loadScenes = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select date range first");
      return;
    }

    if (!credentials.username || !credentials.password) {
      setShowSettings(true);
      return;
    }

    setLoading(true);
    
    try {
      // Login to USGS
      const loginRes = await fetch(`${USGS_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: credentials.username, 
          password: credentials.password 
        }),
      });
      
      const loginData = await loginRes.json();
      if (!loginData.data) {
        throw new Error("USGS login failed");
      }
      
      const apiKey = loginData.data;
      
      // Search for scenes
      const searchRes = await fetch(`${USGS_BASE}/scene-search`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Auth-Token": apiKey 
        },
        body: JSON.stringify({
          datasetName: "landsat_ot_c2_l2", // Landsat 8/9 Collection 2 Level 2
          temporalFilter: {
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd")
          },
          maxResults: 10,
          startingNumber: 1,
          sceneFilter: {
            cloudCoverFilter: {
              max: 30,
              includeUnknown: false
            }
          },
          metadataType: "full"
        }),
      });
      
      const searchData = await searchRes.json();
      const fetchedScenes = searchData?.data?.results || [];
      
      if (fetchedScenes.length === 0) {
        toast.info("No USGS scenes found for selected date range");
      } else {
        setScenes(fetchedScenes);
        setSelectedBefore(fetchedScenes[0].entityId);
        setSelectedAfter(fetchedScenes[Math.min(1, fetchedScenes.length - 1)].entityId);
        toast.success(`Found ${fetchedScenes.length} USGS satellite scenes`);
      }
    } catch (error) {
      console.error("USGS API error:", error);
      toast.error("Failed to fetch USGS imagery. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const beforeScene = scenes.find(s => s.entityId === selectedBefore) || null;
    const afterScene = scenes.find(s => s.entityId === selectedAfter) || null;
    onSceneSelect?.(beforeScene, afterScene);
  }, [selectedBefore, selectedAfter, scenes, onSceneSelect]);

  return (
    <div className="space-y-4">
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>USGS Earth Explorer Setup</DialogTitle>
            <DialogDescription>
              Register at https://ers.cr.usgs.gov for free access to Landsat imagery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="USGS username"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="USGS password"
              />
            </div>
            <Button onClick={saveCredentials} className="w-full">
              Save & Load Scenes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-4 w-4 mr-2" />
          USGS Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={loadScenes}
          disabled={loading}
        >
          <Satellite className="h-4 w-4 mr-2" />
          {loading ? "Loading..." : "Load USGS Scenes"}
        </Button>
      </div>

      {/* Scene Selection */}
      {scenes.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Before Scene</Label>
              <Select value={selectedBefore} onValueChange={setSelectedBefore}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenes.map(scene => (
                    <SelectItem key={scene.entityId} value={scene.entityId}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(scene.acquisitionDate), "MMM dd, yyyy")}</span>
                        {scene.cloudCover !== undefined && (
                          <>
                            <Cloud className="h-3 w-3 ml-1" />
                            <span className="text-xs">{scene.cloudCover}%</span>
                          </>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">After Scene</Label>
              <Select value={selectedAfter} onValueChange={setSelectedAfter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenes.map(scene => (
                    <SelectItem key={scene.entityId} value={scene.entityId}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(scene.acquisitionDate), "MMM dd, yyyy")}</span>
                        {scene.cloudCover !== undefined && (
                          <>
                            <Cloud className="h-3 w-3 ml-1" />
                            <span className="text-xs">{scene.cloudCover}%</span>
                          </>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}