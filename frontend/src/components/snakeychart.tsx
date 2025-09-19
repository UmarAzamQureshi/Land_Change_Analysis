"use client"

import { ResponsiveSankey } from "@nivo/sankey"

interface SankeyData {
  from: string
  to: string
  value: number
}

export default function SankeyChart({ data }: { data: SankeyData[] }) {
  // Build Nivo Sankey format
  const nodes: { id: string }[] = []
  const links: { source: string; target: string; value: number }[] = []

  const nodeSet = new Set<string>()

  data.forEach((d) => {
    nodeSet.add(d.from)
    nodeSet.add(d.to)
    links.push({ source: d.from, target: d.to, value: d.value })
  })

  nodeSet.forEach((id) => nodes.push({ id }))

  return (
    <div className="w-[500px] h-[400px]">
      <ResponsiveSankey
        data={{ nodes, links }}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        align="justify"
        colors={{ scheme: "category10" }}
        nodeOpacity={1}
        nodeThickness={18}
        nodeSpacing={20}
        nodeBorderWidth={1}
        nodeBorderColor={{ from: "color", modifiers: [["darker", 0.8]] }}
        linkOpacity={0.5}
        linkBlendMode="multiply"
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.2]] }}
      />
    </div>
  )
}
