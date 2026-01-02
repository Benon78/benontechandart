import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut, Home, Bell, BellOff, Calendar, Clock, Camera, Save, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  in_review: 'bg-blue-500/20 text-blue-400',
  confirmed: 'bg-green-500/20 text-green-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const statusLabels = {
  pending: 'Pending',
  in_review: 'In Review',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [blogNotifications, setBlogNotifications] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

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
            fetchUserData(session.user.id, session.user.email || '');
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
        fetchUserData(session.user.id, session.user.email || '');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Booking update received:', payload);
          if (payload.eventType === 'UPDATE') {
            setBookings((prev) =>
              prev.map((booking) =>
                booking.id === payload.new.id ? { ...booking, ...payload.new } : booking
              )
            );
            toast({
              title: 'Booking Updated',
              description: `Your booking status changed to ${statusLabels[payload.new.status]}`,
            });
          } else if (payload.eventType === 'INSERT') {
            setBookings((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const fetchUserData = async (userId, email) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }

      if (profile) {
        setBlogNotifications(profile.blog_notifications ?? true);
        setDisplayName(profile.display_name || '');
        setAvatarUrl(profile.avatar_url || null);
      } else {
        await supabase.from('profiles').insert({
          user_id: userId,
          email: email,
          blog_notifications: true,
        });
      }

      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (bookingsData) setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      toast({ title: 'Avatar uploaded successfully' });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({ title: 'Upload failed', description: 'Failed to upload avatar', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated successfully' });
    }

    setSavingProfile(false);
  };

  const handleToggleNotifications = async () => {
    if (!user) return;

    setSavingPreferences(true);
    const newValue = !blogNotifications;

    const { error } = await supabase
      .from('profiles')
      .update({ blog_notifications: newValue })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update notification preferences', variant: 'destructive' });
    } else {
      setBlogNotifications(newValue);
      toast({ 
        title: 'Preferences updated', 
        description: newValue ? 'You will receive blog notifications' : 'Blog notifications disabled' 
      });
    }

    setSavingPreferences(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/20 bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-gradient-gold">My Profile</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
              <Home size={20} />
            </a>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-primary">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
<section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserIcon size={20} className="text-primary" />
            Profile Information
          </h2>
          <div className="bg-card/50 border border-primary/20 rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-primary/30">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon size={40} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {uploadingAvatar ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Camera size={14} />
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <span className="text-xs text-muted-foreground">Click to upload</span>
              </div>

              {/* Display Name */}
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Display Name
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="flex-1 px-4 py-2 bg-background border border-primary/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingProfile ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This name will be displayed on your comments and reviews
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Email Preferences Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Email Preferences
          </h2>
          <div className="bg-card/50 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Blog Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive email notifications when new blog posts are published
                </p>
              </div>
              <button
                onClick={handleToggleNotifications}
                disabled={savingPreferences}
                className={`
                  relative inline-flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full 
                  transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${blogNotifications ? 'bg-primary' : 'bg-muted'}
                  ${savingPreferences ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span
                  className={`
                    pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg 
                    transform transition-transform
                    ${blogNotifications ? 'translate-x-11' : 'translate-x-1'}
                  `}
                >
                  {savingPreferences ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : blogNotifications ? (
                    <Bell size={14} className="text-primary" />
                  ) : (
                    <BellOff size={14} className="text-muted-foreground" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Bookings Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            My Bookings
            <span className="text-xs font-normal text-muted-foreground ml-2">(Updates in real-time)</span>
          </h2>
          
          {bookings.length === 0 ? (
            <div className="bg-card/50 border border-primary/20 rounded-lg p-8 text-center">
              <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven't made any bookings yet.</p>
              <a href="/#pricing" className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                View Our Services
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-card/50 border border-primary/20 rounded-lg p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{booking.package_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                          {statusLabels[booking.status]}
                        </span>
                      </div>
                      <p className="text-primary font-medium">{booking.package_price}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 justify-end">
                        <Clock size={14} />
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-foreground/90 mb-4">{booking.project_description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-primary/10 pt-4">
                    {booking.budget && (
                      <span className="flex items-center gap-1">
                        Budget: {booking.budget}
                      </span>
                    )}
                    {booking.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Deadline: {new Date(booking.deadline).toLocaleDateString()}
                      </span>
                    )}
                    {booking.preferred_meeting_times && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Meeting: {booking.preferred_meeting_times}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};


export default Profile;
