import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Download, ExternalLink, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Note {
  title: string;
  link: string;
}

interface NotesSectionProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const NotesSection = ({ searchTerm, onSearchChange }: NotesSectionProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const response = await fetch('/data/master-shahab-notes.json');
        const notesData: Note[] = await response.json();
        setNotes(notesData);
        setFilteredNotes(notesData);
      } catch (error) {
        console.error('Error loading notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [searchTerm, notes]);

  const handleDownload = async (url: string, title: string) => {
    try {
      // For PDF files, we'll open them in a new tab instead of direct download
      // since they're hosted externally
      window.open(url, '_blank');
      
      toast({
        title: 'Opening PDF',
        description: 'The PDF will open in a new tab.',
      });
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to open PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleView = (url: string) => {
    window.open(url, '_blank');
  };

  const getFileType = (url: string) => {
    if (url.includes('.pdf')) return 'PDF';
    if (url.includes('jumpshare.com')) return 'Link';
    return 'File';
  };

  const getCategoryFromTitle = (title: string) => {
    if (title.toLowerCase().includes('anuvad') || title.toLowerCase().includes('अनुवाद')) {
      return 'Anuvad';
    }
    if (title.toLowerCase().includes('vachya') || title.toLowerCase().includes('वाच्य')) {
      return 'Vachya';
    }
    if (title.toLowerCase().includes('chapter')) {
      const match = title.match(/chapter\s+(\d+)/i);
      return match ? `Chapter ${match[1]}` : 'General';
    }
    if (title.toLowerCase().includes('practice') || title.toLowerCase().includes('dpp')) {
      return 'Practice';
    }
    if (title.toLowerCase().includes('planner')) {
      return 'Resources';
    }
    return 'General';
  };

  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const category = getCategoryFromTitle(note.title);
    if (!acc[category]) acc[category] = [];
    acc[category].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search notes..."
              className="pl-10"
              disabled
            />
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
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
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {filteredNotes.length} notes
        </Badge>
      </div>

      {/* No Results */}
      {filteredNotes.length === 0 && searchTerm && (
        <Card className="shadow-soft">
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse all notes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grouped Notes */}
      {Object.entries(groupedNotes).map(([category, categoryNotes]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{category}</h2>
            <Badge variant="outline">{categoryNotes.length}</Badge>
          </div>

          <div className="grid gap-4">
            {categoryNotes.map((note, index) => (
              <Card key={index} className="shadow-soft hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{note.title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {getFileType(note.link)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(note.link)}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleDownload(note.link, note.title)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Stats Footer */}
      <Card className="shadow-soft bg-card-gradient">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total categories: {Object.keys(groupedNotes).length}</span>
            <span>Total notes: {notes.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesSection;