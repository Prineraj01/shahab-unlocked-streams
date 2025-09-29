import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Import HLS.js
import Hls from 'hls.js';

interface VideoPlayerProps {
  title: string;
  url: string;
  onBack: () => void;
}

const VideoPlayer = ({ title, url, onBack }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualityLevels, setQualityLevels] = useState<Array<{ height: number; index: number }>>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const videoId = btoa(url).substring(0, 20); // Create unique ID for progress storage

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Load saved progress
    const savedProgress = localStorage.getItem(`video_progress_${videoId}`);
    if (savedProgress) {
      video.currentTime = parseFloat(savedProgress);
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setError(null);
        
        // Get available quality levels
        const levels = hls.levels.map((level, index) => ({
          height: level.height,
          index: index,
        }));
        setQualityLevels(levels);
        setCurrentQuality(-1); // -1 means auto
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Failed to load video. Please try again.');
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native support
      video.src = url;
      video.addEventListener('loadeddata', () => {
        setIsLoading(false);
        setError(null);
      });
      video.addEventListener('error', () => {
        setError('Failed to load video. Please try again.');
        setIsLoading(false);
      });
    } else {
      setError('HLS is not supported in this browser.');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url, videoId]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Error playing video:', error);
        toast({
          title: 'Playback Error',
          description: 'Unable to play video. Please try again.',
          variant: 'destructive',
        });
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen().catch(error => {
        console.error('Error entering fullscreen:', error);
      });
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    
    // Save progress every 5 seconds
    if (Math.floor(video.currentTime) % 5 === 0) {
      localStorage.setItem(`video_progress_${videoId}`, video.currentTime.toString());
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const changeQuality = (qualityIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityIndex;
      setCurrentQuality(qualityIndex);
      setShowSettings(false);
      toast({
        title: 'Quality Changed',
        description: qualityIndex === -1 ? 'Auto quality selected' : `${qualityLevels.find(q => q.index === qualityIndex)?.height}p selected`,
      });
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
    toast({
      title: 'Speed Changed',
      description: `Playback speed: ${rate}x`,
    });
  };

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Back to Lectures
          </Button>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <Badge variant="secondary" className="w-fit">
              HLS Stream
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Loading video...</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                  <div className="text-center">
                    <p className="text-red-400 mb-2">{error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                className="w-full aspect-video"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                controls={false}
              />

              {/* Custom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div 
                  className="w-full h-2 bg-white/30 rounded-full cursor-pointer mb-4"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>

                    <span className="text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Popover open={showSettings} onOpenChange={setShowSettings}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2" side="top" align="end">
                        <div className="space-y-2">
                          {/* Speed Control */}
                          <div>
                            <div className="text-sm font-medium mb-2 px-2">Playback Speed</div>
                            <div className="space-y-1">
                              {playbackRates.map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => changePlaybackRate(rate)}
                                  className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent ${
                                    playbackRate === rate ? 'bg-accent font-medium' : ''
                                  }`}
                                >
                                  {rate === 1 ? 'Normal' : `${rate}x`}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quality Control */}
                          {qualityLevels.length > 0 && (
                            <div className="pt-2 border-t">
                              <div className="text-sm font-medium mb-2 px-2">Quality</div>
                              <div className="space-y-1">
                                <button
                                  onClick={() => changeQuality(-1)}
                                  className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent ${
                                    currentQuality === -1 ? 'bg-accent font-medium' : ''
                                  }`}
                                >
                                  Auto
                                </button>
                                {qualityLevels
                                  .sort((a, b) => b.height - a.height)
                                  .map((level) => (
                                    <button
                                      key={level.index}
                                      onClick={() => changeQuality(level.index)}
                                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent ${
                                        currentQuality === level.index ? 'bg-accent font-medium' : ''
                                      }`}
                                    >
                                      {level.height}p
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>Progress is automatically saved as you watch</p>
              {currentTime > 0 && (
                <Badge variant="outline">
                  Last watched: {formatTime(currentTime)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoPlayer;