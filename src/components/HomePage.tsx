import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PlayCircle, GraduationCap, Moon, Sun } from 'lucide-react';
import LecturesSection from './LecturesSection';
import NotesSection from './NotesSection';
import VideoPlayer from './VideoPlayer';
import heroImage from '@/assets/hero-education.jpg';

interface Lecture {
  title: string;
  link: string;
}

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('lectures');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Lecture | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle video selection
  const handleVideoSelect = (lecture: Lecture) => {
    setSelectedVideo(lecture);
  };

  // Go back to home from video player
  const handleBackToHome = () => {
    setSelectedVideo(null);
  };

  // Toggle dark/light theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // If user selected a video, show the player
  if (selectedVideo) {
    return (
      <VideoPlayer
        title={selectedVideo.title}
        url={selectedVideo.link}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-hero-gradient rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Learning Platform</h1>
                <p className="text-sm text-muted-foreground">Master Shahab Academy</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hover:bg-muted"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-hero-gradient rounded-xl p-8 text-white shadow-elegant relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10 bg-cover bg-center" 
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">
                Welcome to Your Learning Journey
              </h2>
              <p className="text-lg text-white/90 mb-6">
                Access comprehensive lectures and notes designed to help you excel. 
                Continue from where you left off or explore new topics.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  <span>Video Lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Study Notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
              <TabsTrigger 
                value="lectures" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <PlayCircle className="h-4 w-4" />
                Lectures
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <BookOpen className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Lectures Tab */}
          <TabsContent value="lectures" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Video Lectures</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Watch high-quality lectures with automatic progress tracking. 
                Continue from where you left off on any device.
              </p>
            </div>

            <LecturesSection
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onVideoSelect={handleVideoSelect}
            />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold mb-2">Study Notes</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Download or view comprehensive study materials, practice sheets, 
                and supplementary resources for each lecture.
              </p>
            </div>

            <NotesSection
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </TabsContent>
        </Tabs>

        {/* Footer Stats */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-soft bg-card-gradient">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Video Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">70+</p>
                <p className="text-sm text-muted-foreground">High-quality lectures</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft bg-card-gradient">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Study Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">15+</p>
                <p className="text-sm text-muted-foreground">Notes and resources</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft bg-card-gradient">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Access available</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;