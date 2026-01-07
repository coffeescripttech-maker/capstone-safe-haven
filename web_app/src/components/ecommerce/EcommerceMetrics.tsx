"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, GroupIcon } from "@/icons";

interface AnalyticsData {
  pageViews?: {
    total: number;
    change: number;
  };
  uniqueVisitors?: {
    total: number;
    change: number;
  };
}

interface Props {
  analytics?: AnalyticsData | null;
}

export const EcommerceMetrics = ({ analytics }: Props) => {
  const pageViews = analytics?.pageViews?.total || 0;
  const pageViewsChange = analytics?.pageViews?.change || 0;
  const uniqueVisitors = analytics?.uniqueVisitors?.total || 0;
  const visitorsChange = analytics?.uniqueVisitors?.change || 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Page Views Metric --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
          <EyeIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page Views
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {pageViews.toLocaleString()}
            </h4>
          </div>
          <Badge color={pageViewsChange >= 0 ? "success" : "error"}>
            {pageViewsChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(pageViewsChange).toFixed(1)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric End --> */}

      {/* <!-- Unique Visitors Metric --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
          <GroupIcon className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Unique Visitors
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {uniqueVisitors.toLocaleString()}
            </h4>
          </div>

          <Badge color={visitorsChange >= 0 ? "success" : "error"}>
            {visitorsChange >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(visitorsChange).toFixed(1)}%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric End --> */}
    </div>
  );
};
