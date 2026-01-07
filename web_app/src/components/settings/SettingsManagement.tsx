"use client";
import React, { useState } from "react";
import AboutSettings from "./AboutSettings";
import ContactSettings from "./ContactSettings";
import HeaderSettings from "./HeaderSettings";
import LogoSettings from "./LogoSettings";

type TabType = 'about' | 'contact' | 'header' | 'logo';

export default function SettingsManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('about');

  const tabs = [
    { id: 'about' as TabType, name: 'About Content', icon: '📝' },
    { id: 'contact' as TabType, name: 'Contact Info', icon: '📞' },
    { id: 'logo' as TabType, name: 'Logo Settings', icon: '🎨' },
    { id: 'header' as TabType, name: 'Header Config', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'about' && <AboutSettings />}
        {activeTab === 'contact' && <ContactSettings />}
        {activeTab === 'logo' && <LogoSettings />}
        {activeTab === 'header' && <HeaderSettings />}
      </div>
    </div>
  );
}
