"use client";
import CountryMap from "./CountryMap";
import { useState } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Flag from "react-world-flags";

interface AnalyticsData {
  countries: Array<{ country: string; visitors: number }>;
  uniqueVisitors: {
    total: number;
  };
}

interface DemographicCardProps {
  analytics: AnalyticsData | null;
}

// Country name to ISO 3166-1 alpha-2 code mapping
const countryToCode: Record<string, string> = {
  'PH': 'PH',
  'Philippines': 'PH',
  'US': 'US',
  'USA': 'US',
  'United States': 'US',
  'AE': 'AE',
  'UAE': 'AE',
  'United Arab Emirates': 'AE',
  'GB': 'GB',
  'UK': 'GB',
  'United Kingdom': 'GB',
  'FR': 'FR',
  'France': 'FR',
  'SA': 'SA',
  'Saudi Arabia': 'SA',
  'DE': 'DE',
  'Germany': 'DE',
  'IN': 'IN',
  'India': 'IN',
  'CA': 'CA',
  'Canada': 'CA',
  'AU': 'AU',
  'Australia': 'AU',
  'JP': 'JP',
  'Japan': 'JP',
  'CN': 'CN',
  'China': 'CN',
  'BR': 'BR',
  'Brazil': 'BR',
  'MX': 'MX',
  'Mexico': 'MX',
  'ES': 'ES',
  'Spain': 'ES',
  'IT': 'IT',
  'Italy': 'IT',
  'NL': 'NL',
  'Netherlands': 'NL',
};

// Get country code from country name
function getCountryCode(countryName: string): string {
  return countryToCode[countryName] || countryName.substring(0, 2).toUpperCase();
}

export default function DemographicCard({ analytics }: DemographicCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Customers Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of customer based on country
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap countries={analytics?.countries} />
        </div>
      </div>

      <div className="space-y-5">
        {analytics?.countries && analytics.countries.length > 0 ? (
          analytics.countries.slice(0, 5).map((country, index) => {
            const totalVisitors = analytics.uniqueVisitors.total;
            const percentage = totalVisitors > 0 ? (country.visitors / totalVisitors) * 100 : 0;
            const countryCode = getCountryCode(country.country);
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Flag 
                      code={countryCode} 
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      fallback={
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400">
                          {countryCode}
                        </div>
                      }
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {country.country}
                    </p>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {country.visitors.toLocaleString()} Visitors
                    </span>
                  </div>
                </div>

                <div className="flex w-full max-w-[140px] items-center gap-3">
                  <div className="relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800">
                    <div 
                      className="absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white"
                      style={{ width: `${Math.round(percentage)}%` }}
                    ></div>
                  </div>
                  <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                    {Math.round(percentage)}%
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No visitor data available yet</p>
            <p className="text-sm mt-2">Data will appear once your site receives traffic</p>
          </div>
        )}
      </div>
    </div>
  );
}
