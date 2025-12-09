import { useState, useRef, useEffect } from "react";

function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only use the first image
  const imageUrl =
    Array.isArray(images) && images.length > 0 ? images[0] : null;

  // Check for video
  const videoId = videoUrl ? getYoutubeId(videoUrl) : null;

  // Build slides array: image first, then video (if exists)
  const slides: Array<{ type: "image" | "video"; content: string }> = [];
  if (imageUrl) {
    slides.push({ type: "image", content: imageUrl });
  }
  if (videoId) {
    slides.push({ type: "video", content: videoId });
  }

  // Nothing to show
  if (slides.length === 0) return null;

  const hasMultipleSlides = slides.length > 1;
  const currentSlide = slides[activeIndex];

  // Handle image load to capture dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setLoaded(true);
  };

  // Calculate aspect ratio from image dimensions
  const aspectRatio = imageDimensions
    ? `${imageDimensions.width} / ${imageDimensions.height}`
    : "16 / 9";

  // Navigate to next/prev slide
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Dynamic height based on isHovered prop
  const heightClass = isHovered ? "max-h-[500px]" : "";

  return (
    <div
      ref={containerRef}
      className={`w-full ${heightClass} bg-muted rounded-lg overflow-hidden relative ${className}`}
      data-testid={dataTestId}
      style={imageDimensions ? { aspectRatio } : undefined}>
      {/* Loading spinner - only for images */}
      {currentSlide.type === "image" && !loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Hidden image to always load and get dimensions */}
      {imageUrl && currentSlide.type === "video" && !imageDimensions && (
        <img
          src={imageUrl}
          alt=""
          onLoad={handleImageLoad}
          className="hidden"
        />
      )}

      {/* Image slide */}
      {currentSlide.type === "image" && (
        <img
          src={currentSlide.content}
          alt={alt || "Ad image"}
          onLoad={handleImageLoad}
          onError={() => {
            setLoaded(true);
            setError(true);
          }}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Video slide - uses same aspect ratio as image */}
      {currentSlide.type === "video" && (
        <div className="w-full h-full flex items-center justify-center">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${currentSlide.content}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            style={
              imageDimensions ? { aspectRatio } : { aspectRatio: "16 / 9" }
            }
          />
        </div>
      )}

      {/* Navigation arrows - only show if multiple slides */}
      {hasMultipleSlides && (
        <>
          {/* Previous button */}
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20"
            aria-label="Previous">
            <i className="fas fa-chevron-left text-white text-sm" />
          </button>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20"
            aria-label="Next">
            <i className="fas fa-chevron-right text-white text-sm" />
          </button>
        </>
      )}

      {/* Slide indicators */}
      {hasMultipleSlides && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all 
                pt-[3px]
                ${
                  index === activeIndex
                    ? "bg-primary text-primary-foreground scale-110"
                    : "bg-black/50 text-white hover:bg-black/70"
                }`}
              aria-label={slide.type === "image" ? "View image" : "View video"}>
              <i
                className={`fas ${
                  slide.type === "image" ? "fa-image" : "fa-play"
                } text-xs`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Error fallback */}
      {error && currentSlide.type === "image" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <i className="fas fa-image text-2xl text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
