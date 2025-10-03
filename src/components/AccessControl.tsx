import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock } from 'lucide-react';

interface AccessControlProps {
  children: React.ReactNode;
  homepageUrl?: string;
}

// Main component for handling access control with URL shortener
const AccessControl = ({ children, homepageUrl = 'https://mywebsite.com/' }: AccessControlProps) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user has valid access (within 24 hours)
  const checkAccess = () => {
    try {
      const accessGranted = localStorage.getItem('access_granted');
      if (!accessGranted) return false;

      const accessTime = parseInt(accessGranted);
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000; // 24 hours

      // Check if access is still valid
      return (now - accessTime) < dayInMs;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  };

  // Redirect user through the VPLink shortener
  const redirectToShortener = async () => {
    try {
      setIsRedirecting(true);
      
      // Build return URL with tracking parameter
      const returnUrl = new URL(homepageUrl);
      returnUrl.searchParams.set('from_shortener', 'true');
      
      // Create unique alias to avoid conflicts
      const uniqueAlias = `ms${Date.now()}`;
      const apiUrl = `https://vplink.in/api?api=ad3ce711eb354d522cbac856b0dfa149b6c71e43&url=${encodeURIComponent(returnUrl.toString())}&alias=${uniqueAlias}`;
      
      console.log('Creating short link...'); // Debug log
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status === 'success' && data.shortenedUrl) {
        // Success! Redirect to shortened URL
        window.location.href = data.shortenedUrl;
      } else {
        console.error('Shortener API error:', data);
        // Fallback - redirect directly if shortener fails
        window.location.href = returnUrl.toString();
      }
    } catch (error) {
      console.error('Redirect error:', error);
      // On error, redirect directly
      const returnUrl = new URL(homepageUrl);
      returnUrl.searchParams.set('from_shortener', 'true');
      window.location.href = returnUrl.toString();
    } finally {
      setIsRedirecting(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromShortener = urlParams.get('from_shortener');

    if (fromShortener === 'true') {
      // User completed the shortener redirect - grant access!
      localStorage.setItem('access_granted', Date.now().toString());
      setHasAccess(true);
      setIsChecking(false);
      
      // Clean URL to remove the tracking param
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check if user already has access
      const accessValid = checkAccess();
      setHasAccess(accessValid);
      setIsChecking(false);

      // Auto-redirect after brief delay if no access
      if (!accessValid) {
        setTimeout(() => {
          redirectToShortener();
        }, 2000); // Wait 2 seconds before redirect
      }
    }
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-elegant">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Checking access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
            <CardTitle className="text-2xl">Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need to complete a quick verification to access this content for 24 hours.
            </p>
        <Button 
          onClick={redirectToShortener} 
          disabled={isRedirecting}
          variant="hero"
          className="w-full"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                'Get 24-Hour Access'
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              You'll be redirected automatically in a moment
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessControl;