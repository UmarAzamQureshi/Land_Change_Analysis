"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import axios from "axios";
import L, { Map as LeafletMap, GeoJSON as LeafletGeoJSON } from "leaflet";
import { get_lulc_classes_geojson } from "@/lib/api";

import "leaflet/dist/leaflet.css";

export default function Map() {
  const [geoData, setGeoData] = useState<any>(null);
  const [year, setYear] = useState("2020");
  const geojsonRef = useRef<LeafletGeoJSON<any>>(null);

  // Ref to hold info control so we can update it
  const infoRef = useRef<(L.Control & { update?: (props?: any) => void }) | null>(null);

  // Fetch GeoJSON
  useEffect(() => {
    async function fetchData() {
      try {
        const url = get_lulc_classes_geojson(year);
        const res = await axios.get(url);
        setGeoData(res.data);
      } catch (err) {
        console.error("Error loading GeoJSON:", err);
      }
    }
    fetchData();
  }, [year]);

  // Colors for LULC classes
  const getColor = (d: number) => {
    return d === 1
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
      : "#d9d9d9"; // Default
  };

  const style = (feature: any) => ({
    fillColor: getColor(feature.properties.code),
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  });

  // Custom Info control
  function InfoControl() {
    const map = useMap();
    useEffect(() => {
      const info = new L.Control({ position: "topleft" }) as L.Control & {
        _div?: HTMLElement;
        update?: (props?: any) => void;
      };

      info.onAdd = function () {
        this._div = L.DomUtil.create("div", "info");
        this.update?.();
        return this._div;
      };

      info.update = function (props?: any) {
        if (!this._div) return;
        this._div.innerHTML =
          "<h4>LULC Class</h4>" +
          (props
            ? `<b>${props.label}</b><br/>Class ID: ${props.code}`
            : "Hover over a region");
      };

      info.addTo(map);
      infoRef.current = info;

      return () => {
        info.remove();
      };
    }, [map]);

    return null;
  }

  // Custom Legend control
  function LegendControl() {
    const map = useMap();
    useEffect(() => {
      const legend = new L.Control({ position: "bottomleft" }) as L.Control & {
        onAdd?: (map: LeafletMap) => HTMLElement;
      };

      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        const classes = [1, 2, 4, 5, 7, 8, 9, 10, 11];
        const labels = [
          "Water",
          "Trees",
          "Flooded Vegetation",
          "Crops",
          "Built Area",
          "Bare Ground",
          "Snow/Ice",
          "Clouds",
          "Rangeland",
        ];

        for (let i = 0; i < classes.length; i++) {
          div.innerHTML +=
            `<i style="background:${getColor(classes[i])}"></i> ` +
            labels[i] +
            "<br>";
        }
        return div;
      };

      legend.addTo(map);

      return () => {
        legend.remove();
      };
    }, [map]);

    return null;
  }

  // Feature interactions (hover highlight, reset, zoom on click)
  function onEachFeature(feature: any, layer: any) {
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        layer.bringToFront();
        infoRef.current?.update?.(feature.properties);
      },
      mouseout: (e: any) => {
        geojsonRef.current?.resetStyle(e.target);
        infoRef.current?.update?.();
      },
      click: (e: any) => {
        e.target._map.fitBounds(e.target.getBounds());
      },
    });
  }

  return (
    <div>
      {/* Year slider */}
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#f8f9fa", 
        borderBottom: "1px solid #dee2e6",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontWeight: "bold", fontSize: "16px", color: "#495057" }}>
            Year:
          </label>
          <span style={{ 
            fontSize: "18px", 
            fontWeight: "bold", 
            color: "#007bff",
            minWidth: "60px",
            textAlign: "center"
          }}>
            {year}
          </span>
        </div>
        
        <div style={{ flex: 1, minWidth: "300px" }}>
          <input
            type="range"
            min="2017"
            max="2024"
            step="1"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={{ 
              width: "100%",
              height: "8px",
              borderRadius: "5px",
              background: "#ddd",
              outline: "none",
              cursor: "pointer"
            }}
          />
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            marginTop: "5px",
            fontSize: "12px",
            color: "#6c757d"
          }}>
            <span>2017</span>
            <span>2024</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              const currentYear = parseInt(year);
              if (currentYear > 2017) {
                setYear((currentYear - 1).toString());
              }
            }}
            disabled={parseInt(year) === 2017}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              opacity: parseInt(year) === 2017 ? 0.5 : 1
            }}
          >
            ← Previous
          </button>
          <button
            onClick={() => {
              const currentYear = parseInt(year);
              if (currentYear < 2024) {
                setYear((currentYear + 1).toString());
              }
            }}
            disabled={parseInt(year) === 2024}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              opacity: parseInt(year) === 2024 ? 0.5 : 1
            }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        style={{ height: "90vh", width: "100%" }}
        center={[33.6844, 73.0479]}
        zoom={10}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoData && (
          <GeoJSON
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
            ref={geojsonRef}
          />
        )}
        <InfoControl />
        <LegendControl />
      </MapContainer>
    </div>
  );
}
