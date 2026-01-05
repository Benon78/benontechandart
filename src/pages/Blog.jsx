import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, MessageCircle, User } from 'lucide-react';
import Header from '@/components/Header';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (data) {
      // Get likes and comments counts
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase.from('blog_likes').select('id', { count: 'exact' }).eq('blog_post_id', post.id),
            supabase.from('blog_comments').select('id', { count: 'exact' }).eq('blog_post_id', post.id),
          ]);
          return {
            ...post,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
          };
        })
      );
      setPosts(postsWithCounts);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Blog — Benon Tech & Art" description="Latest articles, tutorials and insights from Benon Tech & Art." />
      <Header />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-2">
              <div className="h-px w-8 bg-primary" />
              <span className="mx-3 text-primary text-xs">◆</span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
                Blog
              </h1>
              <span className="mx-3 text-primary text-xs">◆</span>
              <div className="h-px w-8 bg-primary" />
            </div>
            <p className="text-muted-foreground italic">
              Insights, tutorials, and creative inspiration
            </p>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <article className="bg-card/50 rounded-lg overflow-hidden border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-48 bg-secondary/50 flex items-center justify-center">
                        <span className="text-4xl text-primary">◆</span>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                      <h2 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart size={14} />
                          {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          {post.comments_count}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
