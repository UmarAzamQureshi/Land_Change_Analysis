"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet"
import L, { type GeoJSON as LeafletGeoJSON } from "leaflet"
import "leaflet/dist/leaflet.css"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Info, MapPin, Calendar, Layers, ChevronUp, ChevronDown, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { ResponsiveSankey } from "@nivo/sankey"
import { toggleTheme } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"

import YearDeltaStats from "@/components/year-delta-stats"

// ---------------- Colors + Classes ----------------
const getColor = (d: number) =>
  d === 1
    ? "#419bdf" // Water
    : d === 2
      ? "#397d49" // Trees
      : d === 4
        ? "#7a87c6" // Flooded Vegetation
        : d === 5
          ? "#e49635" // Crops
          : d === 7
            ? "#c4281b" // Built Area
            : d === 8
              ? "#a59b8f" // Bare Ground
              : d === 9
                ? "#a8ebff" // Snow/Ice
                : d === 10
                  ? "#616161" // Clouds
                  : d === 11
                    ? "#e3e2c3" // Rangeland
                    : "#d9d9d9" // Default

const LULC_CLASSES: { code: number; label: string }[] = [
  { code: 1, label: "Water" },
  { code: 2, label: "Trees" },
  { code: 4, label: "Flooded Vegetation" },
  { code: 5, label: "Crops" },
  { code: 7, label: "Built Area" },
  { code: 8, label: "Bare Ground" },
  { code: 9, label: "Snow/Ice" },
  { code: 10, label: "Clouds" },
  { code: 11, label: "Rangeland" },
]

// ---------------- Nivo Theme (respects Tailwind CSS variables) ----------------
const sankeyTheme = {
  textColor: 'hsl(var(--foreground))',
  fontSize: 12,
  labels: { text: { fill: 'hsl(var(--foreground))' } },
  grid: { line: { stroke: 'hsl(var(--border))' } },
  tooltip: {
    container: {
      background: 'hsl(var(--popover))',
      color: 'hsl(var(--popover-foreground))',
      border: '1px solid hsl(var(--border))'
    }
  }
} as const

// ---------------- Styles ----------------
function style(feature: any) {
  return {
    fillColor: getColor(feature.properties.code),
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.6,
  }
}

function highlightFeature(e: any, info?: L.Control) {
  const layer = e.target
  layer.setStyle({ weight: 3, color: "#666", fillOpacity: 0.7 })
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront()
  info && (info as any).update && (info as any).update(layer.feature.properties)
}

function resetHighlight(e: any, geojsonRef?: LeafletGeoJSON | null, info?: L.Control | null) {
  geojsonRef && geojsonRef.resetStyle && geojsonRef.resetStyle(e.target)
  info && (info as any).update && (info as any).update()
}

function onEachFeature(_feature: any, layer: any, geojsonRef?: LeafletGeoJSON | null, info?: L.Control | null) {
  layer.on({
    mouseover: (e: any) => highlightFeature(e, info || undefined),
    mouseout: (e: any) => resetHighlight(e, geojsonRef || undefined, info || undefined),
  })
}

// ---------------- Controls ----------------
function InfoControl(props: { infoRef: React.MutableRefObject<L.Control | null> }) {
  const map = useMap()
  useEffect(() => {
    const info = (L as any).control({ position: "topleft" }) as L.Control & {
      _div?: HTMLElement
      update?: (props?: any) => void
    }

    info.onAdd = function () {
      this._div = L.DomUtil.create("div", "info-control")
      this._div.style.cssText =
        "background:hsl(var(--card));border:1px solid hsl(var(--border));border-radius:var(--radius);padding:12px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);min-width:180px;max-width:250px;backdrop-filter:blur(8px);font-size:13px;margin-top:8px;"
      if (this.update) this.update()
      return this._div
    }

    info.update = function (props?: any) {
      if (!props) {
        this._div!.innerHTML = `
          <div style="color:hsl(var(--card-foreground));font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:6px;font-size:14px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            LULC Class Info
          </div>
          <p style="color:hsl(var(--foreground));font-size:12px;">Hover over a region to see details</p>`
        return
      }
      const cls = LULC_CLASSES.find((c) => c.code === props.code)
      this._div!.innerHTML = `
        <div style="color:hsl(var(--card-foreground));font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:6px;font-size:14px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          LULC Class Info
        </div>
        <div style="margin-bottom:6px;">
          <span style="display:inline-block;width:14px;height:14px;background:${getColor(props.code)};border-radius:3px;margin-right:6px;border:1px solid hsl(var(--border));"></span>
          <strong style="color:hsl(var(--foreground));font-size:13px;">${cls ? cls.label : "Unknown"}</strong>
        </div>
        <p style="color:hsl(var(--foreground));font-size:11px;">Code: ${props.code}</p>`
    }

    map.whenReady(() => {
      info.addTo(map)
      props.infoRef.current = info
    })

    return () => {
      info.remove()
    }
  }, [map, props.infoRef])

  return null
}

