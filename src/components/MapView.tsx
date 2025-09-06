import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Layers, Map as MapIcon, X, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// NASA Earthdata API Configuration
const NASA_API_KEY = "gfYDyORjbhmlc3V1ezHvkchbJaepOYCDEbKs6fgw";
const GIBS_ENDPOINT = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";

interface MapViewProps {
  showComparison: boolean;
  onComparisonClose: () => void;
  selectedImagery?: string;
  startDate?: Date;
  endDate?: Date;
}

export const MapView = ({ 
  showComparison, 
  onComparisonClose, 
  selectedImagery,
  startDate,
  endDate 
}: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapBeforeRef = useRef<HTMLDivElement>(null);
  const mapAfterRef = useRef<HTMLDivElement>(null);
  const mainMapRef = useRef<L.Map | null>(null);
  const beforeMapRef = useRef<L.Map | null>(null);
  const afterMapRef = useRef<L.Map | null>(null);
  const [currentBasemap, setCurrentBasemap] = useState("esri");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // NASA GIBS Layer configurations
  const nasaImageryLayers = {
    "modis": {
      layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
      format: "image/jpeg",
      matrixSet: "GoogleMapsCompatible_Level9"
    },
    "viirs": {
      layer: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
      format: "image/jpeg",
      matrixSet: "GoogleMapsCompatible_Level9"
    },
    "landsat-true": {
      layer: "Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual",
      format: "image/jpeg",
      matrixSet: "GoogleMapsCompatible_Level9"
    },
    "landsat-ndvi": {
      layer: "MODIS_Terra_NDVI_8Day",
      format: "image/png",
      matrixSet: "GoogleMapsCompatible_Level9"
    },
    "landsat-temp": {
      layer: "MODIS_Aqua_Land_Surface_Temp_Day",
      format: "image/png",
      matrixSet: "GoogleMapsCompatible_Level9"
    },
    "night-lights": {
      layer: "VIIRS_Black_Marble",
      format: "image/jpeg",
      matrixSet: "GoogleMapsCompatible_Level9"
    }
  };

  const basemaps = {
    esri: {
      name: "ESRI Imagery",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri",
    },
    osm: {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
    },
    light: {
      name: "Light Map",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      attribution: "© CartoDB",
    },
    dark: {
      name: "Dark Map",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      attribution: "© CartoDB",
    },
  };

  // Function to create NASA GIBS layer
  const createNASALayer = (imageryType: string, date?: Date) => {
    const config = nasaImageryLayers[imageryType as keyof typeof nasaImageryLayers];
    if (!config) {
      return null;
    }
    
    const dateStr = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    
    return L.tileLayer(
      `${GIBS_ENDPOINT}/${config.layer}/default/${dateStr}/${config.matrixSet}/{z}/{y}/{x}.${config.format.split('/')[1]}`,
      {
        attribution: "© NASA Earthdata",
        maxZoom: 9,
        opacity: 1,
        tileSize: 256,
        bounds: [[-90, -180], [90, 180]],
        errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      }
    );
  };

  // Initialize main map (when not in comparison mode)
  useEffect(() => {
    if (showComparison || !mapContainerRef.current || mainMapRef.current) return;

    mainMapRef.current = L.map(mapContainerRef.current).setView([4.5, 8.5], 6);
    
    L.tileLayer(basemaps[currentBasemap].url, {
      attribution: basemaps[currentBasemap].attribution,
      maxZoom: 19,
    }).addTo(mainMapRef.current);

    L.control.zoom({ position: "topright" }).addTo(mainMapRef.current);
    L.control.scale({ position: "bottomright" }).addTo(mainMapRef.current);

    return () => {
      if (mainMapRef.current) {
        mainMapRef.current.remove();
        mainMapRef.current = null;
      }
    };
  }, [showComparison, currentBasemap]);

  // Initialize comparison maps
  useEffect(() => {
    if (!showComparison || !mapBeforeRef.current || !mapAfterRef.current) return;

    // Cleanup main map if it exists
    if (mainMapRef.current) {
      mainMapRef.current.remove();
      mainMapRef.current = null;
    }

    // Initialize before map
    beforeMapRef.current = L.map(mapBeforeRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([4.5, 8.5], 6);

    // Initialize after map
    afterMapRef.current = L.map(mapAfterRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([4.5, 8.5], 6);

    // Add basemaps to both
    const basemapConfig = basemaps[currentBasemap];
    L.tileLayer(basemapConfig.url, {
      attribution: basemapConfig.attribution,
      maxZoom: 19,
    }).addTo(beforeMapRef.current);

    L.tileLayer(basemapConfig.url, {
      attribution: basemapConfig.attribution,
      maxZoom: 19,
    }).addTo(afterMapRef.current);

    // Add NASA layers if available
    if (selectedImagery && startDate) {
      const beforeLayer = createNASALayer(selectedImagery, startDate);
      if (beforeLayer) {
        beforeLayer.addTo(beforeMapRef.current);
        beforeLayer.on('tileerror', () => {
          toast.error(`No imagery available for ${format(startDate, "yyyy-MM-dd")}`, { id: 'before-error' });
        });
      }
    }

    if (selectedImagery && endDate) {
      const afterLayer = createNASALayer(selectedImagery, endDate);
      if (afterLayer) {
        afterLayer.addTo(afterMapRef.current);
        afterLayer.on('tileerror', () => {
          toast.error(`No imagery available for ${format(endDate, "yyyy-MM-dd")}`, { id: 'after-error' });
        });
      }
    }

    // Sync the maps
    const syncMaps = () => {
      if (!beforeMapRef.current || !afterMapRef.current) return;

      const syncMove = (sourceMap: L.Map, targetMap: L.Map) => {
        targetMap.setView(sourceMap.getCenter(), sourceMap.getZoom(), { animate: false });
      };

      beforeMapRef.current.on('move', () => {
        if (beforeMapRef.current && afterMapRef.current) {
          syncMove(beforeMapRef.current, afterMapRef.current);
        }
      });

      afterMapRef.current.on('move', () => {
        if (afterMapRef.current && beforeMapRef.current) {
          syncMove(afterMapRef.current, beforeMapRef.current);
        }
      });
    };

    syncMaps();

    // Add zoom control to the after map
    L.control.zoom({ position: "topright" }).addTo(afterMapRef.current);
    L.control.scale({ position: "bottomright" }).addTo(afterMapRef.current);

    return () => {
      if (beforeMapRef.current) {
        beforeMapRef.current.remove();
        beforeMapRef.current = null;
      }
      if (afterMapRef.current) {
        afterMapRef.current.remove();
        afterMapRef.current = null;
      }
    };
  }, [showComparison, selectedImagery, startDate, endDate, currentBasemap]);

  // Handle slider drag
  useEffect(() => {
    if (!showComparison) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
      setSliderPosition(percentage);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
      setSliderPosition(percentage);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, showComparison]);

  const switchBasemap = (basemapKey: string) => {
    setCurrentBasemap(basemapKey);
  };

  if (showComparison && selectedImagery && startDate && endDate) {
    return (
      <div className="relative flex-1 bg-muted">
        {/* Comparison View */}
        <div ref={containerRef} className="absolute inset-0 overflow-hidden">
          {/* Before Map */}
          <div 
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <div ref={mapBeforeRef} className="absolute inset-0" />
            <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-lg">
              Before: {format(startDate, "MMM dd, yyyy")}
            </div>
          </div>

          {/* After Map */}
          <div 
            className="absolute inset-0"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <div ref={mapAfterRef} className="absolute inset-0" />
            <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-lg">
              After: {format(endDate, "MMM dd, yyyy")}
            </div>
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 cursor-ew-resize group"
            style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            <div className="absolute inset-y-0 w-1 bg-white shadow-lg" />
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 bg-white rounded-full p-2 shadow-lg group-hover:scale-110 transition-transform">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 left-4 z-30 space-y-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="shadow-lg">
                <Layers className="h-4 w-4 mr-2" />
                Basemap
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {Object.entries(basemaps).map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => switchBasemap(key)}
                  className={currentBasemap === key ? "bg-accent" : ""}
                >
                  <MapIcon className="h-4 w-4 mr-2" />
                  {value.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="secondary"
            size="sm"
            onClick={onComparisonClose}
            className="shadow-lg"
          >
            <X className="h-4 w-4 mr-2" />
            Close Comparison
          </Button>
        </div>
      </div>
    );
  }

  // Regular map view (not comparison)
  return (
    <div className="relative flex-1 bg-muted">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="shadow-lg">
              <Layers className="h-4 w-4 mr-2" />
              Basemap
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {Object.entries(basemaps).map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => switchBasemap(key)}
                className={currentBasemap === key ? "bg-accent" : ""}
              >
                <MapIcon className="h-4 w-4 mr-2" />
                {value.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};