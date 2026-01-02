import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, LogOut, Mail, Phone, MessageSquare, Star, Check, X, Trash2, Home,
   Image, FileText, Calendar, Plus, Upload, Eye, EyeOff, Edit2, FolderOpen, Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DragDropUpload from '@/components/DragDropUpload';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  in_review: 'bg-blue-500/20 text-blue-400',
  confirmed: 'bg-green-500/20 text-green-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const Admin = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryCategories, setGalleryCategories] = useState([]);
  
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: '', slug: '', excerpt: '', content: '', cover_image: '', published: false });
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false);
  
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category_id: '', show_in_portfolio: false });
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [uploadedGalleryUrls, setUploadedGalleryUrls] = useState([]);
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  
  const blogImageInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate('/auth');
        } else {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      } else {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (data) {
      setIsAdmin(true);
      fetchData();
    } else {
      setIsAdmin(false);
    }
    setIsLoading(false);
  };

  const fetchData = async () => {
    const [contactsRes, testimonialsRes, bookingsRes, blogRes, galleryRes, categoriesRes] = await Promise.all([
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('gallery_images').select('*').order('created_at', { ascending: false }),
      supabase.from('gallery_categories').select('*').order('name'),
    ]);

    if (contactsRes.data) setContacts(contactsRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    if (bookingsRes.data) setBookings(bookingsRes.data);
    if (blogRes.data) setBlogPosts(blogRes.data);
    if (galleryRes.data) setGalleryImages(galleryRes.data);
    if (categoriesRes.data) setGalleryCategories(categoriesRes.data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleImageUpload = async (file, type) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${type}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleMultipleGalleryUpload = async (files) => {
    setUploadingGalleryImages(true);
    const uploadedUrls = [];
    
    for (const file of files) {
      const url = await handleImageUpload(file, 'gallery');
      if (url) {
        uploadedUrls.push(url);
      }
    }
    
    setUploadedGalleryUrls(prev => [...prev, ...uploadedUrls]);
    setUploadingGalleryImages(false);
    
    if (uploadedUrls.length > 0) {
      toast({ 
        title: 'Upload complete', 
        description: `${uploadedUrls.length} image(s) uploaded successfully` 
      });
    }
  };

  const handleRemoveUploadedUrl = (url) => {
    setUploadedGalleryUrls(prev => prev.filter(u => u !== url));
  };

  const handleBlogImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBlogImage(true);
    const url = await handleImageUpload(file, 'blog');
    if (url) {
      setBlogForm(prev => ({ ...prev, cover_image: url }));
    }
    setUploadingBlogImage(false);
  };

  const handleApproveTestimonial = async (id, approve) => {
    const { error } = await supabase.from('testimonials').update({ is_approved: approve }).eq('id', id);
    if (!error) {
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, is_approved: approve } : t));
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (!error) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) return;
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (!error) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    const booking = bookings.find(b => b.id === id);
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      
      if (booking) {
        try {
          await supabase.functions.invoke('send-status-update-email', {
            body: { bookingId: id, newStatus: status, email: booking.email, name: booking.name }
          });
        } catch (e) {
          console.error('Failed to send email notification:', e);
        }
      }
      
      toast({ title: 'Status updated', description: `Booking status changed to ${status}` });
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) {
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleSaveBlog = async () => {
    if (!user) return;
    
    if (editingBlogId) {
      const { error } = await supabase.from('blog_posts').update({
        title: blogForm.title,
        slug: blogForm.slug,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        cover_image: blogForm.cover_image || null,
        published: blogForm.published,
      }).eq('id', editingBlogId);
      
      if (!error) {
        toast({ title: 'Blog updated successfully' });
        fetchData();
        resetBlogForm();
      }
    } else {
      const { error } = await supabase.from('blog_posts').insert({
        title: blogForm.title,
        slug: blogForm.slug,
        excerpt: blogForm.excerpt,
        content: blogForm.content,
        cover_image: blogForm.cover_image || null,
        published: blogForm.published,
        author_id: user.id,
      });
      
      if (!error) {
        toast({ title: 'Blog created successfully' });
        fetchData();
        resetBlogForm();
      }
    }
  };

  const handleEditBlog = (post) => {
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      cover_image: post.cover_image || '',
      published: post.published,
    });
    setEditingBlogId(post.id);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (id, authorId) => {
    if (authorId !== user?.id) {
      toast({ title: 'Cannot delete', description: 'You can only delete your own blog posts', variant: 'destructive' });
      return;
    }
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (!error) {
      setBlogPosts(prev => prev.filter(b => b.id !== id));
      toast({ title: 'Blog deleted successfully' });
    }
  };

  const resetBlogForm = () => {
    setBlogForm({ title: '', slug: '', excerpt: '', content: '', cover_image: '', published: false });
    setEditingBlogId(null);
    setShowBlogForm(false);
  };

  const handleSaveGalleryImages = async () => {
    if (!user || uploadedGalleryUrls.length === 0) {
      toast({ title: 'Error', description: 'Please upload at least one image', variant: 'destructive' });
      return;
    }
    
    const imagesToInsert = uploadedGalleryUrls.map(url => ({
      title: galleryForm.title || 'Untitled',
      description: galleryForm.description || null,
      image_url: url,
      category_id: galleryForm.category_id,
      show_in_portfolio: galleryForm.show_in_portfolio,
      uploaded_by: user.id,
    }));

    const { error } = await supabase.from('gallery_images').insert(imagesToInsert);
    
    if (!error) {
      toast({ title: 'Success', description: `${uploadedGalleryUrls.length} image(s) added successfully` });
      fetchData();
      setGalleryForm({ title: '', description: '', category_id: '', show_in_portfolio: false });
      setUploadedGalleryUrls([]);
      setShowGalleryForm(false);
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleTogglePortfolio = async (id, show) => {
    const { error } = await supabase.from('gallery_images').update({ show_in_portfolio: show }).eq('id', id);
    if (!error) {
      setGalleryImages(prev => prev.map(img => img.id === id ? { ...img, show_in_portfolio: show } : img));
    }
  };

  const handleDeleteGalleryImage = async (id, uploadedBy) => {
    if (uploadedBy !== user?.id) {
      toast({ title: 'Cannot delete', description: 'You can only delete images you uploaded', variant: 'destructive' });
      return;
    }
    if (!confirm('Are you sure you want to delete this image?')) return;
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (!error) {
      setGalleryImages(prev => prev.filter(img => img.id !== id));
    }
  };

  const handleSaveCategory = async () => {
    if (editingCategoryId) {
      const { error } = await supabase.from('gallery_categories').update({
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description || null,
      }).eq('id', editingCategoryId);
      
      if (!error) {
        toast({ title: 'Category updated successfully' });
        fetchData();
        resetCategoryForm();
      }
    } else {
      const { error } = await supabase.from('gallery_categories').insert({
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description || null,
      });
      
      if (!error) {
        toast({ title: 'Category created successfully' });
        fetchData();
        resetCategoryForm();
      }
    }
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setEditingCategoryId(category.id);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    const imagesInCategory = galleryImages.filter(img => img.category_id === id);
    if (imagesInCategory.length > 0) {
      toast({ title: 'Cannot delete', description: 'This category contains images. Remove images first.', variant: 'destructive' });
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;
    const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
    if (!error) {
      setGalleryCategories(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Category deleted successfully' });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', slug: '', description: '' });
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  const getCategoryName = (categoryId) => {
    return galleryCategories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-serif font-bold text-gradient-gold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have admin privileges.</p>
          <div className="flex gap-4 justify-center">
            <a href="/" className="inline-flex items-center gap-2 px-6 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all">
              <Home size={16} /> Go Home
            </a>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

   // Filter newsletter subscribers from contacts
  const newsletterSubscribers = contacts.filter(
    c => c.name === 'Newsletter Subscriber' && c.message === 'Newsletter subscription request'
  );
  const regularContacts = contacts.filter(
    c => !(c.name === 'Newsletter Subscriber' && c.message === 'Newsletter subscription request')
  );

  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: <Mail size={18} />, count: regularContacts.length },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare size={18} />, count: testimonials.length },
    { id: 'bookings', label: 'Bookings', icon: <Calendar size={18} />, count: bookings.length },
    { id: 'blogs', label: 'Blog Posts', icon: <FileText size={18} />, count: blogPosts.length },
    { id: 'gallery', label: 'Gallery', icon: <Image size={18} />, count: galleryImages.length },
    { id: 'categories', label: 'Categories', icon: <FolderOpen size={18} />, count: galleryCategories.length },
    { id: 'newsletter', label: 'Newsletter', icon: <Users size={18} />, count: newsletterSubscribers.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input for blog */}
      <input type="file" ref={blogImageInputRef} className="hidden" accept="image/*" onChange={handleBlogImageChange} />

      {/* Header */}
      <header className="border-b border-primary/20 bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-gradient-gold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-muted-foreground hover:text-primary transition-colors"><Home size={20} /></a>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-primary/20 overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">{tab.icon} {tab.label} ({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No contact submissions yet.</p>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="p-6 bg-card/50 border border-primary/20 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{contact.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Mail size={14} />{contact.email}</span>
                        {contact.phone && <span className="flex items-center gap-1"><Phone size={14} />{contact.phone}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(contact.created_at).toLocaleDateString()}</span>
                      <button onClick={() => handleDeleteContact(contact.id)} className="p-2 text-muted-foreground hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="text-foreground/90">{contact.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            {testimonials.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No testimonials yet.</p>
            ) : (
              testimonials.map((testimonial) => (
                <div key={testimonial.id} className="p-6 bg-card/50 border border-primary/20 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${testimonial.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {testimonial.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      {testimonial.company && <p className="text-sm text-muted-foreground">{testimonial.company}</p>}
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className={star <= testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(testimonial.created_at).toLocaleDateString()}</span>
                      <button onClick={() => handleApproveTestimonial(testimonial.id, !testimonial.is_approved)} className={`p-2 ${testimonial.is_approved ? 'text-yellow-400' : 'text-green-400'}`}>
                        {testimonial.is_approved ? <X size={16} /> : <Check size={16} />}
                      </button>
                      <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="p-2 text-muted-foreground hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="text-foreground/90 italic">"{testimonial.message}"</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No bookings yet.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="p-6 bg-card/50 border border-primary/20 rounded-lg">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{booking.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Mail size={14} />{booking.email}</span>
                        {booking.phone && <span className="flex items-center gap-1"><Phone size={14} />{booking.phone}</span>}
                      </div>
                      <div className="mt-2">
                        <span className="text-primary font-medium">{booking.package_name}</span>
                        <span className="text-muted-foreground ml-2">({booking.package_price})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={booking.status}
                        onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 ${statusColors[booking.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_review">In Review</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button onClick={() => handleDeleteBooking(booking.id)} className="p-2 text-muted-foreground hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="text-foreground/90 mb-3">{booking.project_description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {booking.budget && <span>Budget: {booking.budget}</span>}
                    {booking.deadline && <span>Deadline: {new Date(booking.deadline).toLocaleDateString()}</span>}
                    {booking.preferred_meeting_times && <span>Meeting: {booking.preferred_meeting_times}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Blog Posts</h2>
              <button onClick={() => setShowBlogForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                <Plus size={18} /> New Post
              </button>
            </div>

            {showBlogForm && (
              <div className="mb-6 p-6 bg-card/50 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-4">{editingBlogId ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg" />
                  <input type="text" placeholder="Slug (url-friendly)" value={blogForm.slug} onChange={(e) => setBlogForm(prev => ({ ...prev, slug: e.target.value }))} className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg" />
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Cover Image</label>
                    <div className="flex gap-3">
                      <input type="text" placeholder="Image URL or upload" value={blogForm.cover_image} onChange={(e) => setBlogForm(prev => ({ ...prev, cover_image: e.target.value }))} className="flex-1 px-4 py-2 bg-background border border-primary/20 rounded-lg" />
                      <button 
                        type="button" 
                        onClick={() => blogImageInputRef.current?.click()} 
                        disabled={uploadingBlogImage}
                        className="px-4 py-2 border border-primary/30 rounded-lg hover:border-primary flex items-center gap-2"
                      >
                        {uploadingBlogImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Upload
                      </button>
                    </div>
                    {blogForm.cover_image && (
                      <img src={blogForm.cover_image} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                    )}
                  </div>
                  <textarea placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))} className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg h-20" />
                  <textarea placeholder="Content (supports markdown)" value={blogForm.content} onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))} className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg h-40" />
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={blogForm.published} onChange={(e) => setBlogForm(prev => ({ ...prev, published: e.target.checked }))} className="rounded" />
                    <span>Publish immediately</span>
                  </label>
                  <div className="flex gap-3">
                    <button onClick={handleSaveBlog} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Save</button>
                    <button onClick={resetBlogForm} className="px-4 py-2 border border-primary/20 rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {blogPosts.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No blog posts yet.</p>
              ) : (
                blogPosts.map((post) => (
                  <div key={post.id} className="p-6 bg-card/50 border border-primary/20 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-foreground">{post.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${post.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">/{post.slug}</p>
                        {post.excerpt && <p className="text-foreground/80 mt-2">{post.excerpt}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditBlog(post)} className="p-2 text-muted-foreground hover:text-primary"><Edit2 size={16} /></button>
                        {post.author_id === user?.id && (
                          <button onClick={() => handleDeleteBlog(post.id, post.author_id)} className="p-2 text-muted-foreground hover:text-red-400"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Gallery Images</h2>
              <button onClick={() => setShowGalleryForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                <Upload size={18} /> Add Image
              </button>
            </div>

            {showGalleryForm && (
              <div className="mb-6 p-6 bg-card/50 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-4">Add Gallery Images</h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Title (optional for batch upload)" 
                    value={galleryForm.title} 
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))} 
                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg" 
                  />
                  
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Upload Images (drag & drop or click to browse)
                    </label>
                    <DragDropUpload
                      onUpload={handleMultipleGalleryUpload}
                      isUploading={uploadingGalleryImages}
                      multiple={true}
                      uploadedUrls={uploadedGalleryUrls}
                      onRemoveUrl={handleRemoveUploadedUrl}
                    />
                  </div>
                  
                  <textarea 
                    placeholder="Description (optional)" 
                    value={galleryForm.description} 
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, description: e.target.value }))} 
                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg h-20" 
                  />
                  
                  <select 
                    value={galleryForm.category_id} 
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, category_id: e.target.value }))} 
                    className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {galleryCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={galleryForm.show_in_portfolio} 
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, show_in_portfolio: e.target.checked }))} 
                      className="rounded" 
                    />
                    <span>Show in Portfolio section</span>
                  </label>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSaveGalleryImages} 
                      disabled={uploadedGalleryUrls.length === 0 || !galleryForm.category_id}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
                    >
                      Add {uploadedGalleryUrls.length} Image(s)
                    </button>
                    <button 
                      onClick={() => {
                        setShowGalleryForm(false);
                        setUploadedGalleryUrls([]);
                        setGalleryForm({ title: '', description: '', category_id: '', show_in_portfolio: false });
                      }} 
                      className="px-4 py-2 border border-primary/20 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryImages.length === 0 ? (
                <p className="text-muted-foreground text-center py-12 col-span-full">No gallery images yet.</p>
              ) : (
                galleryImages.map((image) => (
                  <div key={image.id} className="relative group bg-card/50 border border-primary/20 rounded-lg overflow-hidden">
                    <img src={image.image_url} alt={image.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h4 className="font-medium text-foreground">{image.title}</h4>
                      <p className="text-sm text-primary">{getCategoryName(image.category_id)}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button onClick={() => handleTogglePortfolio(image.id, !image.show_in_portfolio)} className={`p-2 rounded-full ${image.show_in_portfolio ? 'bg-green-500/80 text-white' : 'bg-background/80 text-muted-foreground'}`} title={image.show_in_portfolio ? 'Remove from portfolio' : 'Add to portfolio'}>
                        {image.show_in_portfolio ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      {image.uploaded_by === user?.id && (
                        <button onClick={() => handleDeleteGalleryImage(image.id, image.uploaded_by)} className="p-2 rounded-full bg-background/80 text-muted-foreground hover:text-red-400"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Gallery Categories</h2>
              <button onClick={() => setShowCategoryForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                <Plus size={18} /> New Category
              </button>
            </div>

            {showCategoryForm && (
              <div className="mb-6 p-6 bg-card/50 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-4">{editingCategoryId ? 'Edit Category' : 'Create Category'}</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg" />
                  <input type="text" placeholder="Slug (url-friendly)" value={categoryForm.slug} onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))} className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg" />
                  <textarea placeholder="Description" value={categoryForm.description} onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-2 bg-background border border-primary/20 rounded-lg h-20" />
                  <div className="flex gap-3">
                    <button onClick={handleSaveCategory} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Save</button>
                    <button onClick={resetCategoryForm} className="px-4 py-2 border border-primary/20 rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {galleryCategories.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No categories yet.</p>
              ) : (
                galleryCategories.map((category) => (
                  <div key={category.id} className="p-6 bg-card/50 border border-primary/20 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                        {category.description && <p className="text-foreground/80 mt-2">{category.description}</p>}
                        <p className="text-sm text-primary mt-2">
                          {galleryImages.filter(img => img.category_id === category.id).length} images
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditCategory(category)} className="p-2 text-muted-foreground hover:text-primary"><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-muted-foreground hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Admin;

