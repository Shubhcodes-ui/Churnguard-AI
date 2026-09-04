import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[380px] bg-cg-surface rounded-2xl border border-cg-border my-6">
          <div className="w-14 h-14 rounded-2xl bg-cg-risk/10 border border-cg-risk/30 flex items-center justify-center mb-4 text-cg-risk">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-cg-primary mb-2">Interface Disruption Detected</h2>
          <p className="text-sm text-cg-muted mb-6 max-w-md leading-relaxed">
            {this.state.error?.message || "We encountered an issue rendering this view. Your server-side data is completely safe."}
          </p>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-cg-brand hover:bg-[#D4A143] text-cg-base font-semibold px-4 py-2 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="border-cg-border bg-cg-base text-cg-primary hover:bg-cg-surface"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