function LegendControl() {
  const map = useMap()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const legend = (L as any).control({ position: "bottomleft" })
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "legend-control")
      div.style.cssText =
        "background:hsl(var(--card));border:1px solid hsl(var(--border));border-radius:var(--radius);padding:12px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);max-width:220px;backdrop-filter:blur(8px);margin-bottom:8px;"

      const updateLegend = (collapsed: boolean) => {
        const header = `
          <div style="color:hsl(var(--card-foreground));font-weight:600;margin-bottom:${collapsed ? "0" : "8px"};display:flex;align-items:center;justify-content:space-between;cursor:pointer;" onclick="window.toggleLegend && window.toggleLegend()">
            <div style="display:flex;align-items:center;gap:6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M15 2h6v6"/><path d="m21 2-7.5 7.5"/></svg>
              <span style="font-size:13px;">Land Use Classes</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style="transform: rotate(${collapsed ? "0" : "180"}deg); transition: transform 0.2s;">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </div>`

        if (collapsed) {
          div.innerHTML = header
          return
        }

        const items = LULC_CLASSES.map(
          ({ code, label }) => `
            <div style="display:flex;align-items:center;margin-bottom:6px;gap:6px;">
              <span style="display:inline-block;width:14px;height:14px;background:${getColor(code)};border-radius:3px;border:1px solid hsl(var(--border));flex-shrink:0;"></span>
              <span style="color:hsl(var(--foreground));font-size:12px;font-weight:500;">${label}</span>
              <span style="color:hsl(var(--foreground));font-size:11px;margin-left:auto;">(${code})</span>
            </div>`,
        ).join("")
        div.innerHTML = header + items
      }

      // Global function for toggle
      ;(window as any).toggleLegend = () => {
        setIsCollapsed(!isCollapsed)
      }

      updateLegend(isCollapsed)
      return div
    }

    map.whenReady(() => {
      legend.addTo(map)
    })
    return () => {
      legend.remove()
    }
  }, [map, isCollapsed])

  return null
}

function CustomZoomControls() {
  const map = useMap()

  const handleZoomIn = () => {
    map.zoomIn()
  }

  const handleZoomOut = () => {
    map.zoomOut()
  }

  const handleReset = () => {
    map.setView([30, 70], 5)
  }

  useEffect(() => {
    // Store map reference globally for mobile controls
    ;(window as any).leafletMap = map
    return () => {
      delete (window as any).leafletMap
    }
  }, [map])

  return null
}

