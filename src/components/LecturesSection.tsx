import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Play, Search, Clock, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Lecture {
  title: string;
  link: string;
}

interface LecturesSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onVideoSelect: (lecture: Lecture) => void;
}

const LecturesSection = ({ searchTerm, onSearchChange, onVideoSelect }: LecturesSectionProps) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    const loadLectures = async () => {
      try {
        const response = await fetch('/data/master-shahablectures.json');
        const lecturesData: Lecture[] = await response.json();
        setLectures(lecturesData);
        setFilteredLectures(lecturesData);
      } catch (error) {
        console.error('Error loading lectures:', error);
        toast({
          title: 'Error',
          description: 'Failed to load lectures. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadLectures();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLectures(lectures);
    } else {
      const filtered = lectures.filter(lecture =>
        lecture.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLectures(filtered);
    }
  }, [searchTerm, lectures]);

  const getCategoryFromTitle = (title: string) => {
    if (title.toLowerCase().includes('anuvad') || title.toLowerCase().includes('अनुवाद')) {
      return 'Anuvad';
    }
    if (title.toLowerCase().includes('vachya') || title.toLowerCase().includes('वाच्य')) {
      return 'Vachya';
    }
    if (title.toLowerCase().includes('chapter')) {
      const match = title.match(/chapter\s+(\d+)/i);
      return match ? `Chapter ${match[1]}` : 'Chapters';
    }
    if (title.toLowerCase().includes('solution') || title.toLowerCase().includes('dpp')) {
      return 'Solutions';
    }
    if (title.toLowerCase().includes('practice')) {
      return 'Practice';
    }
    return 'General';
  };

  const getLectureNumber = (title: string) => {
    const match = title.match(/lec\s+(\d+)/i);
    return match ? parseInt(match[1]) : null;
  };

  const getLastWatchedTime = (lecture: Lecture) => {
    const videoId = btoa(lecture.link).substring(0, 20);
    const progress = localStorage.getItem(`video_progress_${videoId}`);
    return progress ? parseFloat(progress) : 0;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const groupedLectures = filteredLectures.reduce((acc, lecture) => {
    const category = getCategoryFromTitle(lecture.title);
    if (!acc[category]) acc[category] = [];
    acc[category].push(lecture);
    return acc;
  }, {} as Record<string, Lecture[]>);

  // Sort lectures within each category
  Object.keys(groupedLectures).forEach(category => {
    groupedLectures[category].sort((a, b) => {
      const aNum = getLectureNumber(a.title);
      const bNum = getLectureNumber(b.title);
      if (aNum !== null && bNum !== null) {
        return aNum - bNum;
      }
      return a.title.localeCompare(b.title);
    });
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search lectures..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-soft">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search lectures..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {filteredLectures.length} lectures
        </Badge>
      </div>

      {/* No Results */}
      {filteredLectures.length === 0 && searchTerm && (
        <Card className="shadow-soft">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lectures found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse all lectures.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grouped Lectures */}
      {Object.entries(groupedLectures).map(([category, categoryLectures]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{category}</h2>
            <Badge variant="outline">{categoryLectures.length}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryLectures.map((lecture, index) => {
              const lastWatched = getLastWatchedTime(lecture);
              const lectureNum = getLectureNumber(lecture.title);
              
              return (
                <Card key={index} className="shadow-soft hover:shadow-elegant transition-all duration-300 cursor-pointer"
                      onClick={() => onVideoSelect(lecture)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                          {lecture.title}
                        </CardTitle>
                      </div>
                      <Play className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          HLS Stream
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                        {lectureNum && (
                          <Badge variant="outline" className="text-xs">
                            Lecture {lectureNum}
                          </Badge>
                        )}
                      </div>

                      {/* Progress indicator */}
                      {lastWatched > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Continue from {formatTime(lastWatched)}</span>
                        </div>
                      )}

                      {/* Play button */}
                      <Button 
                        variant="hero"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVideoSelect(lecture);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {lastWatched > 0 ? 'Continue Watching' : 'Start Watching'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Stats Footer */}
      <Card className="shadow-soft bg-card-gradient">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total categories: {Object.keys(groupedLectures).length}</span>
            <span>Total lectures: {lectures.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LecturesSection;