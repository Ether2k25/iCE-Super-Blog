'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  RefreshCw, 
  Eye, 
  Palette, 
  Type, 
  Layout, 
  Globe, 
  Mail, 
  Phone,
  Plus,
  Trash2,
  Image,
  Link,
  Settings
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

export default function SiteCustomizationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [customization, setCustomization] = useState<any>(null);
  const [originalCustomization, setOriginalCustomization] = useState<any>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCustomization();
  }, []);

  // Load Google Fonts dynamically
  const loadGoogleFont = (fontName: string) => {
    if (loadedFonts.has(fontName) || fontName === 'Inter') return; // Inter is already loaded
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    setLoadedFonts(prev => new Set([...Array.from(prev), fontName]));
  };

  // Load fonts when typography settings change
  useEffect(() => {
    if (customization?.typography?.primaryFont) {
      loadGoogleFont(customization.typography.primaryFont);
    }
    if (customization?.typography?.headingFont) {
      loadGoogleFont(customization.typography.headingFont);
    }
  }, [customization?.typography?.primaryFont, customization?.typography?.headingFont]);

  const fetchCustomization = async () => {
    try {
      const response = await fetch('/api/admin/customization');
      if (response.ok) {
        const data = await response.json();
        // Deep clone to prevent reference issues
        const customizationData = JSON.parse(JSON.stringify(data.customization));
        setCustomization(customizationData);
        setOriginalCustomization(customizationData);
      }
    } catch (error) {
      console.error('Error fetching customization:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Calculate only the changes to send
      const changes = getChangedFields(originalCustomization, customization);
      
      const response = await fetch('/api/admin/customization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (response.ok) {
        const data = await response.json();
        // Update both current and original state with the saved data
        setCustomization(JSON.parse(JSON.stringify(data.customization)));
        setOriginalCustomization(JSON.parse(JSON.stringify(data.customization)));
        setMessage({ type: 'success', text: 'Site customization saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save customization' });
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      setMessage({ type: 'error', text: 'Failed to save customization' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get only changed fields
  const getChangedFields = (original: any, current: any): any => {
    if (!original || !current) return current;
    
    const changes: any = {};
    
    const compareObjects = (orig: any, curr: any, path: string[] = []): void => {
      for (const key in curr) {
        const currentPath = [...path, key];
        
        if (curr[key] && typeof curr[key] === 'object' && !Array.isArray(curr[key])) {
          // Recursively compare nested objects
          if (!orig[key] || typeof orig[key] !== 'object') {
            // If original doesn't have this nested object, include the whole thing
            setNestedValue(changes, currentPath, curr[key]);
          } else {
            compareObjects(orig[key], curr[key], currentPath);
          }
        } else {
          // Compare primitive values or arrays
          if (JSON.stringify(orig[key]) !== JSON.stringify(curr[key])) {
            setNestedValue(changes, currentPath, curr[key]);
          }
        }
      }
    };
    
    const setNestedValue = (obj: any, path: string[], value: any): void => {
      let current = obj;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
    };
    
    compareObjects(original, current);
    return changes;
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all customizations to default? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/customization', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setCustomization(data.customization);
        setMessage({ type: 'success', text: 'Site customization reset to defaults!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to reset customization' });
      }
    } catch (error) {
      console.error('Error resetting customization:', error);
      setMessage({ type: 'error', text: 'Failed to reset customization' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomization = (section: string, field: string, value: any) => {
    setCustomization((prev: any) => {
      if (!prev) return prev;
      
      // Deep clone to prevent mutations
      const newCustomization = JSON.parse(JSON.stringify(prev));
      
      // Ensure section exists
      if (!newCustomization[section]) {
        newCustomization[section] = {};
      }
      
      // Update the specific field
      newCustomization[section][field] = value;
      
      return newCustomization;
    });
  };

  const updateNestedCustomization = (section: string, subsection: string, field: string, value: any) => {
    setCustomization((prev: any) => {
      if (!prev) return prev;
      
      // Deep clone to prevent mutations
      const newCustomization = JSON.parse(JSON.stringify(prev));
      
      // Ensure section and subsection exist
      if (!newCustomization[section]) {
        newCustomization[section] = {};
      }
      if (!newCustomization[section][subsection]) {
        newCustomization[section][subsection] = {};
      }
      
      // Update the specific field
      newCustomization[section][subsection][field] = value;
      
      return newCustomization;
    });
  };

  const addArrayItem = (section: string, field: string, newItem: any) => {
    setCustomization((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section]?.[field] || []), newItem],
      },
    }));
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    setCustomization((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section]?.[field]?.filter((_: any, i: number) => i !== index) || [],
      },
    }));
  };

  const updateArrayItem = (section: string, field: string, index: number, updates: any) => {
    setCustomization((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section]?.[field]?.map((item: any, i: number) => 
          i === index ? { ...item, ...updates } : item
        ) || [],
      },
    }));
  };

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: Layout },
    { id: 'navbar', name: 'Navigation', icon: Layout },
    { id: 'footer', name: 'Footer', icon: Layout },
    { id: 'branding', name: 'Colors & Branding', icon: Palette },
    { id: 'typography', name: 'Typography', icon: Type },
    { id: 'ctaButtons', name: 'CTA Buttons', icon: Link },
    { id: 'seo', name: 'SEO & Meta', icon: Globe },
    { id: 'blog', name: 'Blog Settings', icon: Settings },
    { id: 'contact', name: 'Contact Info', icon: Mail },
  ];

  if (!customization) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ice-yellow"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ice-white">Site Customization</h1>
            <p className="text-ice-white/60">Customize every element of your ICE SUPER blog</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Reset to Defaults
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-ice-yellow/30 text-ice-white rounded-lg hover:bg-ice-yellow/10 transition-all duration-300"
            >
              <Eye size={18} />
              Preview Site
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-yellow-gradient text-ice-black font-semibold px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              <Save size={18} />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-ice-black/60 backdrop-blur-sm border border-ice-yellow/20 rounded-xl p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-ice-yellow/10 text-ice-yellow border border-ice-yellow/20'
                        : 'text-ice-white/70 hover:text-ice-white hover:bg-ice-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-ice-black/60 backdrop-blur-sm border border-ice-yellow/20 rounded-xl p-6">
              {/* Hero Section */}
              {activeTab === 'hero' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-ice-white mb-6">Hero Section</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-ice-white font-medium mb-2">Main Title</label>
                      <input
                        type="text"
                        value={customization.hero?.title || ''}
                        onChange={(e) => updateCustomization('hero', 'title', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Enter hero title"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={customization.hero?.subtitle || ''}
                        onChange={(e) => updateCustomization('hero', 'subtitle', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Enter hero subtitle"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-ice-white font-medium mb-2">Description</label>
                      <textarea
                        value={customization.hero?.description || ''}
                        onChange={(e) => updateCustomization('hero', 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Enter hero description"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">CTA Button Text</label>
                      <input
                        type="text"
                        value={customization.hero?.ctaText || ''}
                        onChange={(e) => updateCustomization('hero', 'ctaText', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Enter CTA text"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">CTA Link</label>
                      <input
                        type="text"
                        value={customization.hero?.ctaLink || ''}
                        onChange={(e) => updateCustomization('hero', 'ctaLink', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Enter CTA link"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-ice-white font-medium mb-2">Background Image URL</label>
                      <input
                        type="url"
                        value={customization.hero?.backgroundImage || ''}
                        onChange={(e) => updateCustomization('hero', 'backgroundImage', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Enter background image URL"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation */}
              {activeTab === 'navbar' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-ice-white mb-6">Navigation</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-ice-white font-medium mb-2">Logo Text</label>
                      <input
                        type="text"
                        value={customization.navbar?.logo || ''}
                        onChange={(e) => updateCustomization('navbar', 'logo', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Enter logo text"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Logo Image URL</label>
                      <input
                        type="url"
                        value={customization.navbar?.logoImage || ''}
                        onChange={(e) => updateCustomization('navbar', 'logoImage', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Enter logo image URL"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-ice-white font-medium">Menu Items</label>
                      <button
                        onClick={() => addArrayItem('navbar', 'menuItems', { name: 'New Item', href: '/' })}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-ice-yellow/10 text-ice-yellow rounded-lg hover:bg-ice-yellow/20 transition-colors duration-300 text-sm"
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {customization.navbar?.menuItems?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-ice-black/40 rounded-lg">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateArrayItem('navbar', 'menuItems', index, { name: e.target.value })}
                            className="flex-1 px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                            placeholder="Menu name"
                          />
                          <input
                            type="text"
                            value={item.href}
                            onChange={(e) => updateArrayItem('navbar', 'menuItems', index, { href: e.target.value })}
                            className="flex-1 px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                            placeholder="Menu link"
                          />
                          <button
                            onClick={() => removeArrayItem('navbar', 'menuItems', index)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Colors & Branding */}
              {activeTab === 'branding' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-ice-white mb-6">Colors & Branding</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-ice-white font-medium mb-2">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customization.branding?.primaryColor || '#FFC300'}
                          onChange={(e) => updateCustomization('branding', 'primaryColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-ice-yellow/30 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.branding?.primaryColor || '#FFC300'}
                          onChange={(e) => updateCustomization('branding', 'primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                          placeholder="#FFC300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customization.branding?.secondaryColor || '#FFD700'}
                          onChange={(e) => updateCustomization('branding', 'secondaryColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-ice-yellow/30 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.branding?.secondaryColor || '#FFD700'}
                          onChange={(e) => updateCustomization('branding', 'secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                          placeholder="#FFD700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Background Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customization.branding?.backgroundColor || '#0f0f0f'}
                          onChange={(e) => updateCustomization('branding', 'backgroundColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-ice-yellow/30 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.branding?.backgroundColor || '#0f0f0f'}
                          onChange={(e) => updateCustomization('branding', 'backgroundColor', e.target.value)}
                          className="flex-1 px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                          placeholder="#0f0f0f"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Text Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customization.branding?.textColor || '#ffffff'}
                          onChange={(e) => updateCustomization('branding', 'textColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-ice-yellow/30 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.branding?.textColor || '#ffffff'}
                          onChange={(e) => updateCustomization('branding', 'textColor', e.target.value)}
                          className="flex-1 px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customization.branding?.accentColor || '#FFC300'}
                          onChange={(e) => updateCustomization('branding', 'accentColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border border-ice-yellow/30 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customization.branding?.accentColor || '#FFC300'}
                          onChange={(e) => updateCustomization('branding', 'accentColor', e.target.value)}
                          className="flex-1 px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                          placeholder="#FFC300"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-ice-white font-medium mb-2">Custom CSS</label>
                    <textarea
                      value={customization.branding?.customCSS || ''}
                      onChange={(e) => updateCustomization('branding', 'customCSS', e.target.value)}
                      className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none font-mono text-sm"
                      rows={8}
                      placeholder="/* Enter custom CSS here */&#10;.custom-class {&#10;  /* Your styles */&#10;}"
                    />
                    <p className="text-ice-white/50 text-sm mt-2">
                      Add custom CSS to override default styles. Use with caution.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* CTA Buttons Management */}
              {activeTab === 'ctaButtons' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-ice-black/40 rounded-xl p-6 border border-ice-yellow/20">
                    <div className="flex items-center gap-3 mb-6">
                      <Link className="text-ice-yellow" size={24} />
                      <h3 className="text-xl font-semibold text-ice-white">CTA Buttons Management</h3>
                    </div>
                    <p className="text-ice-white/60 mb-8">
                      Manage all Call-to-Action buttons across your site. Update button text and destination links.
                    </p>

                    <div className="space-y-6">
                      {/* Hero Section CTA */}
                      <div className="bg-ice-black/60 rounded-lg p-6 border border-ice-yellow/10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 bg-ice-yellow rounded-full"></div>
                          <h4 className="text-lg font-semibold text-ice-white">Hero Section CTA</h4>
                          <span className="text-xs bg-ice-yellow/20 text-ice-yellow px-2 py-1 rounded">Main Hero</span>
                        </div>
                        <p className="text-ice-white/50 text-sm mb-4">The primary call-to-action button in your hero section</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-ice-white mb-2">Button Text</label>
                            <input
                              type="text"
                              value={customization.hero?.ctaText || ''}
                              onChange={(e) => updateCustomization('hero', 'ctaText', e.target.value)}
                              className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                              placeholder="e.g., Explore Latest Insights"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-ice-white mb-2">Destination Link</label>
                            <input
                              type="text"
                              value={customization.hero?.ctaLink || ''}
                              onChange={(e) => updateCustomization('hero', 'ctaLink', e.target.value)}
                              className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                              placeholder="e.g., #featured or /contact"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CTA Banner */}
                      <div className="bg-ice-black/60 rounded-lg p-6 border border-ice-yellow/10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <h4 className="text-lg font-semibold text-ice-white">CTA Banner Button</h4>
                          <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">Bottom Section</span>
                        </div>
                        <p className="text-ice-white/50 text-sm mb-4">The main call-to-action button in your bottom banner section</p>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-ice-white mb-2">Banner Title</label>
                            <input
                              type="text"
                              value={customization.ctaBanner?.title || ''}
                              onChange={(e) => updateCustomization('ctaBanner', 'title', e.target.value)}
                              className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                              placeholder="e.g., Want to partner with ICE SUPER?"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-ice-white mb-2">Banner Description</label>
                            <textarea
                              value={customization.ctaBanner?.description || ''}
                              onChange={(e) => updateCustomization('ctaBanner', 'description', e.target.value)}
                              className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none"
                              rows={3}
                              placeholder="e.g., Join the leading B2B iGaming platform..."
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-ice-white mb-2">Button Text</label>
                              <input
                                type="text"
                                value={customization.ctaBanner?.buttonText || ''}
                                onChange={(e) => updateCustomization('ctaBanner', 'buttonText', e.target.value)}
                                className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                                placeholder="e.g., Let's Talk"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-ice-white mb-2">Destination Link</label>
                              <input
                                type="text"
                                value={customization.ctaBanner?.buttonLink || ''}
                                onChange={(e) => updateCustomization('ctaBanner', 'buttonLink', e.target.value)}
                                className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                                placeholder="e.g., /contact or https://..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Menu Items */}
                      <div className="bg-ice-black/60 rounded-lg p-6 border border-ice-yellow/10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                          <h4 className="text-lg font-semibold text-ice-white">Navigation Menu Items</h4>
                          <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded">Header Navigation</span>
                        </div>
                        <p className="text-ice-white/50 text-sm mb-4">Manage your main navigation menu items and their destinations</p>
                        
                        <div className="space-y-3">
                          {(customization.navbar?.menuItems || []).map((item: any, index: number) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-ice-black/40 rounded-lg border border-ice-yellow/5">
                              <div>
                                <label className="block text-sm font-medium text-ice-white/70 mb-1">Menu Item {index + 1} - Text</label>
                                <input
                                  type="text"
                                  value={item.name || ''}
                                  onChange={(e) => {
                                    const newItems = [...(customization.navbar?.menuItems || [])];
                                    newItems[index] = { ...newItems[index], name: e.target.value };
                                    updateCustomization('navbar', 'menuItems', newItems);
                                  }}
                                  className="w-full px-3 py-2 bg-ice-black/60 border border-ice-yellow/20 rounded text-ice-white text-sm focus:outline-none focus:ring-1 focus:ring-ice-yellow"
                                  placeholder="e.g., Home, About, Contact"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-ice-white/70 mb-1">Menu Item {index + 1} - Link</label>
                                <input
                                  type="text"
                                  value={item.href || ''}
                                  onChange={(e) => {
                                    const newItems = [...(customization.navbar?.menuItems || [])];
                                    newItems[index] = { ...newItems[index], href: e.target.value };
                                    updateCustomization('navbar', 'menuItems', newItems);
                                  }}
                                  className="w-full px-3 py-2 bg-ice-black/60 border border-ice-yellow/20 rounded text-ice-white text-sm focus:outline-none focus:ring-1 focus:ring-ice-yellow"
                                  placeholder="e.g., /, /about, /contact"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Blog Post Read More Buttons */}
                      <div className="bg-ice-black/60 rounded-lg p-6 border border-ice-yellow/10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                          <h4 className="text-lg font-semibold text-ice-white">Blog Post "Read More" Buttons</h4>
                          <span className="text-xs bg-purple-400/20 text-purple-400 px-2 py-1 rounded">Blog Cards</span>
                        </div>
                        <p className="text-ice-white/50 text-sm mb-4">Customize the text for "Read More" buttons on blog post cards</p>
                        
                        <div className="bg-ice-black/40 rounded-lg p-4 border border-ice-yellow/5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-ice-white font-medium">Read More Button Text</p>
                              <p className="text-ice-white/50 text-sm">Currently: "Read More →" (Links automatically to individual blog posts)</p>
                            </div>
                            <div className="text-ice-white/40 text-sm">
                              <span className="bg-ice-yellow/10 text-ice-yellow px-2 py-1 rounded text-xs">Auto-Generated Links</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Preview */}
                      <div className="bg-gradient-to-r from-ice-yellow/10 to-ice-gold/10 rounded-lg p-6 border border-ice-yellow/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="text-ice-yellow" size={20} />
                          <h4 className="text-lg font-semibold text-ice-white">Quick Preview</h4>
                        </div>
                        <p className="text-ice-white/70 text-sm mb-4">See how your CTA buttons will appear on the site</p>
                        <div className="flex flex-wrap gap-3">
                          <button 
                            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                            style={{ 
                              backgroundColor: customization.branding?.primaryColor || '#FFC300',
                              color: customization.branding?.backgroundColor || '#0f0f0f'
                            }}
                          >
                            {customization.hero?.ctaText || 'Hero CTA'}
                          </button>
                          <button 
                            className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                            style={{ 
                              backgroundColor: customization.branding?.primaryColor || '#FFC300',
                              color: customization.branding?.backgroundColor || '#0f0f0f'
                            }}
                          >
                            {customization.ctaBanner?.buttonText || 'Banner CTA'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Footer Section */}
              {activeTab === 'footer' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-ice-white mb-6">Footer Customization</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-ice-white font-medium mb-2">Footer Description</label>
                      <textarea
                        value={customization?.footer?.description || ''}
                        onChange={(e) => updateCustomization('footer', 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none"
                        placeholder="Your company description or tagline for the footer"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Copyright Text</label>
                      <input
                        type="text"
                        value={customization?.footer?.copyright || ''}
                        onChange={(e) => updateCustomization('footer', 'copyright', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="© 2024 ICE SUPER. All rights reserved."
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={customization?.footer?.email || ''}
                        onChange={(e) => updateCustomization('footer', 'email', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="contact@icesuper.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-ice-white mb-4">Social Media Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['twitter', 'linkedin', 'facebook', 'instagram', 'youtube', 'telegram'].map((platform) => (
                          <div key={platform}>
                            <label className="block text-ice-white/70 font-medium mb-1 capitalize">{platform}</label>
                            <input
                              type="text"
                              value={customization?.footer?.socialLinks?.[platform] || ''}
                              onChange={(e) => updateNestedCustomization('footer', 'socialLinks', platform, e.target.value)}
                              className="w-full px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-1 focus:ring-ice-yellow"
                              placeholder={`https://${platform}.com/icesuper`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Typography Section */}
              {activeTab === 'typography' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-ice-white mb-6">Typography Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-ice-white font-medium mb-2">Primary Font Family</label>
                      <select
                        value={customization?.typography?.primaryFont || 'Inter'}
                        onChange={(e) => {
                          const newFont = e.target.value;
                          updateCustomization('typography', 'primaryFont', newFont);
                          loadGoogleFont(newFont);
                        }}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Heading Font Family</label>
                      <select
                        value={customization?.typography?.headingFont || 'Inter'}
                        onChange={(e) => {
                          const newFont = e.target.value;
                          updateCustomization('typography', 'headingFont', newFont);
                          loadGoogleFont(newFont);
                        }}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Base Font Size</label>
                      <select
                        value={customization?.typography?.baseFontSize || '16px'}
                        onChange={(e) => updateCustomization('typography', 'baseFontSize', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                      >
                        <option value="14px">14px</option>
                        <option value="16px">16px (Default)</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Line Height</label>
                      <select
                        value={customization?.typography?.lineHeight || '1.6'}
                        onChange={(e) => updateCustomization('typography', 'lineHeight', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                      >
                        <option value="1.4">1.4 (Tight)</option>
                        <option value="1.6">1.6 (Normal)</option>
                        <option value="1.8">1.8 (Relaxed)</option>
                        <option value="2.0">2.0 (Loose)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-ice-black/40 rounded-lg p-6 border border-ice-yellow/10">
                    <h3 className="text-lg font-semibold text-ice-white mb-4">Typography Preview</h3>
                    <div className="space-y-4">
                      <h1 
                        className="text-3xl font-bold text-ice-white transition-all duration-500" 
                        style={{ 
                          fontFamily: `"${customization?.typography?.headingFont || 'Inter'}", sans-serif`,
                          fontSize: `calc(${customization?.typography?.baseFontSize || '16px'} * 2)`,
                          lineHeight: customization?.typography?.lineHeight || '1.6',
                          fontWeight: '700'
                        }}
                      >
                        Sample Heading ({customization?.typography?.headingFont || 'Inter'})
                      </h1>
                      <p 
                        className="text-ice-white/80 transition-all duration-500" 
                        style={{
                          fontFamily: `"${customization?.typography?.primaryFont || 'Inter'}", sans-serif`,
                          fontSize: customization?.typography?.baseFontSize || '16px',
                          lineHeight: customization?.typography?.lineHeight || '1.6',
                          fontWeight: '400'
                        }}
                      >
                        This is how your body text will appear on the website using <strong>{customization?.typography?.primaryFont || 'Inter'}</strong> font. 
                        You can see how the selected fonts and spacing affect readability. The font size is {customization?.typography?.baseFontSize || '16px'} 
                        with {customization?.typography?.lineHeight || '1.6'} line height.
                      </p>
                      <div 
                        className="text-ice-white/60 text-sm transition-all duration-500" 
                        style={{
                          fontFamily: `"${customization?.typography?.primaryFont || 'Inter'}", sans-serif`,
                          fontSize: `calc(${customization?.typography?.baseFontSize || '16px'} * 0.875)`,
                          lineHeight: customization?.typography?.lineHeight || '1.6',
                          fontWeight: '300'
                        }}
                      >
                        This is smaller text that might be used for captions, metadata, or secondary information.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SEO & Meta Section */}
              {activeTab === 'seo' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-ice-white mb-6">SEO & Meta Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-ice-white font-medium mb-2">Site Title</label>
                      <input
                        type="text"
                        value={customization?.seo?.title || ''}
                        onChange={(e) => updateCustomization('seo', 'title', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="ICE SUPER - Casino Tech & iGaming Blog"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Meta Description</label>
                      <textarea
                        value={customization?.seo?.description || ''}
                        onChange={(e) => updateCustomization('seo', 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none"
                        placeholder="Your site description for search engines (150-160 characters recommended)"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Keywords</label>
                      <input
                        type="text"
                        value={customization?.seo?.keywords || ''}
                        onChange={(e) => updateCustomization('seo', 'keywords', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="casino, iGaming, affiliate marketing, tech (comma-separated)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-ice-white font-medium mb-2">Open Graph Image URL</label>
                        <input
                          type="text"
                          value={customization?.seo?.ogImage || ''}
                          onChange={(e) => updateCustomization('seo', 'ogImage', e.target.value)}
                          className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                          placeholder="https://your-site.com/og-image.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-ice-white font-medium mb-2">Twitter Handle</label>
                        <input
                          type="text"
                          value={customization?.seo?.twitterHandle || ''}
                          onChange={(e) => updateCustomization('seo', 'twitterHandle', e.target.value)}
                          className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                          placeholder="@icesuper"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Google Analytics ID</label>
                      <input
                        type="text"
                        value={customization?.seo?.googleAnalyticsId || ''}
                        onChange={(e) => updateCustomization('seo', 'googleAnalyticsId', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Google Search Console Verification</label>
                      <input
                        type="text"
                        value={customization?.seo?.googleSiteVerification || ''}
                        onChange={(e) => updateCustomization('seo', 'googleSiteVerification', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Verification meta tag content"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Blog Settings Section */}
              {activeTab === 'blog' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-ice-white mb-6">Blog Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-ice-white font-medium mb-2">Posts Per Page</label>
                      <select
                        value={customization?.blog?.postsPerPage || '6'}
                        onChange={(e) => updateCustomization('blog', 'postsPerPage', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                      >
                        <option value="3">3 posts</option>
                        <option value="6">6 posts</option>
                        <option value="9">9 posts</option>
                        <option value="12">12 posts</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Excerpt Length</label>
                      <select
                        value={customization?.blog?.excerptLength || '150'}
                        onChange={(e) => updateCustomization('blog', 'excerptLength', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                      >
                        <option value="100">100 characters</option>
                        <option value="150">150 characters</option>
                        <option value="200">200 characters</option>
                        <option value="250">250 characters</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Date Format</label>
                      <select
                        value={customization?.blog?.dateFormat || 'MMM DD, YYYY'}
                        onChange={(e) => updateCustomization('blog', 'dateFormat', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                      >
                        <option value="MMM DD, YYYY">Jan 15, 2024</option>
                        <option value="DD/MM/YYYY">15/01/2024</option>
                        <option value="MM/DD/YYYY">01/15/2024</option>
                        <option value="YYYY-MM-DD">2024-01-15</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Read More Text</label>
                      <input
                        type="text"
                        value={customization?.blog?.readMoreText || 'Read More →'}
                        onChange={(e) => updateCustomization('blog', 'readMoreText', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Read More →"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={customization?.blog?.showAuthor || false}
                          onChange={(e) => updateCustomization('blog', 'showAuthor', e.target.checked)}
                          className="w-4 h-4 text-ice-yellow bg-ice-black/60 border-ice-yellow/30 rounded focus:ring-ice-yellow focus:ring-2"
                        />
                        <span className="text-ice-white font-medium">Show Author Information</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={customization?.blog?.showReadTime || false}
                          onChange={(e) => updateCustomization('blog', 'showReadTime', e.target.checked)}
                          className="w-4 h-4 text-ice-yellow bg-ice-black/60 border-ice-yellow/30 rounded focus:ring-ice-yellow focus:ring-2"
                        />
                        <span className="text-ice-white font-medium">Show Estimated Read Time</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={customization?.blog?.enableComments || false}
                          onChange={(e) => updateCustomization('blog', 'enableComments', e.target.checked)}
                          className="w-4 h-4 text-ice-yellow bg-ice-black/60 border-ice-yellow/30 rounded focus:ring-ice-yellow focus:ring-2"
                        />
                        <span className="text-ice-white font-medium">Enable Comments (Future Feature)</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Contact Info Section */}
              {activeTab === 'contact' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-ice-white mb-6">Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-ice-white font-medium mb-2">Company Name</label>
                      <input
                        type="text"
                        value={customization?.contact?.companyName || ''}
                        onChange={(e) => updateCustomization('contact', 'companyName', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="ICE SUPER"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={customization?.contact?.email || ''}
                        onChange={(e) => updateCustomization('contact', 'email', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="contact@icesuper.com"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={customization?.contact?.phone || ''}
                        onChange={(e) => updateCustomization('contact', 'phone', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-ice-white font-medium mb-2">Business Hours</label>
                      <input
                        type="text"
                        value={customization?.contact?.businessHours || ''}
                        onChange={(e) => updateCustomization('contact', 'businessHours', e.target.value)}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                        placeholder="Mon-Fri 9AM-6PM UTC"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-ice-white font-medium mb-2">Address</label>
                      <textarea
                        value={customization?.contact?.address || ''}
                        onChange={(e) => updateCustomization('contact', 'address', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none"
                        placeholder="123 Business Street, Suite 100, City, Country"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-ice-white font-medium mb-2">About/Bio</label>
                      <textarea
                        value={customization?.contact?.about || ''}
                        onChange={(e) => updateCustomization('contact', 'about', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none"
                        placeholder="Brief description about your company or yourself..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
