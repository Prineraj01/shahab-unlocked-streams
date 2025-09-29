import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Clock } from 'lucide-react';

interface AccessControlProps {
  children: React.ReactNode;
  homepageUrl?: string;
}

const AccessControl = ({ children, homepageUrl = 'https://mywebsite.com/' }: AccessControlProps) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const checkAccess = () => {
    try {
      const accessGranted = localStorage.getItem('access_granted');
      if (!accessGranted) {
        return false;
      }

      const accessTime = parseInt(accessGranted);
      const currentTime = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      return (currentTime - accessTime) < twentyFourHours;
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  };

  const redirectToShortener = async () => {
    try {
      setIsRedirecting(true);
      
      // Add the from_shortener parameter to the homepage URL
      const returnUrl = new URL(homepageUrl);
      returnUrl.searchParams.set('from_shortener', 'true');
      
      const apiUrl = `https://vplink.in/api?api=ad3ce711eb354d522cbac856b0dfa149b6c71e43&url=${encodeURIComponent(returnUrl.toString())}&alias=auto`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.shortenedUrl || data.shorturl) {
        // Some APIs return 'shortenedUrl', others 'shorturl'
        window.location.href = data.shortenedUrl || data.shorturl;
      } else {
        console.error('Failed to get shortener URL. Response:', data);
        // Fallback: grant access locally for development
        localStorage.setItem('access_granted', Date.now().toString());
        setHasAccess(true);
      }
    } catch (error) {
      console.error('Error redirecting to shortener:', error);
      // Fallback: grant access locally for development
      localStorage.setItem('access_granted', Date.now().toString());
      setHasAccess(true);
    } finally {
      setIsRedirecting(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromShortener = urlParams.get('from_shortener');

    if (fromShortener === 'true') {
      // User just returned from shortener
      localStorage.setItem('access_granted', Date.now().toString());
      setHasAccess(true);
      setIsChecking(false);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check existing access
      const accessValid = checkAccess();
      setHasAccess(accessValid);
      setIsChecking(false);

      if (!accessValid) {
        // Auto-redirect after a short delay
        setTimeout(() => {
          redirectToShortener();
        }, 2000);
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