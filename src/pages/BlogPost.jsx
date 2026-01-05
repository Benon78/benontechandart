import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Heart, MessageCircle, Star, ArrowLeft, Send } from 'lucide-react';
import Header from '@/components/Header';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';
import { sanitizeHtml } from '@/lib/utils';
import { markdownToHtml, looksLikeMarkdown } from '@/lib/markdown';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post && user) {
      checkIfLiked();
    }
  }, [post, user]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (data) {
      setPost(data);
      fetchComments(data.id);
      fetchLikesCount(data.id);
    } else {
      navigate('/blog');
    }
    setLoading(false);
  };

  const fetchComments = async (postId) => {
    const { data } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('blog_post_id', postId)
      .order('created_at', { ascending: false });

    if (data) {
      const commentsWithEmails = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', comment.user_id)
            .maybeSingle();
          return {
            ...comment,
            user_email: profile?.email || 'Anonymous',
          };
        })
      );
      setComments(commentsWithEmails);
    }
  };

  const fetchLikesCount = async (postId) => {
    const { count } = await supabase
      .from('blog_likes')
      .select('id', { count: 'exact' })
      .eq('blog_post_id', postId);
    setLikesCount(count || 0);
  };

  const checkIfLiked = async () => {
    if (!post || !user) return;
    const { data } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('blog_post_id', post.id)
      .eq('user_id', user.id)
      .maybeSingle();
    setHasLiked(!!data);
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like this post.',
        variant: 'destructive',
      });
      return;
    }

    if (!post) return;

    if (hasLiked) {
      await supabase
        .from('blog_likes')
        .delete()
        .eq('blog_post_id', post.id)
        .eq('user_id', user.id);
      setHasLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase.from('blog_likes').insert({
        blog_post_id: post.id,
        user_id: user.id,
      });
      setHasLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to comment.',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim() || !post) return;

    setSubmitting(true);
    const { error } = await supabase.from('blog_comments').insert({
      blog_post_id: post.id,
      user_id: user.id,
      content: newComment.trim(),
      rating: newRating,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit comment. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Comment posted!',
        description: 'Your comment has been added.',
      });
      setNewComment('');
      setNewRating(5);
      fetchComments(post.id);
    }
    setSubmitting(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format post content: support Markdown and HTML. Convert markdown to HTML then sanitize.
  // If content is plain text, escape and convert newlines to paragraphs.
  const formatContent = (content) => {
    if (!content) return '';
    // Normalize newlines
    const original = content.replace(/\r\n/g, '\n');

    // If it looks like markdown, convert to HTML and sanitize
    if (looksLikeMarkdown(original)) {
      return markdownToHtml(original);
    }

    // If it contains HTML tags, sanitize and return
    if (/<[a-z][\s\S]*>/i.test(original)) {
      return sanitizeHtml(original);
    }

    // Plain text: escape and convert newlines to paragraphs
    const escapeHtml = (unsafe) =>
      unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const txt = escapeHtml(original);
    const paragraphs = txt.split(/\n{2,}/).map((p) => {
      const withBr = p.split('\n').join('<br/>');
      return `<p>${withBr}</p>`;
    });

    return paragraphs.join('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {post && (
        <Seo
          title={`${post.title} — Benon Tech & Art`}
          description={post.excerpt || post.title}
          image={post.cover_image}
          url={typeof window !== 'undefined' ? window.location.href : undefined}
        />
      )}
      <Header />
      <main className="pt-24 pb-20">
        <article className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Back Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          {/* Cover Image */}
          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
            />
          )}

          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(post.created_at)}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${
                  hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
                {likesCount} likes
              </button>
              <span className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle size={20} />
                {comments.length} comments
              </span>
            </div>
          </div>

          {/* Post Content */}
          <div
            className="prose prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />

          {/* Comments Section */}
          <section className="border-t border-primary/20 pt-8">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`${star <= newRating ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        <Star size={24} fill={star <= newRating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="mb-4"
                  rows={4}
                />
                <Button type="submit" disabled={submitting || !newComment.trim()}>
                  <Send size={16} className="mr-2" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
            ) : (
              <div className="bg-card/50 rounded-lg p-6 mb-8 text-center">
                <p className="text-muted-foreground mb-4">Sign in to leave a comment</p>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-card/30 rounded-lg p-6 border border-primary/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{comment.user_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                    {comment.rating && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= comment.rating ? 'text-primary' : 'text-muted-foreground'}
                            fill={star <= comment.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-foreground/80">{comment.content}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
