'use client';

import { motion } from 'framer-motion';
import { BlogPost } from '@/types/blog';
import CTABanner from './CTABanner';

// Custom styles for Notion content
const notionStyles = {
  '--notion-font': 'inherit',
  '--notion-max-width': '100%',
  '--notion-header-height': '0px',
} as React.CSSProperties;

interface BlogPostContentProps {
  post: BlogPost;
}

const BlogPostContent = ({ post }: BlogPostContentProps) => {
  // Check if we have valid content
  const hasValidNotionContent = post.content && 
    typeof post.content === 'string' && 
    post.content.length > 0;

  return (
    <article className="py-16 bg-ice-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="prose prose-lg prose-invert max-w-none"
          style={notionStyles}
        >
          {hasValidNotionContent ? (
            <div className="content-wrapper">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          ) : (
            // Fallback content when Notion content is not available
            <div className="text-ice-white space-y-8">
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-lg leading-relaxed mb-8">
                  {post.excerpt}
                </p>
                
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-ice-yellow mb-4">About This Article</h2>
                  <p className="text-base leading-relaxed">
                    This article explores key insights and trends in the iGaming industry. 
                    Our team of experts has compiled the most relevant information to help 
                    you stay ahead in this rapidly evolving landscape.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-ice-yellow mb-3">Key Takeaways</h3>
                  <ul className="list-disc list-inside space-y-2 text-base">
                    <li>Industry trends and technological innovations</li>
                    <li>Strategic insights for business growth</li>
                    <li>Best practices and proven methodologies</li>
                    <li>Future outlook and market predictions</li>
                  </ul>
                  
                  <div className="bg-gradient-to-r from-ice-yellow/10 to-ice-blue/10 border border-ice-yellow/20 rounded-lg p-6 mt-8">
                    <h3 className="text-ice-yellow text-xl font-semibold mb-3">
                      Expert Analysis
                    </h3>
                    <p className="text-ice-white/80 mb-4">
                      Our industry experts have analyzed the latest trends and developments 
                      to bring you actionable insights that can drive your business forward.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-ice-yellow rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-ice-white/90">
                          Market analysis and competitive intelligence
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-ice-blue rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-ice-white/90">
                          Technology roadmaps and implementation strategies
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-ice-yellow rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-ice-white/90">
                          Regulatory compliance and best practices
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-ice-yellow">
                      Key Highlights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-ice-black/40 border border-ice-yellow/20 rounded-lg p-4">
                        <h4 className="text-ice-yellow font-semibold mb-2">Industry Insights</h4>
                        <p className="text-ice-white/80 text-sm">Expert analysis and market intelligence</p>
                      </div>
                      <div className="bg-ice-black/40 border border-ice-blue/20 rounded-lg p-4">
                        <h4 className="text-ice-blue font-semibold mb-2">Technology Trends</h4>
                        <p className="text-ice-white/80 text-sm">Latest innovations in iGaming technology</p>
                      </div>
                      <div className="bg-ice-black/40 border border-ice-yellow/20 rounded-lg p-4">
                        <h4 className="text-ice-yellow font-semibold mb-2">Growth Strategies</h4>
                        <p className="text-ice-white/80 text-sm">Actionable strategies for business growth</p>
                      </div>
                      <div className="bg-ice-black/40 border border-ice-blue/20 rounded-lg p-4">
                        <h4 className="text-ice-blue font-semibold mb-2">Best Practices</h4>
                        <p className="text-ice-white/80 text-sm">Regulatory compliance and industry standards</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Related Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 pt-16 border-t border-ice-yellow/20"
        >
          <h3 className="text-2xl font-bold text-ice-white mb-8 text-center">
            Continue Reading
          </h3>
          <div className="text-center">
            <a
              href="/blog"
              className="cta-button inline-block"
            >
              View All Posts
            </a>
          </div>
        </motion.div>
      </div>

      {/* CTA Banner */}
      <div className="mt-20">
        <CTABanner />
      </div>

      <style jsx global>{`
        .notion-content {
          color: #ffffff;
        }
        
        .notion-content .notion-page {
          background: transparent;
          color: #ffffff;
        }
        
        .notion-content .notion-text {
          color: #ffffff;
        }
        
        .notion-content .notion-h1,
        .notion-content .notion-h2,
        .notion-content .notion-h3 {
          color: #FFD700;
        }
        
        .notion-content .notion-link {
          color: #00BFFF;
        }
        
        .notion-content .notion-quote {
          border-left: 4px solid #FFD700;
          background: rgba(255, 215, 0, 0.1);
        }
        
        .notion-content .notion-code {
          background: rgba(255, 255, 255, 0.1);
          color: #FFD700;
        }
        
        .notion-content .notion-callout {
          background: rgba(0, 191, 255, 0.1);
          border: 1px solid rgba(0, 191, 255, 0.3);
          color: #ffffff;
        }
        
        .notion-content .notion-table {
          border-color: rgba(255, 195, 0, 0.3);
        }
        
        .notion-content .notion-table th {
          background-color: rgba(255, 195, 0, 0.1);
          color: #FFC300;
        }
        
        .notion-content .notion-table td {
          border-color: rgba(255, 195, 0, 0.2);
          color: #ffffff;
        }
      `}</style>
    </article>
  );
};

export default BlogPostContent;
