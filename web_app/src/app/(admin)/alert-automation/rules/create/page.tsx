'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/safehaven-api';
import { ArrowLeft, AlertTriangle } from '@/components/ui/icons';

export default function CreateRulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'weather' | 'earthquake'>('weather');
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Weather conditions
  const [tempMin, setTempMin] = useState('');
  const [tempMax, setTempMax] = useState('');
  const [precipMin, setPrecipMin] = useState('');
  const [windMin, setWindMin] = useState('');

  // Earthquake conditions
  const [magMin, setMagMin] = useState('');
  const [magMax, setMagMax] = useState('');
  const [depthMax, setDepthMax] = useState('');
  const [radiusKm, setRadiusKm] = useState('100');

  // Alert template
  const [alertType, setAlertType] = useState('weather');
  const [severity, setSeverity] = useState('Warning');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Rule name is required');
      return;
    }
    if (!title.trim()) {
      setError('Alert title is required');
      return;
    }
    if (!description.trim()) {
      setError('Alert description is required');
      return;
    }

    // Build conditions object
    const conditions: any = {};
    
    if (type === 'weather') {
      if (tempMin) conditions.temperature = { ...conditions.temperature, min: parseFloat(tempMin) };
      if (tempMax) conditions.temperature = { ...conditions.temperature, max: parseFloat(tempMax) };
      if (precipMin) conditions.precipitation = { min: parseFloat(precipMin) };
      if (windMin) conditions.windSpeed = { min: parseFloat(windMin) };
    } else {
      if (magMin) conditions.magnitude = { ...conditions.magnitude, min: parseFloat(magMin) };
      if (magMax) conditions.magnitude = { ...conditions.magnitude, max: parseFloat(magMax) };
      if (depthMax) conditions.depth_max = parseFloat(depthMax);
      if (radiusKm) conditions.radius_km = parseFloat(radiusKm);
    }

    // Build alert template
    const alert_template = {
      alert_type: alertType,
      severity: severity,
      title: title,
      description: description
    };

    const ruleData = {
      name,
      type,
      conditions,
      alert_template,
      is_active: isActive,
      priority
    };

    try {
      setLoading(true);
      const response = await adminApi.alertAutomation.createRule(ruleData);
      
      if (response.success) {
        router.push('/alert-automation/rules');
      } else {
        setError(response.message || 'Failed to create rule');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/alert-automation/rules')}
          className="mb-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rules
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Alert Rule</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Define conditions and alert template</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Rule name and type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rule Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Extreme Heat Warning"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rule Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'weather' | 'earthquake')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="weather">🌦️ Weather</option>
                <option value="earthquake">🌍 Earthquake</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Higher priority rules are evaluated first</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trigger Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Trigger Conditions</CardTitle>
            <CardDescription>
              {type === 'weather' ? 'Weather thresholds that trigger this rule' : 'Earthquake thresholds that trigger this rule'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === 'weather' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🌡️ Min Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={tempMin}
                      onChange={(e) => setTempMin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 35"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      🌡️ Max Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={tempMax}
                      onChange={(e) => setTempMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 45"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🌧️ Min Precipitation (mm)
                  </label>
                  <input
                    type="number"
                    value={precipMin}
                    onChange={(e) => setPrecipMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 50"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    💨 Min Wind Speed (km/h)
                  </label>
                  <input
                    type="number"
                    value={windMin}
                    onChange={(e) => setWindMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 60"
                    step="0.1"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      📊 Min Magnitude
                    </label>
                    <input
                      type="number"
                      value={magMin}
                      onChange={(e) => setMagMin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 5.0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      📊 Max Magnitude
                    </label>
                    <input
                      type="number"
                      value={magMax}
                      onChange={(e) => setMagMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 10.0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📏 Max Depth (km)
                  </label>
                  <input
                    type="number"
                    value={depthMax}
                    onChange={(e) => setDepthMax(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📍 Alert Radius (km)
                  </label>
                  <input
                    type="number"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 100"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Users within this radius will be notified</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Alert Template */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Template</CardTitle>
            <CardDescription>Alert details sent to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alert Type *
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="weather">Weather</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="flood">Flood</option>
                  <option value="typhoon">Typhoon</option>
                  <option value="fire">Fire</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                  <option value="Extreme">Extreme</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Extreme Heat Warning"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Describe the alert and recommended actions..."
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/alert-automation/rules')}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Rule'}
          </button>
        </div>
      </form>
    </div>
  );
}