// ---------------- Main Component ----------------
export default function MapAnalysis() {
  const [geoDataByYear, setGeoDataByYear] = useState<Record<number, any>>({})
  const [pakistanData, setPakistanData] = useState<any | null>(null)
  const [classChangesData, setClassChangesData] = useState<any | null>(null)
  const [years, setYears] = useState<number[]>([])
  const [currentYear, setCurrentYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sankeyCollapsed, setSankeyCollapsed] = useState(true)
  const [showSlider, setShowSlider] = useState(false)
  const geojsonRef = useRef<LeafletGeoJSON | null>(null)
  const infoRef = useRef<L.Control | null>(null)
  const apiBase = import.meta.env.DEV ? "http://localhost:8000" : ""

  useEffect(() => {
    const availableYears = [2017, 2018, 2020, 2021, 2022, 2023, 2024]
    setYears(availableYears)
    setCurrentYear(availableYears[availableYears.length - 1])
    setLoading(true)
    setError(null)
    const bust = Date.now()

    Promise.all([
      ...availableYears.map((year) =>
        fetch(`${apiBase}/geojson/lulc_classes_${year}.geojson?bust=${bust}`, { cache: "no-store" as RequestCache })
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch data for year ${year}`)
            return res.json()
          })
          .then((data) => {
            if (data?.features) data.features = data.features.filter((ft: any) => ft?.properties?.code !== 0)
            return [year, data] as [number, any]
          }),
      ),
      fetch(`${apiBase}/geojson/pakistan.geojson?bust=${bust}`, { cache: "no-store" as RequestCache })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch Pakistan boundary data")
          return res.json()
        })
        .then((data) => ["pakistan", data] as [string, any]),
      fetch(`${apiBase}/geojson/class_changes.geojson?bust=${bust}`, { cache: "no-store" as RequestCache })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch class changes data")
          return res.json()
        })
        .then((data) => ["class_changes", data] as [string, any]),
    ])
      .then((entries) => {
        const yearly = entries.filter((e): e is [number, any] => typeof e[0] === "number")
        const pakistan = entries.find((e) => e[0] === "pakistan")?.[1]
        const classChanges = entries.find((e) => e[0] === "class_changes")?.[1]
        setGeoDataByYear(Object.fromEntries(yearly))
        setPakistanData(pakistan)
        setClassChangesData(classChanges)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load geojsons:", err)
        setError(err.message || "Failed to load map data")
        setLoading(false)
      })
  }, [apiBase])

  // ---------------- Sankey data ----------------
  const sankeyData = classChangesData
    ? (() => {
        try {
          // Aggregate raw counts of transitions (excluding self-links)
          const counts: Record<string, number> = {}

          console.log("Processing class changes data:", classChangesData?.features?.length, "features")

          classChangesData.features.forEach((ft: any) => {
            const from = ft.properties.from_class_code
            const to = ft.properties.to_class_code
            if (!from || !to || from === to) return
            const key = `${from}-${to}`
            counts[key] = (counts[key] || 0) + 1
          })

          // Calculate total transitions for percentage calculation
          const totalTransitions = Object.values(counts).reduce((sum, count) => sum + count, 0)

          // Turn counts into a list of candidate edges with percentages
          const candidateEdges: { source: string; target: string; value: number; percentage: number }[] = Object.entries(counts)
            .map(([key, value]) => {
              const [source, target] = key.split("-")
              const percentage = ((value / totalTransitions) * 100).toFixed(1)
              return { source, target, value, percentage: parseFloat(percentage) }
            })
            // Keep stronger links first so pruning removes weakest cycles if needed
            .sort((a, b) => b.value - a.value)

          // Build an acyclic set of edges by skipping those that would introduce a cycle
          const adjacency = new Map<string, Set<string>>()
          const acyclicEdges: { source: string; target: string; value: number; percentage: number }[] = []

          const hasPath = (start: string, goal: string): boolean => {
            // DFS from start to see if goal is reachable
            const stack = [start]
            const visited = new Set<string>()
            while (stack.length) {
              const node = stack.pop() as string
              if (node === goal) return true
              if (visited.has(node)) continue
              visited.add(node)
              const neighbors = adjacency.get(node)
              if (neighbors) {
                neighbors.forEach((neighborId: string) => {
                  if (!visited.has(neighborId)) stack.push(neighborId)
                })
              }
            }
            return false
          }

          for (const edge of candidateEdges) {
            // If there is already a path from target to source, adding this edge creates a cycle
            if (hasPath(edge.target, edge.source)) {
              // Skip this edge to keep the graph acyclic
              continue
            }
            // Accept edge and update adjacency
            acyclicEdges.push(edge)
            if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set<string>())
            adjacency.get(edge.source)!.add(edge.target)
          }

          // Build nodes from accepted edges only
          const nodeIds = new Set<string>()
          acyclicEdges.forEach((e) => {
            nodeIds.add(e.source)
            nodeIds.add(e.target)
          })
          const nodes = Array.from(nodeIds).map((id) => ({ id }))

          console.log("Sankey data generated:", { nodes: nodes.length, links: acyclicEdges.length, totalTransitions })
          return { nodes, links: acyclicEdges, totalTransitions }
        } catch (err) {
          console.error("Error processing Sankey data:", err)
          return null
        }
      })()
    : null

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">
                <span className="hidden sm:inline">Land Use & Land Cover Analysis</span>
                <span className="sm:hidden">LULC Analysis</span>
              </h1>
            </div>
            {loading && (
              <Badge variant="secondary" className="animate-pulse flex-shrink-0">
                <Layers className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Loading...</span>
                <span className="sm:hidden">...</span>
              </Badge>
            )}
            {error && (
              <Badge variant="destructive" className="flex-shrink-0">
                <span className="hidden sm:inline">Error loading data</span>
                <span className="sm:hidden">Error</span>
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={toggleTheme} className="bg-transparent">
              <Sun className="h-3 w-3 dark:hidden" />
              <Moon className="h-3 w-3 hidden dark:block" />
              <span className="ml-2 hidden sm:inline">Theme</span>
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {currentYear}
            </Badge>
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1 bg-transparent">
              <Info className="h-3 w-3" /> Help
            </Button>
            <Button variant="outline" size="sm" className="sm:hidden bg-transparent">
              <Info className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Card 1: Map + Legend, slider toggled */}
      <div className="pt-16 sm:pt-20 px-3 sm:px-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm sm:text-base">Map</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSlider(v => !v)} className="bg-transparent">
                {showSlider ? "Hide Time Slider" : "Show Time Slider"}
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-9 p-0"
                  onClick={() => {
                    const map = (window as any).leafletMap
                    if (map) map.zoomIn()
                  }}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-9 p-0"
                  onClick={() => {
                    const map = (window as any).leafletMap
                    if (map) map.zoomOut()
                  }}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-9 p-0"
                  onClick={() => {
                    const map = (window as any).leafletMap
                    if (map) map.setView([30, 70], 5)
                  }}
                  aria-label="Reset view"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: "65vh" }}>
              <MapContainer
                center={[33.6844, 73.0479]}   // Islamabad coordinates
                zoom={11}                     // Adjust zoom (11 works well for city level)
                style={{ height: "100%", width: "100%" }}
                preferCanvas={true}
                className="z-0"
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                {pakistanData && <GeoJSON data={pakistanData} style={() => ({ color: "black", weight: 2, fill: false })} />}
                {currentYear && geoDataByYear[currentYear] && (
                  <GeoJSON
                    key={currentYear}
                    data={geoDataByYear[currentYear]}
                    style={style}
                    onEachFeature={(f, l) => onEachFeature(f, l, geojsonRef.current, infoRef.current)}
                    ref={(el) => {
                      if (el) geojsonRef.current = el
                    }}
                  />
                )}
                <InfoControl infoRef={infoRef} />
                <LegendControl />
                <CustomZoomControls />
              </MapContainer>
            </div>

            {showSlider && years.length > 0 && currentYear && (
              <div className="p-3 sm:p-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Time Series Navigation</span>
                  </CardTitle>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {currentYear}
                  </Badge>
                </div>
                <Slider
                  value={[years.indexOf(currentYear)]}
                  onValueChange={(value) => setCurrentYear(years[value[0]])}
                  max={years.length - 1}
                  min={0}
                  step={1}
                  className="w-full opacity-60"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{years[0]}</span>
                  <span className="font-medium text-foreground">Year: {currentYear}</span>
                  <span>{years[years.length - 1]}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card 2: Year-to-Year Comparison */}
      <div className="px-3 sm:px-4 mt-4">
        {classChangesData && years.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Yearly Delta Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <YearDeltaStats
                classChangesData={classChangesData}
                years={years}
                defaultFrom={years[0]}
                defaultTo={years[years.length - 1]}
                geoDataByYear={geoDataByYear}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Card 3: Sankey Chart */}
      <div className="px-3 sm:px-4 mt-4 pb-6">
        {classChangesData && (
          <Card>
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">Land Use Class Changes Flow</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSankeyCollapsed(!sankeyCollapsed)} className="bg-transparent">
                {sankeyCollapsed ? (
                  <div className="flex items-center gap-2"><ChevronUp className="h-4 w-4" /><span className="hidden sm:inline">Show</span></div>
                ) : (
                  <div className="flex items-center gap-2"><ChevronDown className="h-4 w-4" /><span className="hidden sm:inline">Hide</span></div>
                )}
              </Button>
            </CardHeader>
            {!sankeyCollapsed && (
              <CardContent className="p-3 sm:p-4">
                <div className="h-48 sm:h-60">
                  {sankeyData && sankeyData.nodes.length > 0 && sankeyData.links.length > 0 ? (
                    <ResponsiveSankey
                      data={sankeyData}
                      margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                      align="justify"
                      colors={({ id }) => getColor(Number(id))}
                      nodeOpacity={1}
                      nodeThickness={window.innerWidth < 640 ? 15 : 20}
                      nodeBorderColor={{ from: "color", modifiers: [["darker", 0.8]] }}
                      linkOpacity={0.5}
                      linkHoverOthersOpacity={0.1}
                      enableLinkGradient={true}
                      labelPosition="outside"
                      labelOrientation="horizontal"
                      labelPadding={window.innerWidth < 640 ? 4 : 8}
                      labelTextColor={{ from: "color", modifiers: [["darker", 1.2]] }}
                      theme={sankeyTheme}
                      linkTooltip={({ link }: any) => {
                        const sourceClass = LULC_CLASSES.find(c => c.code === Number(link.source.id))?.label || `Class ${link.source.id}`
                        const targetClass = LULC_CLASSES.find(c => c.code === Number(link.target.id))?.label || `Class ${link.target.id}`
                        const percentage = link.percentage || 0
                        return (
                          <div className="bg-background border border-border rounded-lg p-2 shadow-lg min-w-[200px] max-w-[300px]">
                            <div className="font-semibold text-sm">
                              {targetClass} → {sourceClass}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {link.value} transitions ({percentage}% of total)
                            </div>
                          </div>
                        )
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm">Processing class change data...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      

      

      

      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-[1002] flex items-center justify-center">
          <Card className="p-4 sm:p-6 mx-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
              <span className="text-foreground font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">Loading map data...</span>
                <span className="sm:hidden">Loading...</span>
              </span>
            </div>
          </Card>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-[1002] flex items-center justify-center">
          <Card className="p-4 sm:p-6 mx-4 max-w-md">
            <div className="text-center">
              <div className="text-destructive mb-2">
                <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Data</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Retry
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
