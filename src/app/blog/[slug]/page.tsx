import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { NotionRenderer } from 'react-notion-x';
// Removed Notion imports - now using unified admin data source
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogPostHeader from '@/components/BlogPostHeader';
import BlogPostContent from '@/components/BlogPostContent';

// Import react-notion-x styles
import 'react-notion-x/src/styles.css';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/api/posts`);
    const data = await response.json();
    const posts = data.posts || [];
    return posts.map((post: any) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/api/posts/${params.slug}`);
    const data = await response.json();
    const post = data.post;

    if (!post) {
      return {
        title: 'Post Not Found - ICE SUPER Blog',
      };
    }

    return {
      title: `${post.title} - ICE SUPER Blog`,
      description: post.excerpt,
      keywords: post.tags.join(', '),
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : [],
        type: 'article',
        publishedTime: post.date,
        tags: post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Post Not Found - ICE SUPER Blog',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/api/posts/${params.slug}`);
    const data = await response.json();
    const post = data.post;

    if (!post) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-ice-black">
        <Navbar />
        <main>
        <BlogPostHeader post={post} />
        <BlogPostContent post={post} />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}
