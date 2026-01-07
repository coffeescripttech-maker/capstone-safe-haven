"use client";
import React, { useState, useEffect } from "react";
import FileUpload from "@/components/upload/FileUpload";
import { toast } from "sonner";

interface LogoData {
  logo_light: string | null;
  logo_dark: string | null;
  logo_icon: string | null;
}

export default function LogoSettings() {
  const [logoData, setLogoData] = useState<LogoData>({
    logo_light: null,
    logo_dark: null,
    logo_icon: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLogoData();
  }, []);

  const fetchLogoData = async () => {
    try {
      const response = await fetch("/api/settings/logo");
      if (response.ok) {
        const data = await response.json();
        setLogoData({
          logo_light: data.logo_light || null,
          logo_dark: data.logo_dark || null,
          logo_icon: data.logo_icon || null,
        });
      }
    } catch (error) {
      console.error("Error fetching logo data:", error);
      toast.error("Failed to load logo settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings/logo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo_light: logoData.logo_light,
          logo_dark: logoData.logo_dark,
          logo_icon: logoData.logo_icon,
        }),
      });

      if (response.ok) {
        toast.success("Logo settings saved successfully!");
        // Trigger a page reload to update logos everywhere
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving logo data:", error);
      toast.error("Failed to save logo settings: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          <strong>Note:</strong> Upload your custom logos here. These will replace the default logos throughout the application including the sidebar, signin page, and other areas.
        </p>
      </div>

      {/* Light Mode Logo */}
      <div>
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
          Light Mode Logo
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This logo will be displayed in light mode (full width logo for sidebar when expanded)
        </p>
        <FileUpload
          type="image"
          folder="branding/logos"
          currentFile={logoData.logo_light || undefined}
          onUploadComplete={(result) => {
            setLogoData((prev) => ({ ...prev, logo_light: result.publicUrl }));
            toast.success("Light mode logo uploaded");
          }}
          onUploadError={(error) => {
            toast.error(`Upload failed: ${error}`);
          }}
          onRemove={() => {
            setLogoData((prev) => ({ ...prev, logo_light: null }));
          }}
        />
        {logoData.logo_light && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
            <img
              src={logoData.logo_light}
              alt="Light mode logo"
              className="h-10 object-contain"
            />
          </div>
        )}
      </div>

      {/* Dark Mode Logo */}
      <div>
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
          Dark Mode Logo
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This logo will be displayed in dark mode (full width logo for sidebar when expanded)
        </p>
        <FileUpload
          type="image"
          folder="branding/logos"
          currentFile={logoData.logo_dark || undefined}
          onUploadComplete={(result) => {
            setLogoData((prev) => ({ ...prev, logo_dark: result.publicUrl }));
            toast.success("Dark mode logo uploaded");
          }}
          onUploadError={(error) => {
            toast.error(`Upload failed: ${error}`);
          }}
          onRemove={() => {
            setLogoData((prev) => ({ ...prev, logo_dark: null }));
          }}
        />
        {logoData.logo_dark && (
          <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <img
              src={logoData.logo_dark}
              alt="Dark mode logo"
              className="h-10 object-contain"
            />
          </div>
        )}
      </div>

      {/* Icon Logo */}
      <div>
        <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-2">
          Icon Logo (Collapsed Sidebar)
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This compact logo will be displayed when the sidebar is collapsed (recommended: square icon, 32x32px or larger)
        </p>
        <FileUpload
          type="image"
          folder="branding/logos"
          currentFile={logoData.logo_icon || undefined}
          onUploadComplete={(result) => {
            setLogoData((prev) => ({ ...prev, logo_icon: result.publicUrl }));
            toast.success("Icon logo uploaded");
          }}
          onUploadError={(error) => {
            toast.error(`Upload failed: ${error}`);
          }}
          onRemove={() => {
            setLogoData((prev) => ({ ...prev, logo_icon: null }));
          }}
        />
        {logoData.logo_icon && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
            <img
              src={logoData.logo_icon}
              alt="Icon logo"
              className="h-8 w-8 object-contain"
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Logo Settings"}
        </button>
        <button
          onClick={fetchLogoData}
          disabled={saving}
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
