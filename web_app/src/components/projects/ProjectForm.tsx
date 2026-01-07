"use client";
import React, { useState, useEffect } from "react";
import { Project, Credit } from "@/lib/db";
import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import FileUpload from "@/components/upload/FileUpload";
import { PlusIcon, TrashBinIcon } from "@/icons";
import { toast } from "sonner";

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: Partial<Project>) => void;
  onCancel: () => void;
  existingProjects?: Project[];
}

export default function ProjectForm({ project, onSubmit, onCancel, existingProjects = [] }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    category: '',
    data_cat: '',
    languages: '',
    classification: '',
    vimeo_id: '',
    video_url: '',
    poster_image: '',
    poster_image_srcset: '',
    order_index: 0,
    is_featured: false,
    is_published: true
  });

  const [credits, setCredits] = useState<Credit[]>([
    { role: '', name: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [orderIndexWarning, setOrderIndexWarning] = useState<string>('');

  // Get next available order index
  const getNextAvailableOrderIndex = (): number => {
    if (existingProjects.length === 0) return 0;
    
    const usedIndices = existingProjects
      .filter(p => p.id !== project?.id) // Exclude current project when editing
      .map(p => p.order_index)
      .sort((a, b) => a - b);
    
    // Find the first gap or return max + 1
    for (let i = 0; i < usedIndices.length; i++) {
      if (usedIndices[i] !== i) {
        return i;
      }
    }
    return usedIndices.length;
  };

  // Check if order index is already used
  const isOrderIndexDuplicate = (index: number): boolean => {
    return existingProjects.some(p => 
      p.order_index === index && p.id !== project?.id
    );
  };

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        client: project.client || '',
        category: project.category || '',
        data_cat: project.data_cat || '',
        languages: project.languages || '',
        classification: project.classification || '',
        vimeo_id: project.vimeo_id || '',
        video_url: project.video_url || '',
        poster_image: project.poster_image || '',
        poster_image_srcset: project.poster_image_srcset || '',
        order_index: project.order_index || 0,
        is_featured: project.is_featured || false,
        is_published: project.is_published !== undefined ? project.is_published : true
      });
      setCredits(project.credits && project.credits.length > 0 ? project.credits : [{ role: '', name: '' }]);
    }
  }, [project]);

  // Classification to Category mapping
  const classificationMapping: Record<string, { category: string; data_cat: string }> = {
    'TVC': { 
      category: 'Television Commercial', 
      data_cat: 'commercial' 
    },
    'BRAND FILM': { 
      category: 'Brand Film / Corporate', 
      data_cat: 'corporate' 
    },
    'DOCUMENTARY': { 
      category: 'Documentary', 
      data_cat: 'documentary' 
    },
    'COMMERCIAL': { 
      category: 'Commercial', 
      data_cat: 'commercial' 
    },
    'GOVERNMENT': { 
      category: 'Government / Strategic Communication', 
      data_cat: 'government' 
    },
    'TOURISM': { 
      category: 'Tourism / Destination Marketing', 
      data_cat: 'tourism' 
    },
    'CORPORATE': { 
      category: 'Corporate Video', 
      data_cat: 'corporate' 
    },
    'MUSIC VIDEO': { 
      category: 'Music Video', 
      data_cat: 'entertainment' 
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClassificationChange = (classification: string) => {
    const mapping = classificationMapping[classification];
    
    if (mapping) {
      setFormData(prev => ({
        ...prev,
        classification,
        category: mapping.category,
        data_cat: mapping.data_cat
      }));
      
      toast.success('Auto-filled', {
        description: `Category set to: ${mapping.category}`
      });
    } else {
      handleInputChange('classification', classification);
    }
  };

  const handleCreditChange = (index: number, field: 'role' | 'name', value: string) => {
    const newCredits = [...credits];
    newCredits[index][field] = value;
    setCredits(newCredits);
  };

  const addCredit = () => {
    setCredits([...credits, { role: '', name: '' }]);
  };

  const removeCredit = (index: number) => {
    if (credits.length > 1) {
      setCredits(credits.filter((_, i) => i !== index));
    }
  };

  const generateVideoUrl = (vimeoId: string) => {
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
    return '';
  };

  const handleVimeoIdChange = (vimeoId: string) => {
    handleInputChange('vimeo_id', vimeoId);
    handleInputChange('video_url', generateVideoUrl(vimeoId));
  };

  // Individual field validators for inline validation
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'title':
        if (!value || !value.trim()) return 'Project title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 200) return 'Title must be less than 200 characters';
        return '';
      
      case 'client':
        if (!value || !value.trim()) return 'Client name is required';
        if (value.length < 2) return 'Client name must be at least 2 characters';
        return '';
      
      case 'classification':
        if (!value) return 'Project type is required';
        return '';
      
      case 'languages':
        if (!value) return 'Language selection is required';
        return '';
      
      case 'order_index':
        if (value < 0) return 'Order index cannot be negative';
        if (value > 9999) return 'Order index must be less than 10000';
        if (isOrderIndexDuplicate(value)) {
          const nextAvailable = getNextAvailableOrderIndex();
          return `Index ${value} is already used. Try ${nextAvailable}`;
        }
        return '';
      
      // case 'poster_image':
      //   if (!value || !value.trim()) return 'Poster image is required';
      //   return '';
      
      case 'video':
        if (!formData.vimeo_id && !formData.video_url) {
          return 'Please upload a video or provide a Vimeo ID';
        }
        return '';
      
      case 'vimeo_id':
        if (value && !/^\d+$/.test(value)) {
          return 'Vimeo ID must contain only numbers';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleFieldBlur = (field: string, value: any) => {
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate all required fields
    const fieldsToValidate = [
      'title',
      'client',
      'classification',
      'languages',
      'order_index',
      'poster_image',
      'video'
    ];

    fieldsToValidate.forEach(field => {
      const value = field === 'video' ? null : formData[field as keyof typeof formData];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Credits are optional - no validation needed

    setErrors(newErrors);

    // Show toast for first error
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error('Validation Error', {
        description: firstError
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Filter out empty credits
      const validCredits = credits.filter(credit => credit.role.trim() && credit.name.trim());

      const submitData = {
        ...formData,
        credits: validCredits,
        order_index: Number(formData.order_index)
      };

      await onSubmit(submitData);
      
      toast.success(project ? 'Project Updated!' : 'Project Created!', {
        description: `${formData.title} has been ${project ? 'updated' : 'created'} successfully.`
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to save project'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Title */}
        <div className="md:col-span-2">
          <Label>
            Project Title <span className="text-red-500">*</span>
          </Label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => {
              const value = e.target.value;
              handleInputChange('title', value);
              setTouched({ ...touched, title: true });
              const error = validateField('title', value);
              setErrors(prev => ({ ...prev, title: error }));
            }}
            onBlur={() => setTouched({ ...touched, title: true })}
            placeholder="Enter project title"
          
            className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
              touched.title && errors.title 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                : touched.title && !errors.title && formData.title
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
            }`}
          />
          {touched.title && errors.title && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>
          )}
          {touched.title && !errors.title && formData.title && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Looks good!
            </p>
          )}
        </div>

        {/* Client */}
        <div>
          <Label>
            Client <span className="text-red-500">*</span>
          </Label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => {
              const value = e.target.value;
              handleInputChange('client', value);
              setTouched({ ...touched, client: true });
              const error = validateField('client', value);
              setErrors(prev => ({ ...prev, client: error }));
            }}
            onBlur={() => setTouched({ ...touched, client: true })}
            placeholder="Enter client name"
            
            className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
              touched.client && errors.client 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                : touched.client && !errors.client && formData.client
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
            }`}
          />
          {touched.client && errors.client && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.client}</p>
          )}
          {touched.client && !errors.client && formData.client && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Looks good!
            </p>
          )}
        </div>

        {/* Classification - Main field that auto-populates others */}
        <div>
          <Label>
            Project Type <span className="text-red-500">*</span>
          </Label>
          <select
            value={formData.classification}
            onChange={(e) => {
              const value = e.target.value;
              handleClassificationChange(value);
              setTouched({ ...touched, classification: true });
              const error = validateField('classification', value);
              setErrors(prev => ({ ...prev, classification: error }));
            }}
            onBlur={() => setTouched({ ...touched, classification: true })}
            
            className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
              touched.classification && errors.classification 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                : touched.classification && !errors.classification && formData.classification
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
            }`}
          >
            <option value="">Select Project Type</option>
            <option value="TVC">TVC (Television Commercial)</option>
            <option value="BRAND FILM">Brand Film</option>
            <option value="DOCUMENTARY">Documentary</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="GOVERNMENT">Government / Strategic</option>
            <option value="TOURISM">Tourism / Destination</option>
            <option value="CORPORATE">Corporate Video</option>
            <option value="MUSIC VIDEO">Music Video</option>
          </select>
          {touched.classification && errors.classification && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.classification}</p>
          )}
          {touched.classification && !errors.classification && formData.classification && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Looks good! Category: {formData.category}
            </p>
          )}
        </div>

        {/* Languages */}
        <div>
          <Label>
            Languages <span className="text-red-500">*</span>
          </Label>
          <select
            value={formData.languages}
            onChange={(e) => {
              const value = e.target.value;
              handleInputChange('languages', value);
              setTouched({ ...touched, languages: true });
              const error = validateField('languages', value);
              setErrors(prev => ({ ...prev, languages: error }));
            }}
            onBlur={() => setTouched({ ...touched, languages: true })}
            
            className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
              touched.languages && errors.languages 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                : touched.languages && !errors.languages && formData.languages
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
            }`}
          >
            <option value="">Select Languages</option>
            <option value="Arabic & English">Arabic & English</option>
            <option value="Arabic only">Arabic only</option>
            <option value="English only">English only</option>
            <option value="—">Not specified</option>
          </select>
          {touched.languages && errors.languages && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.languages}</p>
          )}
          {touched.languages && !errors.languages && formData.languages && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Looks good!
            </p>
          )}
        </div>

        {/* Order Index */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Order Index</Label>
            <button
              type="button"
              onClick={() => {
                const nextIndex = getNextAvailableOrderIndex();
                handleInputChange('order_index', nextIndex);
                setOrderIndexWarning('');
                if (errors.order_index) setErrors(prev => ({ ...prev, order_index: '' }));
                toast.success('Auto-filled', {
                  description: `Set to next available index: ${nextIndex}`
                });
              }}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Use next available
            </button>
          </div>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              const clampedValue = Math.max(0, Math.min(9999, value));
              handleInputChange('order_index', clampedValue);
              setTouched({ ...touched, order_index: true });
              
              // Check for duplicates
              if (isOrderIndexDuplicate(clampedValue)) {
                const nextAvailable = getNextAvailableOrderIndex();
                setOrderIndexWarning(`This index is already used. Next available: ${nextAvailable}`);
              } else {
                setOrderIndexWarning('');
              }
              
              const error = validateField('order_index', clampedValue);
              setErrors(prev => ({ ...prev, order_index: error }));
            }}
            onBlur={() => {
              setTouched({ ...touched, order_index: true });
              // Show toast warning on blur if duplicate
              if (isOrderIndexDuplicate(formData.order_index)) {
                const nextAvailable = getNextAvailableOrderIndex();
                toast.warning('Duplicate Order Index', {
                  description: `Index ${formData.order_index} is already used. Consider using ${nextAvailable}.`,
                  action: {
                    label: 'Use ' + nextAvailable,
                    onClick: () => {
                      handleInputChange('order_index', nextAvailable);
                      setOrderIndexWarning('');
                    }
                  }
                });
              }
            }}
            placeholder="0"
            min="0"
            max="9999"
            className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
              touched.order_index && (errors.order_index || orderIndexWarning)
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                : touched.order_index && !errors.order_index && !orderIndexWarning && formData.order_index !== undefined
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
            }`}
          />
          {touched.order_index && errors.order_index && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.order_index}</p>
          )}
          {touched.order_index && orderIndexWarning && !errors.order_index && (
            <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
              ⚠️ {orderIndexWarning}
            </p>
          )}
          {touched.order_index && !errors.order_index && !orderIndexWarning && formData.order_index !== undefined && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Looks good!
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Lower numbers appear first (0-9999). {existingProjects.length > 0 && `${existingProjects.filter(p => p.id !== project?.id).length} projects exist.`}
          </p>
        </div>

        {/* Video Source Selection */}
        <div className="md:col-span-2">
          <Label>Video Source</Label>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="videoSource"
                value="r2"
                checked={!formData.vimeo_id || formData.video_url.includes(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'r2.dev')}
                onChange={() => {
                  handleInputChange('vimeo_id', '');
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">Upload Video to R2</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="videoSource"
                value="vimeo"
                checked={!!formData.vimeo_id}
                onChange={() => {
                  // Clear R2 video if switching to Vimeo
                  if (formData.video_url.includes('r2.dev') || formData.video_url.includes('r2.cloudflarestorage.com')) {
                    handleInputChange('video_url', '');
                  }
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">Use Vimeo</span>
            </label>
          </div>
        </div>

        {/* R2 Video Upload */}
        {(!formData.vimeo_id || formData.video_url.includes('r2.dev')) && (
          <div className="md:col-span-2">
            <Label>
              Upload Video File <span className="text-red-500">*</span>
            </Label>
            <div className={`${errors.video ? 'ring-1 ring-red-500 rounded-lg p-1' : ''}`}>
              <FileUpload
                type="video"
                folder="projects/videos"
                currentFile={formData.video_url}
                onUploadComplete={(result) => {
                  handleInputChange('video_url', result.publicUrl);
                  handleInputChange('vimeo_id', ''); // Clear Vimeo ID when using R2
                  setTouched({ ...touched, video: true });
                  if (errors.video) setErrors(prev => ({ ...prev, video: '' }));
                }}
                onUploadError={(error) => {
                  setTouched({ ...touched, video: true });
                  setErrors(prev => ({ ...prev, video: error }));
                }}
                onRemove={() => {
                  handleInputChange('video_url', '');
                  setTouched({ ...touched, video: true });
                  setErrors(prev => ({ ...prev, video: 'Video is required' }));
                }}
              />
            </div>
            {errors.video && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                ❌ {errors.video}
              </p>
            )}
            {!errors.video && formData.video_url && (
              <p className="mt-2 text-xs text-green-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Video uploaded successfully
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: MP4, WebM, MOV. Max size: 500MB. Videos will be stored in R2.
            </p>
          </div>
        )}

        {/* Vimeo Fields */}
        {formData.vimeo_id && (
          <>
            <div>
              <Label>Vimeo ID</Label>
              <input
                type="text"
                value={formData.vimeo_id}
                onChange={(e) => {
                  const value = e.target.value;
                  handleVimeoIdChange(value);
                  setTouched({ ...touched, vimeo_id: true });
                  const error = validateField('vimeo_id', value);
                  setErrors(prev => ({ ...prev, vimeo_id: error }));
                }}
                onBlur={() => setTouched({ ...touched, vimeo_id: true })}
                placeholder="e.g., 414307456"
                className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                  touched.vimeo_id && errors.vimeo_id 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                    : touched.vimeo_id && !errors.vimeo_id && formData.vimeo_id
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                    : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
                }`}
              />
              {touched.vimeo_id && errors.vimeo_id && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.vimeo_id}</p>
              )}
              {touched.vimeo_id && !errors.vimeo_id && formData.vimeo_id && (
                <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valid Vimeo ID
                </p>
              )}
            </div>

            <div>
              <Label>Video URL (Auto-generated)</Label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
                placeholder="https://player.vimeo.com/video/..."
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
          </>
        )}

        {/* Poster Image Upload */}
        <div className="md:col-span-2">
          <Label>
            Poster Image <span className="text-red-500">*</span>
          </Label>
          <div className={`${errors.poster_image ? 'ring-1 ring-red-500 rounded-lg p-1' : ''}`}>
            <FileUpload
              type="image"
              folder="projects/posters"
              currentFile={formData.poster_image}
              onUploadComplete={(result) => {
                handleInputChange('poster_image', result.publicUrl);
                // Generate responsive srcset
                const srcset = `${result.publicUrl} 300w, ${result.publicUrl} 600w, ${result.publicUrl} 900w, ${result.publicUrl} 1200w`;
                handleInputChange('poster_image_srcset', srcset);
                setTouched({ ...touched, poster_image: true });
                if (errors.poster_image) setErrors(prev => ({ ...prev, poster_image: '' }));
              }}
              onUploadError={(error) => {
                setTouched({ ...touched, poster_image: true });
                setErrors(prev => ({ ...prev, poster_image: error }));
              }}
              onRemove={() => {
                handleInputChange('poster_image', '');
                handleInputChange('poster_image_srcset', '');
                setTouched({ ...touched, poster_image: true });
                setErrors(prev => ({ ...prev, poster_image: 'Poster image is required' }));
              }}
            />
          </div>
          {errors.poster_image && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              ❌ {errors.poster_image}
            </p>
          )}
          {!errors.poster_image && formData.poster_image && (
            <p className="mt-2 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Poster image uploaded successfully
            </p>
          )}
        </div>

        {/* Manual URL Input (Alternative) */}
        <div className="md:col-span-2">
          <Label>Or enter image URL manually</Label>
          <input
            type="url"
            value={formData.poster_image}
            onChange={(e) => {
              const value = e.target.value;
              handleInputChange('poster_image', value);
              setTouched({ ...touched, poster_image: true });
              const error = validateField('poster_image', value);
              setErrors(prev => ({ ...prev, poster_image: error }));
            }}
            onBlur={() => setTouched({ ...touched, poster_image: true })}
            placeholder="https://example.com/image.jpg"
            className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
              touched.poster_image && errors.poster_image 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                : touched.poster_image && !errors.poster_image && formData.poster_image
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10'
                : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
            }`}
          />
        </div>
      </div>

      {/* Credits Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label>
            Credits <span className="text-gray-400 text-xs">(Optional)</span>
          </Label>
          <button
            type="button"
            onClick={addCredit}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Credit
          </button>
        </div>
        
        <div className="space-y-3">
          {credits.map((credit, index) => {
            const isComplete = credit.role.trim() && credit.name.trim();
            const isEmpty = !credit.role.trim() && !credit.name.trim();
            const isPartial = (credit.role.trim() && !credit.name.trim()) || (!credit.role.trim() && credit.name.trim());
            
            return (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    value={credit.role}
                    onChange={(e) => {
                      handleCreditChange(index, 'role', e.target.value);
                    }}
                    placeholder="Role (e.g., Director, Producer)"
                    className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                      isPartial && !credit.role.trim()
                        ? 'border-orange-500 focus:border-orange-500 focus:ring-orange-500/10'
                        : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={credit.name}
                    onChange={(e) => {
                      handleCreditChange(index, 'name', e.target.value);
                    }}
                    placeholder="Name"
                    className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                      isPartial && !credit.name.trim()
                        ? 'border-orange-500 focus:border-orange-500 focus:ring-orange-500/10'
                        : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                  )}
                  {credits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCredit(index)}
                      className="inline-flex items-center justify-center w-11 h-11 text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <TrashBinIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {credits.some(c => c.role.trim() && c.name.trim()) && (
          <p className="mt-3 text-xs text-green-600 dark:text-green-400">
            ✓ {credits.filter(c => c.role.trim() && c.name.trim()).length} credit(s) added
          </p>
        )}
        
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Add team members who worked on this project (optional).
        </p>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={formData.is_featured}
            onChange={(checked) => handleInputChange('is_featured', checked)}
          />
          <Label>Featured Project</Label>
        </div>
        
        <div className="flex items-center gap-3">
          <Checkbox
            checked={formData.is_published}
            onChange={(checked) => handleInputChange('is_published', checked)}
          />
          <Label>Published</Label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 sm:flex-none px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}