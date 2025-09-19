"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight, MapPin, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getRasterGeoJSON, LULC_COLORS, rasterOverlayUrl } from "@/lib/api"

// Mock data for Pakistan cities and Islamabad sectors
const pakistanData = {
  cities: [
    {
        name: "Islamabad",
        coordinates: [33.6844, 73.0479],
        sectors: [
          // D Sectors
          { name: "D-12", coordinates: [33.6234, 73.0865], stats: { forestCover: 15, deforestation: 5.2, alerts: 8 } },
          { name: "D-13", coordinates: [33.6234, 73.1013], stats: { forestCover: 18, deforestation: 4.8, alerts: 7 } },
          { name: "D-17", coordinates: [33.6234, 73.1605], stats: { forestCover: 12, deforestation: 6.1, alerts: 9 } },
          { name: "D-18", coordinates: [33.6234, 73.1753], stats: { forestCover: 14, deforestation: 5.7, alerts: 8 } },
      
          // E Sectors
          { name: "E-7", coordinates: [33.6548, 73.0581], stats: { forestCover: 32, deforestation: 3.4, alerts: 5 } },
          { name: "E-8", coordinates: [33.6548, 73.0729], stats: { forestCover: 28, deforestation: 3.8, alerts: 6 } },
          { name: "E-9", coordinates: [33.6548, 73.0877], stats: { forestCover: 25, deforestation: 4.1, alerts: 7 } },
          { name: "E-10", coordinates: [33.6548, 73.1025], stats: { forestCover: 22, deforestation: 4.5, alerts: 8 } },
          { name: "E-11", coordinates: [33.6548, 73.1173], stats: { forestCover: 30, deforestation: 3.2, alerts: 4 } },
          { name: "E-12", coordinates: [33.6548, 73.1321], stats: { forestCover: 26, deforestation: 3.9, alerts: 6 } },
          { name: "E-16", coordinates: [33.6548, 73.1913], stats: { forestCover: 19, deforestation: 5.3, alerts: 9 } },
          { name: "E-17", coordinates: [33.6548, 73.2061], stats: { forestCover: 21, deforestation: 4.9, alerts: 8 } },
          { name: "E-18", coordinates: [33.6548, 73.2209], stats: { forestCover: 17, deforestation: 5.6, alerts: 10 } },
      
          // F Sectors
          { name: "F-5", coordinates: [33.6862, 73.0285], stats: { forestCover: 48, deforestation: 1.8, alerts: 2 } },
          { name: "F-6", coordinates: [33.7215, 73.0433], stats: { forestCover: 45, deforestation: 2.1, alerts: 3 } },
          { name: "F-7", coordinates: [33.7294, 73.0581], stats: { forestCover: 38, deforestation: 1.8, alerts: 1 } },
          { name: "F-8", coordinates: [33.7058, 73.0581], stats: { forestCover: 52, deforestation: 0.9, alerts: 0 } },
          { name: "F-9", coordinates: [33.6862, 73.0877], stats: { forestCover: 41, deforestation: 2.4, alerts: 4 } },
          { name: "F-10", coordinates: [33.6862, 73.1025], stats: { forestCover: 39, deforestation: 2.7, alerts: 5 } },
          { name: "F-11", coordinates: [33.6862, 73.1173], stats: { forestCover: 44, deforestation: 2.0, alerts: 3 } },
          { name: "F-12", coordinates: [33.6862, 73.1321], stats: { forestCover: 37, deforestation: 3.1, alerts: 6 } },
          { name: "F-13", coordinates: [33.6862, 73.1469], stats: { forestCover: 33, deforestation: 3.6, alerts: 7 } },
          { name: "F-14", coordinates: [33.6862, 73.1617], stats: { forestCover: 29, deforestation: 4.0, alerts: 8 } },
          { name: "F-15", coordinates: [33.6862, 73.1765], stats: { forestCover: 31, deforestation: 3.7, alerts: 6 } },
          { name: "F-17", coordinates: [33.6862, 73.2061], stats: { forestCover: 24, deforestation: 4.8, alerts: 9 } },
      
          // G Sectors
          { name: "G-5", coordinates: [33.7176, 73.0285], stats: { forestCover: 42, deforestation: 2.3, alerts: 4 } },
          { name: "G-6", coordinates: [33.7058, 73.0433], stats: { forestCover: 41, deforestation: 2.3, alerts: 2 } },
          { name: "G-7", coordinates: [33.7137, 73.0581], stats: { forestCover: 35, deforestation: 3.1, alerts: 4 } },
          { name: "G-8", coordinates: [33.7176, 73.0729], stats: { forestCover: 38, deforestation: 2.8, alerts: 5 } },
          { name: "G-9", coordinates: [33.7176, 73.0877], stats: { forestCover: 34, deforestation: 3.3, alerts: 6 } },
          { name: "G-10", coordinates: [33.7176, 73.1025], stats: { forestCover: 36, deforestation: 3.0, alerts: 5 } },
          { name: "G-11", coordinates: [33.7176, 73.1173], stats: { forestCover: 40, deforestation: 2.5, alerts: 4 } },
          { name: "G-12", coordinates: [33.7176, 73.1321], stats: { forestCover: 32, deforestation: 3.7, alerts: 7 } },
          { name: "G-13", coordinates: [33.7176, 73.1469], stats: { forestCover: 28, deforestation: 4.2, alerts: 8 } },
          { name: "G-14", coordinates: [33.7176, 73.1617], stats: { forestCover: 25, deforestation: 4.6, alerts: 9 } },
          { name: "G-15", coordinates: [33.7176, 73.1765], stats: { forestCover: 27, deforestation: 4.3, alerts: 8 } },
      
          // H Sectors
          { name: "H-8", coordinates: [33.7490, 73.0729], stats: { forestCover: 46, deforestation: 1.9, alerts: 3 } },
          { name: "H-9", coordinates: [33.7490, 73.0877], stats: { forestCover: 43, deforestation: 2.2, alerts: 4 } },
          { name: "H-10", coordinates: [33.7490, 73.1025], stats: { forestCover: 47, deforestation: 1.7, alerts: 2 } },
          { name: "H-11", coordinates: [33.7490, 73.1173], stats: { forestCover: 49, deforestation: 1.5, alerts: 1 } },
          { name: "H-12", coordinates: [33.7490, 73.1321], stats: { forestCover: 44, deforestation: 2.1, alerts: 3 } },
          { name: "H-13", coordinates: [33.7490, 73.1469], stats: { forestCover: 41, deforestation: 2.4, alerts: 4 } },
          { name: "H-15", coordinates: [33.7490, 73.1765], stats: { forestCover: 38, deforestation: 2.8, alerts: 5 } },
          { name: "H-16", coordinates: [33.7490, 73.1913], stats: { forestCover: 35, deforestation: 3.2, alerts: 6 } },
      
          // I Sectors
          { name: "I-8", coordinates: [33.7804, 73.0729], stats: { forestCover: 55, deforestation: 1.2, alerts: 1 } },
          { name: "I-9", coordinates: [33.7804, 73.0877], stats: { forestCover: 51, deforestation: 1.4, alerts: 2 } },
          { name: "I-10", coordinates: [33.7804, 73.1025], stats: { forestCover: 53, deforestation: 1.3, alerts: 1 } },
          { name: "I-11", coordinates: [33.7804, 73.1173], stats: { forestCover: 56, deforestation: 1.0, alerts: 0 } },
          { name: "I-12", coordinates: [33.7804, 73.1321], stats: { forestCover: 49, deforestation: 1.6, alerts: 2 } },
          { name: "I-13", coordinates: [33.7804, 73.1469], stats: { forestCover: 46, deforestation: 1.9, alerts: 3 } },
          { name: "I-14", coordinates: [33.7804, 73.1617], stats: { forestCover: 43, deforestation: 2.2, alerts: 4 } },
          { name: "I-15", coordinates: [33.7804, 73.1765], stats: { forestCover: 40, deforestation: 2.5, alerts: 5 } },
          { name: "I-16", coordinates: [33.7804, 73.1913], stats: { forestCover: 37, deforestation: 2.9, alerts: 6 } },
          { name: "I-17", coordinates: [33.7804, 73.2061], stats: { forestCover: 34, deforestation: 3.3, alerts: 7 } },
          { name: "I-18", coordinates: [33.7804, 73.2209], stats: { forestCover: 31, deforestation: 3.7, alerts: 8 } },
      
          // Special Areas and Commercial Zones
          {
            name: "Blue Area",
            coordinates: [33.7137, 73.0433],
            stats: { forestCover: 28, deforestation: 4.2, alerts: 6 },
          },
          {
            name: "Red Zone",
            coordinates: [33.6980, 73.0640],
            stats: { forestCover: 65, deforestation: 0.5, alerts: 0 },
          },
          {
            name: "Diplomatic Enclave",
            coordinates: [33.6890, 73.0520],
            stats: { forestCover: 58, deforestation: 0.8, alerts: 1 },
          },
          {
            name: "Pakistan Secretariat",
            coordinates: [33.6945, 73.0618],
            stats: { forestCover: 62, deforestation: 0.6, alerts: 0 },
          },
          {
            name: "Constitution Avenue",
            coordinates: [33.6912, 73.0587],
            stats: { forestCover: 55, deforestation: 1.1, alerts: 2 },
          },
          {
            name: "Centaurus Mall Area",
            coordinates: [33.7058, 73.0433],
            stats: { forestCover: 25, deforestation: 4.8, alerts: 8 },
          },
          {
            name: "Faisal Mosque",
            coordinates: [33.7298, 73.0367],
            stats: { forestCover: 70, deforestation: 0.3, alerts: 0 },
          },
          {
            name: "Daman-e-Koh",
            coordinates: [33.7615, 73.0367],
            stats: { forestCover: 85, deforestation: 0.1, alerts: 0 },
          },
          {
            name: "Pir Sohawa",
            coordinates: [33.7742, 73.0220],
            stats: { forestCover: 90, deforestation: 0.05, alerts: 0 },
          },
          {
            name: "Margalla Hills",
            coordinates: [33.7500, 73.0300],
            stats: { forestCover: 95, deforestation: 0.02, alerts: 0 },
          },
      
          // Industrial and Commercial Areas
          {
            name: "I-9 Industrial Area",
            coordinates: [33.6450, 73.0877],
            stats: { forestCover: 8, deforestation: 8.5, alerts: 15 },
          },
          {
            name: "I-10 Industrial Area",
            coordinates: [33.6450, 73.1025],
            stats: { forestCover: 12, deforestation: 7.8, alerts: 12 },
          },
      
          // Educational Zones
          {
            name: "Quaid-i-Azam University",
            coordinates: [33.6479, 73.0302],
            stats: { forestCover: 75, deforestation: 0.4, alerts: 0 },
          },
          {
            name: "NUST H-12",
            coordinates: [33.6422, 73.1321],
            stats: { forestCover: 45, deforestation: 2.0, alerts: 3 },
          },
          {
            name: "International Islamic University",
            coordinates: [33.6854, 73.1173],
            stats: { forestCover: 60, deforestation: 1.0, alerts: 1 },
          },
      
          // Newer Developments
          {
            name: "CDA Sector C-15",
            coordinates: [33.5920, 73.1765],
            stats: { forestCover: 5, deforestation: 9.2, alerts: 18 },
          },
          {
            name: "CDA Sector B-17",
            coordinates: [33.5606, 73.2061],
            stats: { forestCover: 3, deforestation: 12.5, alerts: 25 },
          },
      
          // Airport Area
          {
            name: "Airport Area",
            coordinates: [33.6149, 73.0991],
            stats: { forestCover: 20, deforestation: 5.5, alerts: 10 },
          },
      
          // Rawalpindi Connected Areas
          {
            name: "PWD",
            coordinates: [33.6013, 73.0433],
            stats: { forestCover: 16, deforestation: 6.8, alerts: 12 },
          },
          {
            name: "Tarnol",
            coordinates: [33.6234, 72.9989],
            stats: { forestCover: 22, deforestation: 5.1, alerts: 9 },
          },
          {
            name: "Chak Shahzad",
            coordinates: [33.6705, 72.9989],
            stats: { forestCover: 35, deforestation: 3.4, alerts: 5 },
          },
          {
            name: "Bhara Kahu",
            coordinates: [33.7333, 72.9989],
            stats: { forestCover: 68, deforestation: 0.9, alerts: 1 },
          },
      
          // Rural and Outer Areas
          {
            name: "Simly Dam",
            coordinates: [33.7167, 72.9545],
            stats: { forestCover: 78, deforestation: 0.6, alerts: 0 },
          },
          {
            name: "Rawal Dam",
            coordinates: [33.6667, 73.1333],
            stats: { forestCover: 82, deforestation: 0.4, alerts: 0 },
          },
          {
            name: "Khanpur Dam Area",
            coordinates: [33.8167, 72.9167],
            stats: { forestCover: 72, deforestation: 0.8, alerts: 1 },
          }
        ],
      },
    
  ],
}

