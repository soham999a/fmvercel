"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { toast } from 'sonner';
import { getSupabase, hasSupabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

const emailSchema = z.string().trim().email({ message: 'Enter a valid email' }).max(255);
const passwordSchema = z.string().min(8, { message: 'Minimum 8 characters' }).max(72);

export default function Auth() {
  const router = useRouter();
  const { session } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace('/');
  }, [session, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailR = emailSchema.safeParse(email);
    const passR = passwordSchema.safeParse(password);
    if (!emailR.success) return toast.error(emailR.error.issues[0].message);
    if (!passR.success) return toast.error(passR.error.issues[0].message);

    setBusy(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error('Accounts are unavailable — running in local mode');
        return;
      }
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: emailR.data,
          password: passR.data,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || emailR.data.split('@')[0] },
          },
        });
        if (error) throw error;
        toast.success('Account created. You are signed in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailR.data,
          password: passR.data,
        });
        if (error) throw error;
        toast.success('Welcome back.');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (!hasSupabase) {
      toast.error('Cloud sign-in is unavailable — running in local mode');
      return;
    }
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? 'Google sign-in failed');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <Link href="/" className="type-mono-label text-muted-foreground">
            ← Back
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {mode === 'signin' ? 'Sign in to Hertz' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sync favorites and listening history across devices.
          </p>
          <div className="rule-gold mt-4 w-16" />

          {!hasSupabase && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Cloud accounts are unavailable right now — running in{' '}
              <span className="text-primary">local mode</span>. Favorites and history stay on this
              device.
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={80}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            <Button type="submit" disabled={busy || !hasSupabase} className="w-full">
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="type-mono-label text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google} disabled={busy || !hasSupabase}>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account?" : 'Already registered?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary underline-offset-4 hover:underline"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
