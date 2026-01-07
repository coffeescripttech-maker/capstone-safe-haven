import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard - DubaiFilmMaker CMS",
  description: "Portfolio website analytics and statistics",
};

export default function Dashboard() {
  return <AnalyticsDashboard />;
}