interface StatsPopupProps {
  sector: any
  position: { x: number; y: number }
  visible: boolean
}

const StatsPopup: React.FC<StatsPopupProps> = ({ sector, position, visible }) => {
  if (!visible || !sector) return null

  return (
    <div
      className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-3 min-w-48"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        pointerEvents: "none",
      }}
    >
      <h4 className="font-semibold text-sm mb-2">{sector.name}</h4>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Forest Cover:</span>
          <span className="font-medium text-primary">{sector.stats.forestCover}%</span>
        </div>
        <div className="flex justify-between">
          <span>Deforestation:</span>
          <span className="font-medium text-destructive">{sector.stats.deforestation}%</span>
        </div>
        <div className="flex justify-between">
          <span>Active Alerts:</span>
          <span className="font-medium text-accent">{sector.stats.alerts}</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [hoveredSector, setHoveredSector] = useState<any>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [map, setMap] = useState<any>(null)
  const [L, setL] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const sectorsLayerRef = useRef<any>(null)
  const rasterLayerRef = useRef<any>(null)

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined") {
        const leaflet = await import("leaflet")

        // Fix for default markers
        delete (leaflet.Icon.Default.prototype as any)._getIconUrl
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        setL(leaflet)
      }
    }
    loadLeaflet()
  }, [])

  // Initialize map
  useEffect(() => {
    if (L && mapRef.current && !map) {
      const newMap = L.map(mapRef.current).setView([20, 0], 2)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(newMap)

      setMap(newMap)
    }
  }, [L, map])

  // Handle country selection
  const handleCountryClick = (country: string) => {
    if (selectedCountry === country) {
      setSelectedCountry(null)
      setSelectedCity(null)
      setSelectedSector(null)
    } else {
      setSelectedCountry(country)
      setSelectedCity(null)
      setSelectedSector(null)

      if (country === "Pakistan" && map) {
        map.setView([30.3753, 69.3451], 6)
      }
    }
  }

  // Handle city selection
  const handleCityClick = (city: string) => {
    if (selectedCity === city) {
      setSelectedCity(null)
      setSelectedSector(null)
    } else {
      setSelectedCity(city)
      setSelectedSector(null)

      const cityData = pakistanData.cities.find((c) => c.name === city)
      if (cityData && map) {
        map.setView(cityData.coordinates, 12)
        if (sectorsLayerRef.current) map.removeLayer(sectorsLayerRef.current)

        if (city === "Islamabad") {
          showRasterImageOverlay("2024")
        }

        
      }
    }
  }

  const showRasterOverlay = async (year: string) => {
    if (!map || !L) return
    if (rasterLayerRef.current) {
      map.removeLayer(rasterLayerRef.current)
      rasterLayerRef.current = null
    }

    const { geojson } = await getRasterGeoJSON(year, {
      band: 1,
      mergeByValue: true,
      simplifyTolerance: 0.0002,
      colorMap: LULC_COLORS,
    })

    const layer = L.geoJSON(geojson, {
      style: (f: any) => {
        const c = f?.properties?.color ?? "#000000"
        return { color: c, weight: 1, fillColor: c, fillOpacity: 0.6 }
      },
    })

    layer.addTo(map)
    rasterLayerRef.current = layer
    layer.bringToFront()
  }

  const showRasterImageOverlay = (year: string) => {
    if (!map || !L) return
    if (rasterLayerRef.current) {
      map.removeLayer(rasterLayerRef.current)
      rasterLayerRef.current = null
    }

    const url = rasterOverlayUrl(year)
    const bounds = [
      [33.4, 72.8],
      [34.0, 73.5],
    ] as any

    const imageLayer = L.imageOverlay(url, bounds)
    imageLayer.addTo(map)
    rasterLayerRef.current = imageLayer
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Forest Analysis
          </h2>
        </div>

        <div className="p-4 space-y-2">
          {/* Countries Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Countries</h3>

            {/* Pakistan */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-2 text-left",
                  selectedCountry === "Pakistan" && "bg-accent text-accent-foreground",
                )}
                onClick={() => handleCountryClick("Pakistan")}
              >
                <div className="flex items-center gap-2">
                  {selectedCountry === "Pakistan" ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <MapPin className="h-4 w-4" />
                  <span>Pakistan</span>
                </div>
              </Button>

              {/* Cities dropdown */}
              {selectedCountry === "Pakistan" && (
                <div className="ml-6 space-y-1">
                  {pakistanData.cities.map((city) => (
                    <div key={city.name}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start h-auto p-2 text-left",
                          selectedCity === city.name && "bg-secondary text-secondary-foreground",
                        )}
                        onClick={() => handleCityClick(city.name)}
                      >
                        <div className="flex items-center gap-2">
                          {selectedCity === city.name ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          <span className="text-sm">{city.name}</span>
                        </div>
                      </Button>

                      {/* Sectors dropdown */}
                      {selectedCity === city.name && city.sectors.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {city.sectors.map((sector) => (
                            <Button
                              key={sector.name}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start h-auto p-1 text-left",
                                selectedSector === sector.name && "bg-muted text-muted-foreground",
                              )}
                              onClick={() => setSelectedSector(selectedSector === sector.name ? null : sector.name)}
                            >
                              <span className="text-xs ml-4">{sector.name}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Area Info */}
        {selectedCity && (
          <div className="p-4 border-t border-border">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected Area</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs space-y-1">
                  <div>
                    <strong>Country:</strong> {selectedCountry}
                  </div>
                  <div>
                    <strong>City:</strong> {selectedCity}
                  </div>
                  {selectedSector && (
                    <div>
                      <strong>Sector:</strong> {selectedSector}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: "100vh" }} />

        {/* Stats Popup */}
        <StatsPopup sector={hoveredSector} position={mousePosition} visible={!!hoveredSector} />

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10">
          <Card className="p-2">
            <div className="text-xs text-muted-foreground">Click Pakistan → Select City → View Sectors</div>
          </Card>
        </div>
      </div>

      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
    </div>
  )
}
