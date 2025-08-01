'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { Calendar, Tag } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  index: number;
  customization?: any;
}

const BlogCard = ({ post, index, customization }: BlogCardProps) => {
  // Extract colors from customization
  const primaryColor = customization?.branding?.primaryColor || '#FFC300';
  const accentColor = customization?.branding?.accentColor || '#FFC300';
  const textColor = customization?.branding?.textColor || '#ffffff';
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-ice-black/60 backdrop-blur-sm border border-ice-yellow/20 rounded-xl overflow-hidden card-hover group"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ice-yellow/20 to-ice-gold/20 flex items-center justify-center">
            <div className="text-ice-yellow text-4xl font-bold opacity-50">
              ICE
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-ice-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-ice-yellow text-xs bg-ice-yellow/10 px-2 py-1 rounded-full"
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-ice-white mb-3 line-clamp-2 group-hover:text-ice-yellow transition-colors duration-300">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-ice-white/80 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Date */}
          <div className="flex items-center gap-2 text-ice-white/60 text-xs">
            <Calendar size={14} />
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>

          {/* Read More CTA */}
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-semibold transition-colors duration-300 group-hover:underline hover:opacity-80"
            style={{ color: primaryColor }}
          >
            Read More →
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
