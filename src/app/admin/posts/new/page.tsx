'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, Eye, ArrowLeft, Image, Tag, Calendar } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { BlogPost } from '@/types/blog';

export default function NewPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: [] as string[],
    published: false,
    featuredImage: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [tagInput, setTagInput] = useState('');

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          published: publish,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/admin/posts');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-ice-white hover:text-ice-yellow transition-colors duration-300"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-ice-white">Create New Post</h1>
              <p className="text-ice-white/60">Write and publish your blog content</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => handleSubmit(e, false)}
              disabled={isLoading || !formData.title.trim()}
              className="px-4 py-2 border border-ice-yellow/30 text-ice-white rounded-lg hover:bg-ice-yellow/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </button>
            <button
              onClick={(e) => handleSubmit(e, true)}
              disabled={isLoading || !formData.title.trim() || !formData.excerpt.trim()}
              className="inline-flex items-center gap-2 bg-yellow-gradient text-ice-black font-semibold px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye size={18} />
              Publish
            </button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Main Content */}
          <div className="bg-ice-black/60 backdrop-blur-sm border border-ice-yellow/20 rounded-xl p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-ice-white font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-xl font-semibold"
                placeholder="Enter post title..."
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-ice-white font-medium mb-2">
                URL Slug
              </label>
              <div className="flex items-center">
                <span className="text-ice-white/60 text-sm mr-2">/blog/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent"
                  placeholder="post-url-slug"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-ice-white font-medium mb-2">
                Excerpt *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none"
                rows={3}
                placeholder="Brief description of your post..."
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-ice-white font-medium mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent resize-none"
                rows={12}
                placeholder="Write your blog post content here..."
              />
              <p className="text-ice-white/50 text-sm mt-2">
                You can use Markdown formatting for rich text content.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tags */}
            <div className="bg-ice-black/60 backdrop-blur-sm border border-ice-yellow/20 rounded-xl p-6">
              <h3 className="flex items-center gap-2 text-ice-white font-medium mb-4">
                <Tag size={18} />
                Tags
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                    placeholder="Add tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-ice-yellow/10 text-ice-yellow rounded-lg hover:bg-ice-yellow/20 transition-colors duration-300 text-sm"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-ice-yellow/10 text-ice-yellow px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-ice-yellow/60 hover:text-ice-yellow ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-ice-black/60 backdrop-blur-sm border border-ice-yellow/20 rounded-xl p-6">
              <h3 className="flex items-center gap-2 text-ice-white font-medium mb-4">
                <Image size={18} />
                Cover Image
              </h3>
              
              <div className="space-y-3">
                <input
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  className="w-full px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white placeholder-ice-white/50 focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
                  placeholder="Image URL..."
                />
                
                {formData.featuredImage && (
                  <div className="relative">
                    <img
                      src={formData.featuredImage}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Publish Date */}
            <div className="bg-ice-black/60 backdrop-blur-sm border border-ice-yellow/20 rounded-xl p-6">
              <h3 className="flex items-center gap-2 text-ice-white font-medium mb-4">
                <Calendar size={18} />
                Publish Date
              </h3>
              
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-ice-black/60 border border-ice-yellow/30 rounded-lg text-ice-white focus:outline-none focus:ring-2 focus:ring-ice-yellow focus:border-transparent text-sm"
              />
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
