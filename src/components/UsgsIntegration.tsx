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
    // Demo data - replace with actual USGS API calls
    const demoScenes: UsgsScene[] = [
      {
        entityId: "LC08_L1TP_185054_20240115",
        displayId: "Landsat 8 - Jan 15, 2024",
        acquisitionDate: "2024-01-15",
        cloudCover: 12,
        browseUrl: "https://earthexplorer.usgs.gov/browse/landsat_8_c1/2024/185/054/LC08_L1TP_185054_20240115.jpg"
      },
      {
        entityId: "LC08_L1TP_185054_20240131",
        displayId: "Landsat 8 - Jan 31, 2024",
        acquisitionDate: "2024-01-31",
        cloudCover: 8,
        browseUrl: "https://earthexplorer.usgs.gov/browse/landsat_8_c1/2024/185/054/LC08_L1TP_185054_20240131.jpg"
      }
    ];
    
    setScenes(demoScenes);
    if (demoScenes.length > 0) {
      setSelectedBefore(demoScenes[0].entityId);
      setSelectedAfter(demoScenes[Math.min(1, demoScenes.length - 1)].entityId);
    }
    setLoading(false);
    toast.success(`Found ${demoScenes.length} USGS scenes (demo data)`);
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