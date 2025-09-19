#!/usr/bin/env python3
import argparse
from pathlib import Path

import geopandas as gpd
import matplotlib.pyplot as plt

# LULC colors (same as mapanalysis), EXCLUDING class 0
LULC_COLORS = {
  1: "#419bdf",  # Water
  2: "#397d49",  # Trees
  4: "#7a87c6",  # Flooded Vegetation
  5: "#e49635",  # Crops
  7: "#c4281b",  # Built Area
  8: "#a59b8f",  # Bare Ground
  9: "#a8ebff",  # Snow/Ice
  10: "#616161", # Clouds
  11: "#e3e2c3", # Rangeland
}

def main():
  ap = argparse.ArgumentParser(description="Render lulc_classes_2024.geojson to a JPG with app colors (excluding class 0).")
  ap.add_argument("--src", default="geojson_exports/lulc_classes_2024.geojson", help="Path to GeoJSON")
  ap.add_argument("-o", "--out", default="outputs/lulc_2024.jpg", help="Output JPG path")
  ap.add_argument("--bg", default="#ffffff", help="Background color (default: white)")
  ap.add_argument("--dpi", type=int, default=300, help="Output DPI (default: 300)")
  ap.add_argument("--width", type=float, default=8.0, help="Figure width in inches (default: 8.0)")
  ap.add_argument("--alpha", type=float, default=0.6, help="Fill opacity to match map (default: 0.6)")
  ap.add_argument("--lw", type=float, default=0.5, help="Polygon edge linewidth (default: 0.5)")
  args = ap.parse_args()

  src_path = Path(args.src)
  out_path = Path(args.out)
  out_path.parent.mkdir(parents=True, exist_ok=True)

  # Load GeoJSON
  gdf = gpd.read_file(src_path)

  # Expect class code in properties 'code' (like mapanalysis). Exclude 0.
  if "code" not in gdf.columns:
    raise SystemExit("GeoJSON missing 'code' attribute in features.")
  gdf = gdf[gdf["code"] != 0]

  # Prepare color column
  def color_for(code: int) -> str:
    return LULC_COLORS.get(int(code), "#d9d9d9")

  gdf = gdf.assign(_color=gdf["code"].apply(color_for))

  # Plot
  # Preserve aspect ratio using bounds
  minx, miny, maxx, maxy = gdf.total_bounds
  w = maxx - minx
  h = maxy - miny
  aspect = w / h if h != 0 else 1.0
  fig_w = args.width
  fig_h = fig_w / aspect if aspect > 0 else args.width

  fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=args.dpi)
  fig.patch.set_facecolor(args.bg)
  ax.set_facecolor(args.bg)

  gdf.plot(
    ax=ax,
    color=gdf["_color"],
    edgecolor="#ffffff",
    linewidth=args.lw,
    alpha=args.alpha,
  )

  ax.set_xlim(minx, maxx)
  ax.set_ylim(miny, maxy)
  ax.set_aspect("equal", adjustable="box")
  ax.set_axis_off()

  plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
  fig.savefig(out_path, facecolor=fig.get_facecolor(), bbox_inches="tight", pad_inches=0)
  plt.close(fig)

  print(f"Wrote: {out_path} (DPI={args.dpi}, size≈{fig_w:.2f}x{fig_h:.2f}in)")

if __name__ == "__main__":
  main()