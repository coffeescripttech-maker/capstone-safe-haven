'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Users,
  Clock,
  AlertCircle,
  Calendar,
  Loader2,
  ArrowLeft,
  Eye,
  MapPin,
  Globe,
  Zap
} from 'lucide-react';
import { smsBlastAPI } from '@/lib/sms-blast-api';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  language: 'en' | 'fil';
  variables: string[];
}

interface ContactGroup {
  id: string;
  name: string;
  memberCount: number;
  recipientFilters: {
    provinces?: string[];
    cities?: string[];
    barangays?: string[];
  };
}

export default function SendSMSBlastPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  
  // Location data from database
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);
  
  // Form state
  const [messageType, setMessageType] = useState<'custom' | 'template'>('custom');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<'en' | 'fil'>('en');
  const [priority, setPriority] = useState<'critical' | 'high' | 'normal'>('normal');
  const [sendNow, setSendNow] = useState(true);
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Recipient filters
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);
  const [selectedContactGroups, setSelectedContactGroups] = useState<string[]>([]);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [recipientDetails, setRecipientDetails] = useState<Array<{name: string, phone: string}>>([]);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [smsPartCount, setSmsPartCount] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    calculateMessageMetrics();
  }, [customMessage, selectedTemplate, templateVariables, language]);

  useEffect(() => {
    // Estimate recipients when filters change
    estimateRecipients();
  }, [selectedProvinces, selectedCities, selectedBarangays, selectedContactGroups]);

  const loadInitialData = async () => {
    try {
      console.log('Starting to load initial data...');
      
      // Load templates, groups, and locations (required)
      const [templatesData, groupsData, locationsData]: any = await Promise.all([
        smsBlastAPI.getTemplates(),
        smsBlastAPI.getContactGroups(),
        smsBlastAPI.getAllLocations()
      ]);
      
      console.log('Templates Response:', templatesData);
      console.log('Groups Response:', groupsData);
      console.log('Locations Response:', locationsData);
      
      // API returns { status: "success", data: { templates: [...], count: ... } }
      const extractedTemplates = templatesData.data?.templates || [];
      const extractedGroups = groupsData.data?.groups || [];
      const extractedProvinces = locationsData.data?.provinces || [];
      const extractedCities = locationsData.data?.cities || [];
      const extractedBarangays = locationsData.data?.barangays || [];
      
      console.log('Extracted templates count:', extractedTemplates.length);
      console.log('Extracted groups count:', extractedGroups.length);
      console.log('Extracted provinces count:', extractedProvinces.length);
      
      setTemplates(extractedTemplates);
      setContactGroups(extractedGroups);
      setProvinces(extractedProvinces);
      setCities(extractedCities);
      setBarangays(extractedBarangays);
      
      console.log('Successfully loaded initial data');
    } catch (error: any) {
      console.error('=== ERROR LOADING DATA ===');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('========================');
      toast.error(`Failed to load initial data: ${error?.message || 'Unknown error'}`);
    }
  };

  const calculateMessageMetrics = () => {
    let message = '';
    
    if (messageType === 'custom') {
      message = customMessage;
    } else if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        message = template.content;
        template.variables.forEach(variable => {
          const value = templateVariables[variable] || `{${variable}}`;
          message = message.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
        });
      }
    }

    const charCount = message.length;
    setCharacterCount(charCount);

    // Calculate SMS parts based on encoding
    const maxCharsPerSMS = language === 'en' ? 160 : 70;
    const maxCharsPerPart = language === 'en' ? 153 : 67;
    
    let parts = 1;
    if (charCount > maxCharsPerSMS) {
      parts = Math.ceil(charCount / maxCharsPerPart);
    }
    setSmsPartCount(parts);

    // Estimate cost (1 credit per SMS part per recipient)
    const cost = parts * recipientCount;
    setEstimatedCost(cost);
  };

  const estimateRecipients = async () => {
    // Only estimate if at least one filter is selected
    if (selectedProvinces.length === 0 && selectedContactGroups.length === 0) {
      setRecipientCount(0);
      setRecipientDetails([]);
      setEstimatedCost(0);
      return;
    }

    try {
      const data: any = await smsBlastAPI.estimateRecipients({
        recipientFilters: {
          provinces: selectedProvinces,
          cities: selectedCities,
          barangays: selectedBarangays,
          contactGroupIds: selectedContactGroups
        },
        message: messageType === 'custom' ? customMessage : undefined,
        templateId: messageType === 'template' ? selectedTemplate : undefined,
        language
      });

      const count = data.data?.recipientCount || 0;
      const recipients = data.data?.recipients || [];
      setRecipientCount(count);
      setRecipientDetails(recipients);
      
      // Recalculate cost with new recipient count
      const cost = smsPartCount * count;
      setEstimatedCost(cost);
    } catch (error: any) {
      console.error('Error estimating recipients:', error);
      // Don't show error toast, just keep count at 0
      setRecipientCount(0);
      setRecipientDetails([]);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setLanguage(template.language);
      // Initialize template variables
      const vars: Record<string, string> = {};
      template.variables.forEach(v => vars[v] = '');
      setTemplateVariables(vars);
    }
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    setShowPreview(true);
  };

  const validateForm = () => {
    if (messageType === 'custom' && !customMessage.trim()) {
      toast.error('Please enter a message');
      return false;
    }

    if (messageType === 'template' && !selectedTemplate) {
      toast.error('Please select a template');
      return false;
    }

    if (messageType === 'template') {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        const missingVars = template.variables.filter(v => !templateVariables[v]?.trim());
        if (missingVars.length > 0) {
          toast.error(`Please fill in: ${missingVars.join(', ')}`);
          return false;
        }
      }
    }

    if (selectedProvinces.length === 0 && selectedContactGroups.length === 0) {
      toast.error('Please select recipients');
      return false;
    }

    if (!sendNow && !scheduledTime) {
      toast.error('Please select a scheduled time');
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const data: any = {
        recipientFilters: {
          provinces: selectedProvinces,
          cities: selectedCities,
          barangays: selectedBarangays,
          contactGroupIds: selectedContactGroups
        },
        language,
        priority
      };

      if (messageType === 'custom') {
        data.message = customMessage;
      } else {
        data.templateId = selectedTemplate;
        data.templateVariables = templateVariables;
      }

      if (!sendNow) {
        data.scheduledTime = scheduledTime;
      }

      const result: any = await smsBlastAPI.createBlast(data);
      
      toast.success(`SMS Blast created! ${result.data.recipientCount} messages queued.`);
      router.push('/sms-blast');
    } catch (error: any) {
      console.error('Error creating SMS blast:', error);
      toast.error(error.message || 'Failed to create SMS blast');
    } finally {
      setIsLoading(false);
      setShowPreview(false);
    }
  };

  const getPreviewMessage = () => {
    if (messageType === 'custom') {
      return customMessage;
    }
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return '';
    
    let message = template.content;
    template.variables.forEach(variable => {
      const value = templateVariables[variable] || `{${variable}}`;
      message = message.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
    });
    return message;
  };

  console.log({templates});

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Send SMS Blast
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and send emergency SMS notifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Type */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              1. Choose Message Type
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMessageType('custom')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  messageType === 'custom'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className={`w-6 h-6 mb-2 ${
                  messageType === 'custom' ? 'text-brand-600' : 'text-gray-400'
                }`} />
                <p className="font-medium text-gray-900 dark:text-white">Custom Message</p>
                <p className="text-xs text-gray-500 mt-1">Write your own message</p>
              </button>

              <button
                onClick={() => setMessageType('template')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  messageType === 'template'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className={`w-6 h-6 mb-2 ${
                  messageType === 'template' ? 'text-brand-600' : 'text-gray-400'
                }`} />
                <p className="font-medium text-gray-900 dark:text-white">Use Template</p>
                <p className="text-xs text-gray-500 mt-1">Select pre-made template</p>
              </button>
            </div>

            {messageType === 'custom' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Content
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Type your emergency message here..."
                />
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-gray-500">
                    {characterCount} / {language === 'en' ? '160' : '70'} characters
                  </span>
                  <span className="text-gray-500">
                    {smsPartCount} SMS part{smsPartCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}


            {messageType === 'template' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.language === 'en' ? 'English' : 'Filipino'})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && templates.find(t => t.id === selectedTemplate)?.variables.map(variable => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {variable.charAt(0).toUpperCase() + variable.slice(1)}
                    </label>
                    <input
                      type="text"
                      value={templateVariables[variable] || ''}
                      onChange={(e) => setTemplateVariables({
                        ...templateVariables,
                        [variable]: e.target.value
                      })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={`Enter ${variable}...`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Recipients */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              2. Select Recipients
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Province
                </label>
                <select
                  multiple
                  value={selectedProvinces}
                  onChange={(e) => setSelectedProvinces(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  size={4}
                >
                  {provinces.length === 0 ? (
                    <option disabled>No provinces found in database</option>
                  ) : (
                    provinces.map(province => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Contact Groups (Optional)
                </label>
                <select
                  multiple
                  value={selectedContactGroups}
                  onChange={(e) => setSelectedContactGroups(Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  size={3}
                >
                  {contactGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.memberCount} members)
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Estimated Recipients
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {recipientCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Active users with valid phone numbers
                    </p>
                  </div>
                </div>
              </div>

              {/* Display recipient phone numbers */}
              {recipientDetails.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Recipients List ({recipientDetails.length})
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {recipientDetails.map((recipient, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between text-sm py-2 px-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <span className="text-gray-900 dark:text-white font-medium">
                          {recipient.name || 'Unknown'}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono">
                          {recipient.phone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              3. Message Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Language
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLanguage('en')}
                    disabled={messageType === 'template' && selectedTemplate !== ''}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      language === 'en'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <p className="font-medium">English</p>
                    <p className="text-xs text-gray-500">160 chars/SMS</p>
                  </button>
                  <button
                    onClick={() => setLanguage('fil')}
                    disabled={messageType === 'template' && selectedTemplate !== ''}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      language === 'fil'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <p className="font-medium">Filipino</p>
                    <p className="text-xs text-gray-500">70 chars/SMS</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['critical', 'high', 'normal'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        priority === p
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="font-medium capitalize">{p}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendNow}
                    onChange={(e) => setSendNow(e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Send Immediately
                  </span>
                </label>
              </div>

              {!sendNow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview
            </h2>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Message:</p>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {getPreviewMessage() || 'Your message will appear here...'}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {recipientCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Characters:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {characterCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">SMS Parts:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {smsPartCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost per Recipient:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {smsPartCount} credit{smsPartCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                    <span className="text-lg font-bold text-brand-600">
                      {estimatedCost.toLocaleString()} credits
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePreview}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send SMS Blast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Confirm SMS Blast
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      You are about to send an SMS to:
                    </p>
                    <ul className="mt-2 text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                      <li>• {recipientCount.toLocaleString()} recipients</li>
                      <li>• Cost: {estimatedCost.toLocaleString()} credits</li>
                      <li>• Priority: {priority}</li>
                      {!sendNow && <li>• Scheduled: {new Date(scheduledTime).toLocaleString()}</li>}
                    </ul>
                    <p className="mt-2 text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Preview:
                </p>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {getPreviewMessage()}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Confirm Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
