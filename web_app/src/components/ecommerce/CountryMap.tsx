import React from "react";
// import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";
import dynamic from "next/dynamic";

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

// Define the component props
interface CountryMapProps {
  mapColor?: string;
  countries?: Array<{ country: string; visitors: number }>;
}

type MarkerStyle = {
  initial: {
    fill: string;
    r: number;
  };
};

type Marker = {
  latLng: [number, number];
  name: string;
  style?: {
    fill: string;
    borderWidth: number;
    borderColor: string;
    stroke?: string;
    strokeOpacity?: number;
  };
};

// Country coordinates mapping
const countryCoordinates: Record<string, [number, number]> = {
  'PH': [12.8797, 121.774],
  'Philippines': [12.8797, 121.774],
  'US': [37.0902, -95.7129],
  'USA': [37.0902, -95.7129],
  'United States': [37.0902, -95.7129],
  'AE': [23.4241, 53.8478],
  'UAE': [23.4241, 53.8478],
  'United Arab Emirates': [23.4241, 53.8478],
  'GB': [55.3781, -3.4360],
  'UK': [55.3781, -3.4360],
  'United Kingdom': [55.3781, -3.4360],
  'FR': [46.2276, 2.2137],
  'France': [46.2276, 2.2137],
  'SA': [23.8859, 45.0792],
  'Saudi Arabia': [23.8859, 45.0792],
  'DE': [51.1657, 10.4515],
  'Germany': [51.1657, 10.4515],
  'IN': [20.5937, 78.9629],
  'India': [20.5937, 78.9629],
  'CA': [56.1304, -106.3468],
  'Canada': [56.1304, -106.3468],
  'AU': [-25.2744, 133.7751],
  'Australia': [-25.2744, 133.7751],
};

const CountryMap: React.FC<CountryMapProps> = ({ mapColor, countries }) => {
  // Generate markers from real analytics data
  const markers: Marker[] = countries && countries.length > 0
    ? countries.slice(0, 10).map(country => {
        const coords = countryCoordinates[country.country];
        if (!coords) return null;
        
        return {
          latLng: coords,
          name: `${country.country}: ${country.visitors} visitors`,
          style: {
            fill: "#465FFF",
            borderWidth: 1,
            borderColor: "white",
            stroke: "#383f47",
          },
        };
      }).filter(Boolean) as Marker[]
    : [
        {
          latLng: [37.0902, -95.7129],
          name: "United States",
          style: {
            fill: "#465FFF",
            borderWidth: 1,
            borderColor: "white",
            stroke: "#383f47",
          },
        },
      ];

  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markerStyle={
        {
          initial: {
            fill: "#465FFF",
            r: 4,
          },
        } as MarkerStyle
      }
      markersSelectable={true}
      markers={markers}
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      regionStyle={{
        initial: {
          fill: mapColor || "#D0D5DD",
          fillOpacity: 1,
          fontFamily: "Outfit",
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#465fff",
          stroke: "none",
        },
        selected: {
          fill: "#465FFF",
        },
        selectedHover: {},
      }}
      regionLabelStyle={{
        initial: {
          fill: "#35373e",
          fontWeight: 500,
          fontSize: "13px",
          stroke: "none",
        },
        hover: {},
        selected: {},
        selectedHover: {},
      }}
    />
  );
};

export default CountryMap;
