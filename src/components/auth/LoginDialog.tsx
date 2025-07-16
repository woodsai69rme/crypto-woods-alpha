
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthContext } from './AuthProvider';
import { Bot, TrendingUp } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const { signInWithGoogle } = useAuthContext();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="h-6 w-6 text-blue-400" />
            CryptoAI Trading Platform
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <TrendingUp className="h-12 w-12 text-green-400 mx-auto" />
            <h3 className="text-lg font-semibold">Ultimate Trading Experience</h3>
            <p className="text-gray-400">
              Access real-time market data, AI-powered trading bots, and advanced analytics
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign in with Google
            </Button>
            
            <div className="text-xs text-gray-400 text-center">
              Sign in to access portfolio tracking, AI bots, and paper trading
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
