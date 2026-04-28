'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, Github, Chrome,
  AlertCircle, CheckCircle, Loader2, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore, getDashboardPath } from '@/store/app-store';
import { createBrowserClient } from '@supabase/ssr';
import type { UserRole, User } from '@/types/database';

const supabaseUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
const supabaseAnonKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';


function createUserObject(id: string, email: string, name: string, role: UserRole, walletBalance: number = 0): User {
  return {
    id,
    email,
    name,
    avatar: null,
    role,
    status: 'ACTIVE',
    walletBalance,
    stripeCustomerId: null,
    impersonating: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
}

export function AuthPages() {
  const { currentPage, setCurrentPage } = useAppStore();
  const [isSignup, setIsSignup] = useState(false);
  
  if (currentPage === '/auth/signup') {
    return <SignupPage />;
  }
  
  if (currentPage === '/auth/reset' || currentPage.startsWith('/auth/reset')) {
    return <ResetPasswordPage />;
  }
  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setIsSignup(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isSignup 
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignup(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSignup 
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {isSignup ? (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SignupForm />
                </motion.div>
              ) : (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <LoginForm onSignupClick={() => setIsSignup(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function LoginForm({ onSignupClick }: { onSignupClick: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setCurrentPage, isAuthenticated, user } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for OAuth errors in URL
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        oauth_failed: 'OAuth authentication failed. Please try again.',
        exchange_failed: 'Failed to complete authentication. Please try again.',
        auth_failed: 'Authentication failed. Please try again.',
        no_user: 'Could not get user information.',
        no_email: 'Email not provided by OAuth provider.',
        inactive: 'Your account is not active. Please contact support.',
        callback_error: 'An error occurred during authentication.',
      };
      setError(errorMessages[errorParam] || 'Authentication error occurred.');
    }
  }, [searchParams]);

  // Auto-login if OAuth callback succeeded (checked via cookies)
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/login', { method: 'GET' });
        const data = await res.json();
        if (res.ok && data.authenticated && data.user) {
          setUser(data.user);
          const redirectPath = getDashboardPath(data.user.role);
          setCurrentPage(redirectPath);
          router.push(redirectPath);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
    }
    checkAuth();
  }, [router, setUser, setCurrentPage]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getDashboardPath(user.role);
      setCurrentPage(redirectPath);
      window.history.pushState({}, '', redirectPath);
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router, setCurrentPage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setUser(data.user);
        const redirectPath = getDashboardPath(data.user.role);
        setCurrentPage(redirectPath);
        window.history.pushState({}, '', redirectPath);
        router.push(redirectPath);
      } else {
        if (data.status === 'PENDING') {
          setError('Your account is pending approval. Please wait for an administrator to approve your account.');
        } else if (data.status === 'SUSPENDED') {
          setError('Your account has been suspended. Please contact support.');
        } else if (data.status === 'BANNED') {
          setError('Your account has been banned. Please contact support.');
        } else {
          setError(data.error || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    const url = typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.props?.pageProps?.supabaseUrl : null;
    const key = typeof window !== 'undefined' ? (window as any).__NEXT_DATA__?.props?.pageProps?.supabaseAnonKey : null;
    const sbUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!sbUrl || !sbKey) {
      setError('OAuth not configured. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createBrowserClient(sbUrl, sbKey);
      const redirectTo = `${window.location.origin}/auth?oauth=complete`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data?.url) {
        setError(`Failed to connect to ${provider}. Please try again.`);
        setLoading(false);
        return;
      }

      sessionStorage.setItem('oauth_callback', '/dashboard');
      window.location.href = data.url;
    } catch (err) {
      console.error('OAuth error:', err);
      setError(`Failed to connect to ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
      <p className="text-muted-foreground text-sm mb-6">Sign in to your ClippingPath & Website Services Studio account</p>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-background border-border focus:border-emerald-500/50"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-background border-border focus:border-emerald-500/50"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</Label>
          </div>
          <button onClick={() => setCurrentPage('/auth/forgot-password')} className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline transition-colors">
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="border-border hover:bg-accent hover:border-emerald-500/30"
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading || !supabaseUrl}
        >
          <Chrome className="w-4 h-4 mr-2" />
          Google
        </Button>
        <Button
          variant="outline"
          className="border-border hover:bg-accent hover:border-emerald-500/30"
          onClick={() => handleOAuthSignIn('github')}
          disabled={loading || !supabaseUrl}
        >
          <Github className="w-4 h-4 mr-2" />
          GitHub
        </Button>
      </div>

      {!supabaseUrl && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          OAuth not configured. Contact support to enable social login.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button onClick={onSignupClick} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline transition-colors">
          Sign up
        </button>
      </p>
    </>
  );
}

function SignupForm() {
  const router = useRouter();
  const { setUser, setCurrentPage, isAuthenticated, user } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'PARTNER'>('CLIENT');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getDashboardPath(user.role);
      setCurrentPage(redirectPath);
      window.history.pushState({}, '', redirectPath);
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router, setCurrentPage]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length (backend requires at least 8 chars with special chars)
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    // Check terms acceptance
    if (!terms) {
      setError('You must accept the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          terms,
          role: role === 'PARTNER' ? 'EDITOR' : 'CLIENT',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Account created successfully
        if (data.user) {
          // Auto-approved - login and redirect
          setUser(data.user);
        } else {
          // Show success message
          alert('Account created successfully! You can now log in.');
        }
      } else {
        setError(data.error || data.details?.[0]?.message || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Create Account</h1>
      <p className="text-muted-foreground text-sm mb-6">Join 10,000+ businesses using ClippingPath & Website Services Studio</p>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-background border-border focus:border-emerald-500/50"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-background border-border focus:border-emerald-500/50"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Account Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`p-4 rounded-lg border text-left transition-all ${
                role === 'CLIENT'
                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                  : 'border-border hover:border-emerald-500/30 hover:bg-accent'
              }`}
            >
              <p className="font-medium">Client</p>
              <p className="text-xs text-muted-foreground">Order editing services</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('PARTNER')}
              className={`p-4 rounded-lg border text-left transition-all ${
                role === 'PARTNER'
                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                  : 'border-border hover:border-emerald-500/30 hover:bg-accent'
              }`}
            >
              <p className="font-medium">Partner</p>
              <p className="text-xs text-muted-foreground">Join as editor</p>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-background border-border focus:border-emerald-500/50"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Must have: 8+ characters, uppercase, lowercase, number &amp; special char
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 bg-background border-border focus:border-emerald-500/50"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox 
            id="terms" 
            className="mt-0.5" 
            checked={terms}
            onCheckedChange={(checked) => setTerms(checked === true)}
            required 
          />
          <Label htmlFor="terms" className="text-sm text-muted-foreground leading-snug">
            I agree to the{' '}
            <button onClick={() => setCurrentPage('/terms')} className="text-emerald-600 dark:text-emerald-400 hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button onClick={() => setCurrentPage('/privacy')} className="text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</button>
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button onClick={() => setCurrentPage('/auth')} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline transition-colors">
          Sign in
        </button>
      </p>
    </>
  );
}

function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <SignupForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ResetPasswordPage() {
  const { setCurrentPage } = useAppStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card">
          <CardHeader className="text-center pb-2">
            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
            <p className="text-muted-foreground text-sm">
              {submitted ? 'Check your email for reset instructions' : 'Enter your email to reset your password'}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-muted-foreground mb-2">
                  We&apos;ve sent a password reset link to
                </p>
                <p className="font-semibold text-foreground mb-4">{email}</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    try again
                  </button>
                </p>
                <Button variant="outline" className="border-border hover:bg-accent" onClick={() => setCurrentPage('/auth')}>
                  Back to Sign In
                </Button>
              </motion.div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-background border-border focus:border-emerald-500/50"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <button onClick={() => setCurrentPage('/auth')} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 hover:underline transition-colors">
                    Sign in
                  </button>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}