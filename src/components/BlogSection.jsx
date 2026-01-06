import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { supabase } from '@/integrations/supabase/client';

const BlogSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) {
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
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading || posts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8" ref={ref}>
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center mb-2">
            <div className="h-px w-8 bg-primary" />
            <span className="mx-3 text-primary text-xs">◆</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">
              Latest from Blog
            </h2>
            <span className="mx-3 text-primary text-xs">◆</span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <p className="text-muted-foreground italic">Insights & Inspiration</p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className={`group transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150 + 200}ms` }}
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
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
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

        {/* View All Link */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-3 bg-secondary border border-primary/50 text-foreground rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            View All Posts
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
