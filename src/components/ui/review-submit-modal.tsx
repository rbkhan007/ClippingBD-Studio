'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

interface ReviewSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewSubmitModal({ isOpen, onClose, onSuccess }: ReviewSubmitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    content: '',
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          setIsSuccess(false);
          setFormData({
            name: '',
            email: '',
            company: '',
            role: '',
            content: '',
            rating: 5,
          });
        }, 2000);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <GlassCard
              variant="premium"
              padding="lg"
              className="w-full max-w-lg relative border-amber-500/20"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Success state */}
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                  <p className="text-muted-foreground">
                    Your review has been submitted and will be visible after moderation.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">
                      Share Your <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Experience</span>
                    </h3>
                    <p className="text-muted-foreground">
                      We&apos;d love to hear about your experience with ClippingBD
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating */}
                    <div className="flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              'w-8 h-8 transition-colors',
                              star <= formData.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground'
                            )}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Name & Email */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Name *</label>
                        <Input
                          required
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Your name"
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Email *</label>
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Company & Role */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Company</label>
                        <Input
                          value={formData.company}
                          onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                          placeholder="Your company"
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Role</label>
                        <Input
                          value={formData.role}
                          onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                          placeholder="Your role"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      <label className="text-sm font-medium mb-1 block">Your Review *</label>
                      <Textarea
                        required
                        value={formData.content}
                        onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                        placeholder="Tell us about your experience..."
                        rows={4}
                        className="bg-background/50 resize-none"
                      />
                    </div>

                    {/* Error message */}
                    {error && (
                      <div className="text-sm text-red-500 text-center">{error}</div>
                    )}

                    {/* Submit button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 py-6"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
