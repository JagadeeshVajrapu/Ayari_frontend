'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/common/glass-card';
import { ScrollReveal } from '@/components/common/scroll-reveal';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="section-padding">
      <div className="container-premium">
        <ScrollReveal>
          <GlassCard className="relative overflow-hidden px-8 py-16 md:px-16 md:py-20">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-champagne/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-champagne-light/10 blur-3xl" />

            <div className="relative mx-auto max-w-xl text-center">
              <p className="mb-4 text-xs font-medium tracking-[0.25em] text-champagne-dark uppercase">
                Stay Connected
              </p>
              <h2 className="font-display text-display-md text-ink">
                Join the Inner Circle
              </h2>
              <p className="mt-4 text-ink-muted">
                Be the first to discover new collections, exclusive offers, and editorial
                stories from the world of AYARI.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 flex items-center justify-center gap-2 text-champagne-dark"
                >
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Welcome to the inner circle</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Button type="submit" variant="default" size="lg">
                    Subscribe
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}

              <p className="mt-4 text-xs text-ink-faint">
                By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
              </p>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
