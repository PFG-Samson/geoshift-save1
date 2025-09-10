import { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";
import { toast } from "sonner";

const USGS_BASE = "https://m2m.cr.usgs.gov/api/api/json/stable";

interface Scene {
  entityId: string;
  displayId: string;
  acquisitionDate: string;
  cloudCover?: number;
  browseUrl?: string;
  spatialBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

interface UsgsImageryLayerProps {
  dataset: string;
  startDate?: Date;
  endDate?: Date;
  selectedSceneId?: string;
  onScenesLoaded?: (scenes: Scene[]) => void;
  position: "before" | "after";
}

async function usgsLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${USGS_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const json = await res.json();
  if (!json.data) throw new Error("USGS login failed");
  return json.data;
}

async function usgsSearch(
  apiKey: string,
  dataset: string,
  startDate: Date,
  endDate: Date
): Promise<Scene[]> {
  const res = await fetch(`${USGS_BASE}/scene-search`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "X-Auth-Token": apiKey 
    },
    body: JSON.stringify({
      datasetName: dataset,
      temporalFilter: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
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
  const json = await res.json();
  return json?.data?.results || [];
}

export function UsgsImageryLayer({
  dataset,
  startDate,
  endDate,
  selectedSceneId,
  onScenesLoaded,
  position
}: UsgsImageryLayerProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  useEffect(() => {
    async function loadScenes() {
      if (!startDate || !endDate) return;
      
      setLoading(true);
      try {
        // Get credentials from localStorage (for demo)
        const username = localStorage.getItem("usgs_username");
        const password = localStorage.getItem("usgs_password");
        
        if (!username || !password) {
          toast.error("Please configure USGS credentials in settings");
          return;
        }

        const apiKey = await usgsLogin(username, password);
        const results = await usgsSearch(apiKey, dataset, startDate, endDate);
        
        setScenes(results);
        onScenesLoaded?.(results);
        
        if (results.length === 0) {
          toast.info("No imagery found for selected date range");
        } else {
          toast.success(`Found ${results.length} satellite scenes`);
        }
      } catch (error) {
        console.error("USGS API error:", error);
        toast.error("Failed to fetch USGS imagery");
      } finally {
        setLoading(false);
      }
    }
    
    loadScenes();
  }, [dataset, startDate, endDate, onScenesLoaded]);

  useEffect(() => {
    if (selectedSceneId && scenes.length > 0) {
      const scene = scenes.find(s => s.entityId === selectedSceneId);
      setSelectedScene(scene || null);
    }
  }, [selectedSceneId, scenes]);

  if (loading || !selectedScene?.browseUrl) {
    return null;
  }

  // For quicklook images, we need to use them as overlays
  // Since they're static images, not tile servers
  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: position === 'before' ? '50%' : 0,
        bottom: 0,
        zIndex: position === 'before' ? 199 : 200,
        pointerEvents: 'none'
      }}
    >
      <img 
        src={selectedScene.browseUrl}
        alt={`USGS ${dataset} - ${selectedScene.acquisitionDate}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.8
        }}
      />
    </div>
  );
}