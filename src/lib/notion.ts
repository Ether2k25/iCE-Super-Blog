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
    blogPost.content = null;

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

  return {
    id: page.id,
    slug: properties.Slug?.rich_text?.[0]?.plain_text || '',
    title: properties.Name?.title?.[0]?.plain_text || '',
    published: properties.Published?.checkbox || false,
    date: properties.Date?.date?.start || '',
    tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
    excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || '',
    featuredImage: getCoverImageUrl(properties['Cover Image']),
  };
}

function getCoverImageUrl(coverImageProperty: any): string | undefined {
  if (!coverImageProperty?.files?.[0]) return undefined;

  const file = coverImageProperty.files[0];
  return file.file?.url || file.external?.url;
}

// Mock data for development (when Notion API is not available)
export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'future-of-igaming-technology',
    title: 'The Future of iGaming Technology: AI and Blockchain Integration',
    published: true,
    date: '2024-01-15',
    tags: ['Tech', 'Casino Trends', 'AI'],
    excerpt: 'Explore how artificial intelligence and blockchain technology are revolutionizing the iGaming industry, creating more secure and personalized gaming experiences.',
    featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    slug: 'affiliate-marketing-strategies-2024',
    title: 'Top Affiliate Marketing Strategies for iGaming in 2024',
    published: true,
    date: '2024-01-10',
    tags: ['Marketing', 'Affiliate Tips'],
    excerpt: 'Discover the most effective affiliate marketing strategies that are driving growth in the iGaming sector this year.',
    featuredImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
  },
  {
    id: '3',
    slug: 'regulatory-compliance-guide',
    title: 'Navigating Regulatory Compliance in Global iGaming Markets',
    published: true,
    date: '2024-01-05',
    tags: ['Regulation', 'Casino Trends'],
    excerpt: 'A comprehensive guide to understanding and implementing regulatory compliance across different international iGaming markets.',
    featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
  },
];
