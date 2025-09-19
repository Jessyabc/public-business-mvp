import * as React from 'react';
const { useState } = React;
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof ContactSchema>;

interface SecureContactFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function SecureContactForm({ className, onSuccess }: SecureContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const { data: result, error } = await supabase.functions.invoke('contact-relay', {
        body: data,
      });

      if (error) {
        throw error;
      }

      // Check for rate limiting or other API errors
      if (result?.error) {
        throw new Error(result.error);
      }

      setSubmitStatus({
        type: 'success',
        message: result?.message || 'Thank you for your message. We will respond within 24 hours.',
      });

      toast.success('Message sent successfully!');
      reset();
      onSuccess?.();

    } catch (error: unknown) {
      console.error('Contact form error:', error);

      const message =
        error instanceof Error
          ? error.message
          : error &&
              typeof error === 'object' &&
              'message' in error &&
              typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : null;

      let errorMessage = message ?? 'Failed to send message. Please try again.';

      if (message?.includes('RATE_LIMIT_EXCEEDED')) {
        errorMessage = 'Too many requests. Please wait before sending another message.';
      } else if (message?.includes('VALIDATION_ERROR')) {
        errorMessage = 'Please check your input and try again.';
      }

      setSubmitStatus({
        type: 'error',
        message: errorMessage,
      });

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`glass-card border-white/20 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="h-5 w-5 text-blue-400" />
          Secure Contact Form
        </CardTitle>
        <p className="text-blue-200 text-sm">
          Your information is protected and will never be shared publicly.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-blue-100">
                Name *
              </Label>
              <Input
                id="name"
                {...register('name')}
                className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                placeholder="Your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-blue-100">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="text-blue-100">
                Company
              </Label>
              <Input
                id="company"
                {...register('company')}
                className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                placeholder="Your company (optional)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-blue-100">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                placeholder="Your phone number (optional)"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject" className="text-blue-100">
              Subject *
            </Label>
            <Input
              id="subject"
              {...register('subject')}
              className="bg-white/10 border-white/20 text-white placeholder-blue-300"
              placeholder="What is this regarding?"
              disabled={isSubmitting}
            />
            {errors.subject && (
              <p className="text-red-400 text-sm mt-1">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message" className="text-blue-100">
              Message *
            </Label>
            <Textarea
              id="message"
              rows={4}
              {...register('message')}
              className="bg-white/10 border-white/20 text-white placeholder-blue-300 resize-none"
              placeholder="Please provide details about your inquiry..."
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
            )}
          </div>

          {submitStatus.type && (
            <Alert className={`${
              submitStatus.type === 'success' 
                ? 'border-green-500/50 bg-green-500/10' 
                : 'border-red-500/50 bg-red-500/10'
            }`}>
              {submitStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription className={
                submitStatus.type === 'success' ? 'text-green-200' : 'text-red-200'
              }>
                {submitStatus.message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Message...
              </>
            ) : (
              'Send Secure Message'
            )}
          </Button>

          <p className="text-xs text-blue-300 text-center">
            Protected by rate limiting and spam prevention. 
            Your email address will not be exposed publicly.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}