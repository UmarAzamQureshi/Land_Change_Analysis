"use client"

import { useMemo, useState } from "react"
import * as turf from "@turf/turf"
import type { Geometry } from "geojson"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type FC = {
  type: "FeatureCollection"
  features: Array<{
    type: "Feature"
    geometry: Geometry | null
    properties: Record<string, any>
  }>
}

const LULC_CLASSES = [
  { code: 1, label: "Water", color: "#419bdf" },
  { code: 2, label: "Trees", color: "#397d49" },
  { code: 4, label: "Flooded Vegetation", color: "#7a87c6" },
  { code: 5, label: "Crops", color: "#e49635" },
  { code: 7, label: "Built Area", color: "#c4281b" },
  { code: 8, label: "Bare Ground", color: "#a59b8f" },
  { code: 9, label: "Snow/Ice", color: "#a8ebff" },
  { code: 10, label: "Clouds", color: "#616161" },
  { code: 11, label: "Rangeland", color: "#e3e2c3" },
]

// Prefer area from properties if you embedded it; fallback to turf.area
function readAreaKm2(props: Record<string, any>, geom: any): number {
  const explicit = props.area_km2 ?? props.areaKm2 ?? props.area
  if (typeof explicit === "number" && explicit >= 0) return explicit
  if (!geom) return 0
  try {
    return turf.area({ type: "Feature", geometry: geom, properties: {} } as any) / 1e6
  } catch {
    return 0
  }
}

// Try a few common property names for years and class codes
function readYears(props: Record<string, any>): { from?: number; to?: number } {
  const from = props.from_year ?? props.year_from ?? props.start_year ?? props.y1
  const to = props.to_year ?? props.year_to ?? props.end_year ?? props.y2
  return { from: from != null ? Number(from) : undefined, to: to != null ? Number(to) : undefined }
}
function readClassCodes(props: Record<string, any>): { from?: number; to?: number } {
  const from = props.from_class_code ?? props.class_from ?? props.source ?? props.c1
  const to = props.to_class_code ?? props.class_to ?? props.target ?? props.c2
  return { from: from != null ? Number(from) : undefined, to: to != null ? Number(to) : undefined }
}

// Build per-year totals by class using transitions:
// - For each feature, add its area to the "to" year for class "to_class_code"
// - If needed, you can also add to the "from" year for class "from_class_code" (uncomment below)
function buildYearClassAreas(classChangesData: FC | null) {
  const byYear: Record<number, Record<number, number>> = {}
  if (!classChangesData?.features?.length) return byYear

  for (const ft of classChangesData.features) {
    const props = ft.properties || {}
    const geom = ft.geometry
    const { from: yFrom, to: yTo } = readYears(props)
    const { from: cFrom, to: cTo } = readClassCodes(props)
    if (!yTo || !cTo) continue

    const a = readAreaKm2(props, geom)
    if (!byYear[yTo]) byYear[yTo] = {}
    byYear[yTo][cTo] = (byYear[yTo][cTo] || 0) + a

    // Optional: also accumulate source-year composition
    // if (yFrom && cFrom) {
    //   if (!byYear[yFrom]) byYear[yFrom] = {}
    //   byYear[yFrom][cFrom] = (byYear[yFrom][cFrom] || 0) + a
    // }
  }
  return byYear
}

function compareYearAreas(a: Record<number, number> | undefined, b: Record<number, number> | undefined) {
  const A = a || {}
  const B = b || {}
  return LULC_CLASSES.map(({ code, label }) => {
    const av = Number((A[code] || 0).toFixed(2))
    const bv = Number((B[code] || 0).toFixed(2))
    const delta = Number((bv - av).toFixed(2))
    const pct = av > 0 ? Number((((bv - av) / av) * 100).toFixed(1)) : (bv > 0 ? 100 : 0)
    return { code, label, fromKm2: av, toKm2: bv, deltaKm2: delta, pct }
  }).filter(r => r.fromKm2 > 0 || r.toKm2 > 0)
    .sort((x, y) => Math.abs(y.deltaKm2) - Math.abs(x.deltaKm2))
}

export default function YearDeltaStats({
  classChangesData,
  years,
  defaultFrom,
  defaultTo,
  geoDataByYear,
}: {
  classChangesData: FC
  years: number[]
  defaultFrom: number
  defaultTo: number
  geoDataByYear?: Record<number, any>
}) {
  const [fromYear, setFromYear] = useState<string>(defaultFrom?.toString() ?? years[0]?.toString() ?? "")
  const [toYear, setToYear] = useState<string>(defaultTo?.toString() ?? years.at(-1)?.toString() ?? "")

  const yearClassAreas = useMemo(() => {
    const built = buildYearClassAreas(classChangesData)
    // If we detected no years in class_changes, fall back to computing from per-year GeoJSONs
    const hasAnyYear = Object.keys(built).length > 0
    if (hasAnyYear || !geoDataByYear) return built
    const byYear: Record<number, Record<number, number>> = {}
    for (const y of years) {
      const fc = geoDataByYear[y]
      if (!fc?.features) continue
      for (const ft of fc.features) {
        const code = Number(ft?.properties?.code)
        if (!code || !ft.geometry) continue
        const km2 = readAreaKm2(ft.properties || {}, ft.geometry)
        if (!byYear[y]) byYear[y] = {}
        byYear[y][code] = (byYear[y][code] || 0) + km2
      }
    }
    return byYear
  }, [classChangesData, geoDataByYear, years])
  const deltas = useMemo(
    () => compareYearAreas(yearClassAreas[Number(fromYear)], yearClassAreas[Number(toYear)]),
    [yearClassAreas, fromYear, toYear],
  )

  const totalFrom = (yearClassAreas[Number(fromYear)] ? Object.values(yearClassAreas[Number(fromYear)]).reduce((s, v) => s + v, 0) : 0).toFixed(2)
  const totalTo = (yearClassAreas[Number(toYear)] ? Object.values(yearClassAreas[Number(toYear)]).reduce((s, v) => s + v, 0) : 0).toFixed(2)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Year-to-Year Comparison</CardTitle>
        <CardDescription>Per-class change (km²)</CardDescription>
        <div className="flex gap-2 mt-2">
          <Select value={fromYear} onValueChange={setFromYear}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="From" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={toYear} onValueChange={setToYear}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="To" /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="ml-auto">Total {fromYear}: {totalFrom} km²</Badge>
          <Badge variant="outline">Total {toYear}: {totalTo} km²</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-56 overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2">Class</th>
                <th className="text-right p-2">{fromYear}</th>
                <th className="text-right p-2">{toYear}</th>
                <th className="text-right p-2">Δ km²</th>
                <th className="text-right p-2">Δ %</th>
              </tr>
            </thead>
            <tbody>
              {deltas.map(({ code, label, fromKm2, toKm2, deltaKm2, pct }) => (
                <tr key={code} className="border-t">
                  <td className="p-2 text-justify">
                    <span
                      className="inline-block w-3 h-3 rounded-sm mr-2 align-middle"
                      style={{ background: LULC_CLASSES.find(c => c.code === code)?.color }}
                    />
                    {label}
                  </td>
                  <td className="p-2 text-right">{fromKm2.toFixed(2)}</td>
                  <td className="p-2 text-right">{toKm2.toFixed(2)}</td>
                  <td className={`p-2 text-right ${deltaKm2 >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {deltaKm2 >= 0 ? "+" : ""}{deltaKm2.toFixed(2)}
                  </td>
                  <td className={`p-2 text-right ${pct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
              {deltas.length === 0 && (
                <tr><td className="p-3 text-muted-foreground text-center" colSpan={5}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}