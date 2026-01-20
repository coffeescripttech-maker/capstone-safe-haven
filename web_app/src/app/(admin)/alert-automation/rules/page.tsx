'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/safehaven-api';
import { Plus, Edit, Trash2, Power, PowerOff, ArrowLeft, AlertTriangle } from '@/components/ui/icons';

interface AlertRule {
  id: number;
  name: string;
  type: 'weather' | 'earthquake';
  conditions: any;
  alert_template: any;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export default function AlertRulesPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'weather' | 'earthquake'>('all');

  useEffect(() => {
    loadRules();
  }, [filter]);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await adminApi.alertAutomation.getRules(filter === 'all' ? undefined : filter);
      if (response.success) {
        setRules(response.data);
      }
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ruleId: number, currentStatus: boolean) => {
    try {
      const response = await adminApi.alertAutomation.toggleRule(ruleId, !currentStatus);
      if (response.success) {
        setRules(rules.map(r => r.id === ruleId ? { ...r, is_active: !currentStatus } : r));
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
      alert('Failed to toggle rule');
    }
  };

  const handleDelete = async (ruleId: number, ruleName: string) => {
    if (!confirm(`Are you sure you want to delete the rule "${ruleName}"?`)) {
      return;
    }
    
    try {
      const response = await adminApi.alertAutomation.deleteRule(ruleId);
      if (response.success) {
        setRules(rules.filter(r => r.id !== ruleId));
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete rule');
    }
  };

  const weatherRules = rules.filter(r => r.type === 'weather');
  const earthquakeRules = rules.filter(r => r.type === 'earthquake');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => window.location.href = '/alert-automation'}
            className="mb-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alert Rules</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage automation rules and thresholds</p>
        </div>
        <button
          onClick={() => window.location.href = '/alert-automation/rules/create'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Rules ({rules.length})
        </button>
        <button
          onClick={() => setFilter('weather')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'weather'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🌦️ Weather ({weatherRules.length})
        </button>
        <button
          onClick={() => setFilter('earthquake')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'earthquake'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🌍 Earthquake ({earthquakeRules.length})
        </button>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rules...</p>
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No rules found</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {filter === 'all' ? 'No automation rules configured' : `No ${filter} rules found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rules.map((rule) => (
            <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">
                        {rule.type === 'weather' ? '🌦️' : '🌍'}
                      </span>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                    </div>
                    <CardDescription>
                      Priority: {rule.priority} • {rule.is_active ? 'Active' : 'Inactive'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(rule.id, rule.is_active)}
                      title={rule.is_active ? 'Disable rule' : 'Enable rule'}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      {rule.is_active ? (
                        <Power className="w-4 h-4 text-green-600" />
                      ) : (
                        <PowerOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => window.location.href = `/alert-automation/rules/${rule.id}/edit`}
                      title="Edit rule"
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id, rule.name)}
                      title="Delete rule"
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Conditions */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Trigger Conditions
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 space-y-1 text-sm">
                    {rule.type === 'weather' && rule.conditions && (
                      <>
                        {rule.conditions.temperature_min && (
                          <div>🌡️ Temperature: ≥ {rule.conditions.temperature_min}°C</div>
                        )}
                        {rule.conditions.temperature_max && (
                          <div>🌡️ Temperature: ≤ {rule.conditions.temperature_max}°C</div>
                        )}
                        {rule.conditions.precipitation_min && (
                          <div>🌧️ Precipitation: ≥ {rule.conditions.precipitation_min}mm</div>
                        )}
                        {rule.conditions.wind_speed_min && (
                          <div>💨 Wind Speed: ≥ {rule.conditions.wind_speed_min}km/h</div>
                        )}
                      </>
                    )}
                    {rule.type === 'earthquake' && rule.conditions && (
                      <>
                        {rule.conditions.magnitude_min && (
                          <div>📊 Magnitude: ≥ M{rule.conditions.magnitude_min}</div>
                        )}
                        {rule.conditions.magnitude_max && (
                          <div>📊 Magnitude: ≤ M{rule.conditions.magnitude_max}</div>
                        )}
                        {rule.conditions.depth_max && (
                          <div>📏 Depth: ≤ {rule.conditions.depth_max}km</div>
                        )}
                        {rule.conditions.radius_km && (
                          <div>📍 Alert Radius: {rule.conditions.radius_km}km</div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Alert Template */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Alert Template
                  </h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Type:</span>
                      <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-xs">
                        {rule.alert_template.alert_type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        rule.alert_template.severity === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {rule.alert_template.severity}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Title:</span> {rule.alert_template.title}
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {rule.alert_template.description}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                  <div>Created: {new Date(rule.created_at).toLocaleDateString()}</div>
                  <div>Updated: {new Date(rule.updated_at).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
