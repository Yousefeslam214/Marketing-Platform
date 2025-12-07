import { useState } from "react";

function getYoutubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

interface ImageCarouselProps {
  images: string[];
  videoUrl?: string | null;
  alt?: string;
  dataTestId?: string;
  className?: string;
  isHovered?: boolean;
}

export function ImageCarousel({
  images,
  videoUrl,
  alt,
  dataTestId,
  className = "",
  isHovered = false,
}: ImageCarouselProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Only use the first image
  const imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : null;
  
  // Check for video if no image
  const videoId = videoUrl ? getYoutubeId(videoUrl) : null;

  // Nothing to show
  if (!imageUrl && !videoId) return null;

  // Dynamic height based on isHovered prop - auto height to fit full image
  const heightClass = isHovered ? "max-h-[500px]" : "";

  // Show video if no image but video exists
  if (!imageUrl && videoId) {
    return (
      <div
        className={`w-full h-64 bg-muted rounded-lg overflow-hidden ${className}`}
        data-testid={dataTestId}
      >
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full ${heightClass} bg-muted rounded-lg overflow-hidden relative flex items-center justify-center ${className}`}
      data-testid={dataTestId}
    >
      {/* Loading spinner */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Single image - object-contain to show full image */}
      <img
        src={imageUrl!}
        alt={alt || "Ad image"}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(true);
          setError(true);
        }}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <i className="fas fa-image text-2xl text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
