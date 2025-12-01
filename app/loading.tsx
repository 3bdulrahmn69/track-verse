export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo/Brand */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">TrackVerse</h1>
          <p className="text-muted-foreground">Your Media Journey Awaits</p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>

        {/* Loading Text */}
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading your content...
        </p>

        {/* Media Types */}
        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse"></div>
            <span>Movies</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <span>TV Shows</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            <span>Books</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse [animation-delay:0.6s]"></div>
            <span>Games</span>
          </div>
        </div>
      </div>
    </div>
  );
}
