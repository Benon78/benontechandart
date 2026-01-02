import { useState, useEffect } from 'react';
import { X, Calendar, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Booking form validation schema
const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  project_description: z.string().min(10, 'Please provide more details about your project'),
  deadline: z.string().optional(),
  budget: z.string().optional(),
  preferred_meeting_times: z.string().optional(),
});

const BookingModal = ({ isOpen, onClose, packageName, packagePrice }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project_description: '',
    deadline: '',
    budget: '',
    preferred_meeting_times: '',
  });
  const [errors, setErrors] = useState({});

  // Get current user session if logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      if (session?.user?.email) {
        setFormData(prev => ({ ...prev, email: session.user.email || '' }));
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: userId,
        package_name: packageName,
        package_price: packagePrice,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        project_description: formData.project_description,
        deadline: formData.deadline || null,
        budget: formData.budget || null,
        preferred_meeting_times: formData.preferred_meeting_times || null,
      });

      if (error) throw error;

      // Send booking notification email via Supabase Function
      await supabase.functions.invoke('send-booking-email', {
        body: {
          name: formData.name,
          email: formData.email,
          packageName,
          packagePrice,
        },
      });

      toast({
        title: 'Booking submitted!',
        description: 'We will review your request and get back to you soon.',
      });

      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        project_description: '',
        deadline: '',
        budget: '',
        preferred_meeting_times: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit booking. Please try again.',
        variant: 'destructive',
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Book {packageName} Package
          </DialogTitle>
        </DialogHeader>

        <div className="bg-secondary/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Selected Package</p>
          <p className="font-semibold text-foreground">{packageName}</p>
          <p className="text-primary font-bold text-lg">{packagePrice}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+255 (0) 764-422305"
            />
          </div>

          <div>
            <Label htmlFor="project_description">Project Description *</Label>
            <Textarea
              id="project_description"
              name="project_description"
              value={formData.project_description}
              onChange={handleChange}
              placeholder="Tell us about your project, goals, and requirements..."
              rows={4}
              className={errors.project_description ? 'border-destructive' : ''}
            />
            {errors.project_description && (
              <p className="text-xs text-destructive mt-1">{errors.project_description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="deadline">Preferred Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget Range</Label>
            <Input
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g., TZs 250,000 - TZs 300,000"
            />
          </div>

          <div>
            <Label htmlFor="preferred_meeting_times">Preferred Meeting Times</Label>
            <Textarea
              id="preferred_meeting_times"
              name="preferred_meeting_times"
              value={formData.preferred_meeting_times}
              onChange={handleChange}
              placeholder="e.g., Weekdays 10am-2pm EST, or specific dates..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
