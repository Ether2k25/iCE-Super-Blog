import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/admin-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const allPosts = await getAllBlogPosts();
    
    // Find the post by slug and ensure it's published
    const post = allPosts.find(p => p.slug === slug && p.published);
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
