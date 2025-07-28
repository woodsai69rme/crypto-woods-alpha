import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error to audit system
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    try {
      console.error('Component Error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });

      // In a real app, send to error reporting service
      // Example: Sentry, LogRocket, etc.
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="bg-red-900/20 border-red-500/50 max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-300">
              An unexpected error occurred in the trading interface. This has been automatically logged for investigation.
            </div>
            
            {this.state.error && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <div className="text-sm text-red-400 font-mono">
                  {this.state.error.message}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={this.handleRetry}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="border-gray-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="border-gray-600"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-gray-400 cursor-pointer hover:text-white">
                  <Bug className="h-4 w-4 inline mr-2" />
                  Developer Details
                </summary>
                <div className="mt-2 bg-gray-800 p-4 rounded border border-gray-600">
                  <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                    {this.state.error?.stack}
                  </pre>
                  <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}