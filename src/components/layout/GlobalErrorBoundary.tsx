'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with Sentry, LogRocket, etc.
      console.error('Error logged to monitoring service');
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const errorDetails = encodeURIComponent(
      `Error: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack}`
    );
    window.location.href = `mailto:support@clippingbd.com?subject=Bug Report&body=${errorDetails}`;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            <Card className="glass-card border-red-500/30 overflow-hidden">
              {/* Error Header */}
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
                  >
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold">Something went wrong</h1>
                    <p className="text-muted-foreground">We encountered an unexpected error</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Error Details (Development Mode) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                      <Bug className="w-4 h-4" />
                      Error Details (Dev Mode Only)
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 overflow-auto max-h-40">
                      <code className="text-xs text-red-300 whitespace-pre-wrap">
                        {this.state.error.message}
                        {'\n\n'}
                        {this.state.error.stack?.split('\n').slice(0, 5).join('\n')}
                      </code>
                    </div>
                  </div>
                )}

                {/* User-Friendly Message */}
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Don't worry, our team has been notified of this issue. 
                    You can try refreshing the page or returning to the home page.
                    If the problem persists, please contact our support team.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={this.handleReload}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1 border-white/20 hover:bg-white/5"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>

                {/* Report Bug Link */}
                <button
                  onClick={this.handleReportBug}
                  className="w-full mt-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Report this bug to our team
                </button>
              </CardContent>
            </Card>

            {/* Additional Help */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center text-muted-foreground text-sm"
            >
              If you need immediate assistance, contact us at{' '}
              <a href="mailto:support@clippingbd.com" className="text-emerald-400 hover:underline">
                support@clippingbd.com
              </a>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for programmatic error reporting
export function useErrorBoundary() {
  const reportError = (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Reported error:', error, errorInfo);
    // In production, send to error tracking service
  };

  return { reportError };
}
