import { Client } from '@notionhq/client';
import { BlogPost, NotionPage } from '@/types/blog';

// Initialize Notion client (server-side only)
const notion = typeof window === 'undefined' ? new Client({
  auth: process.env.NOTION_TOKEN,
}) : null;

// Database ID from environment variable
const DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    if (!notion) {
      console.log('Notion client not available, using mock data');
      return mockBlogPosts;
    }
    
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts = response.results.map((page: any) => transformNotionPageToBlogPost(page));
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    if (!notion) {
      console.log('Notion client not available, using mock data');
      const mockPost = mockBlogPosts.find(post => post.slug === slug);
      return mockPost || null;
    }
    
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Slug',
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    const page = response.results[0];
    const blogPost = transformNotionPageToBlogPost(page);

    // Note: Full page content would be fetched here with proper Notion API setup
    // For now, we'll use the excerpt as content
    blogPost.content = '';

    return blogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function getFeaturedPost(): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.length > 0 ? posts[0] : null;
}

export async function getAllTags(): Promise<string[]> {
  try {
    if (!notion) {
      console.log('Notion client not available, using mock tags');
      return ['Tech', 'Casino Trends', 'Marketing', 'Regulation', 'Affiliate Tips'];
    }
    
    const response = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });

    const tagsProperty = (response as any).properties.Tags;
    if (tagsProperty && tagsProperty.multi_select) {
      return tagsProperty.multi_select.options.map((option: any) => option.name);
    }

    return [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

function transformNotionPageToBlogPost(page: any): BlogPost {
  const properties = page.properties;
  const now = new Date().toISOString();

  return {
    id: page.id,
    slug: properties.Slug?.rich_text?.[0]?.plain_text || '',
    title: properties.Name?.title?.[0]?.plain_text || '',
    published: properties.Published?.checkbox || false,
    date: properties.Date?.date?.start || now,
    tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || '',
    featuredImage: getCoverImageUrl(properties['Cover Image']),
    content: '', // Will be set by the calling function
    author: {
      name: 'Admin',
      avatar: '/images/default-avatar.png'
    },
    views: 0,
    likes: 0,
    comments: [],
    seo: {
      title: properties.Name?.title?.[0]?.plain_text || '',
      description: properties.Excerpt?.rich_text?.[0]?.plain_text || '',
      keywords: properties.Tags?.multi_select?.map((tag: any) => tag.name).join(', ') || '',
      ogImage: getCoverImageUrl(properties['Cover Image'])
    },
    createdAt: now,
    updatedAt: now
  };
}

function getCoverImageUrl(coverImageProperty: any): string | undefined {
  if (!coverImageProperty?.files?.[0]) return undefined;

  const file = coverImageProperty.files[0];
  return file.file?.url || file.external?.url;
}

// Helper function to create mock blog posts with all required properties
const createMockPost = (post: Omit<BlogPost, 'content' | 'author' | 'views' | 'likes' | 'comments' | 'seo' | 'createdAt' | 'updatedAt'>): BlogPost => {
  const now = new Date().toISOString();
  const tags = post.tags || [];
  
  return {
    ...post,
    content: `<p>This is a mock content for ${post.title}. In a real implementation, this would be the full blog post content.</p>`,
    author: {
      name: 'Admin',
      avatar: '/images/default-avatar.png'
    },
    views: Math.floor(Math.random() * 1000),
    likes: Math.floor(Math.random() * 100),
    comments: [],
    seo: {
      title: post.title,
      description: post.excerpt,
      keywords: tags.join(', '),
      ogImage: post.featuredImage
    },
    createdAt: now,
    updatedAt: now
  };
};

// Mock data for development (when Notion API is not available)
export const mockBlogPosts: BlogPost[] = [
  createMockPost({
    id: '1',
    slug: 'future-of-igaming-technology',
    title: 'The Future of iGaming Technology: AI and Blockchain Integration',
    published: true,
    date: '2024-01-15',
    tags: ['Tech', 'Casino Trends', 'AI'],
    excerpt: 'Explore how artificial intelligence and blockchain technology are revolutionizing the iGaming industry, creating more secure and personalized gaming experiences.',
    featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
  }),
  createMockPost({
    id: '2',
    slug: 'affiliate-marketing-strategies-2024',
    title: 'Top Affiliate Marketing Strategies for iGaming in 2024',
    published: true,
    date: '2024-01-10',
    tags: ['Marketing', 'Affiliate Tips'],
    excerpt: 'Discover the most effective affiliate marketing strategies that are driving growth in the iGaming sector this year.',
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
  }),
  createMockPost({
    id: '3',
    slug: 'regulatory-compliance-guide',
    title: 'Navigating Regulatory Compliance in Global iGaming Markets',
    published: true,
    date: '2024-01-05',
    tags: ['Regulation', 'Casino Trends'],
    excerpt: 'A comprehensive guide to understanding and implementing regulatory compliance across different international iGaming markets.',
    featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
  }),
];
