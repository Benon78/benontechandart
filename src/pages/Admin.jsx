import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut, Mail, Phone, MessageSquare, Star, Check, X, Trash2, Home } from 'lucide-react';

const Admin = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session) {
        navigate('/auth');
      } else {
        setTimeout(() => {
          checkAdminRole(session.user.id);
        }, 0);
      }
    });

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
    const [contactsRes, testimonialsRes] = await Promise.all([
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
    ]);

    if (contactsRes.data) setContacts(contactsRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleApproveTestimonial = async (id, approve) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_approved: approve })
      .eq('id', id);

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
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Contact the administrator to get access.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/" className="inline-flex items-center gap-2 px-6 py-2.5 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all">
              <Home size={16} />
              Go Home
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-gradient-gold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
              <Home size={20} />
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'contacts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                <Mail size={18} />
                Contact Submissions ({contacts.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'testimonials'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={18} />
                Testimonials ({testimonials.length})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'contacts' ? (
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
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {contact.email}
                        </span>
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-foreground/90">{contact.message}</p>
                </div>
              ))
            )}
          </div>
        ) : (
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
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          testimonial.is_approved
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {testimonial.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      {testimonial.company && (
                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                      )}
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(testimonial.created_at).toLocaleDateString()}
                      </span>
                      {!testimonial.is_approved && (
                        <button
                          onClick={() => handleApproveTestimonial(testimonial.id, true)}
                          className="p-2 text-muted-foreground hover:text-green-400 transition-colors"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {testimonial.is_approved && (
                        <button
                          onClick={() => handleApproveTestimonial(testimonial.id, false)}
                          className="p-2 text-muted-foreground hover:text-yellow-400 transition-colors"
                          title="Unapprove"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-foreground/90 italic">"{testimonial.message}"</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
