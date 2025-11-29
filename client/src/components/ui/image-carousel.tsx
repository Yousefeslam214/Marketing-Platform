import { useEffect, useRef, useState } from "react";

function getYoutubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function ImageCarousel({
  images,
  videoUrl,
  alt,
  dataTestId,
  intervalMs = 3000,
  autoPlay = true,
  isHovered = false,
}: {
  images: string[];
  videoUrl?: string | null;
  alt?: string;
  dataTestId?: string;
  intervalMs?: number;
  autoPlay?: boolean;
  isHovered?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Combine images and video into a single slides array
  const slides = [...(images || [])];
  if (videoUrl) {
    const videoId = getYoutubeId(videoUrl);
    if (videoId) {
      slides.push(`video:${videoId}`);
    }
  }

  if (slides.length === 0) return null;

  const isSingleSlide = slides.length === 1;
  const nextIndex = (i: number) => (i + 1) % slides.length;

  const prev = () => {
    if (isSingleSlide) return;
    setPrevIndex(index);
    setLoaded(false);
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  };

  const next = () => {
    if (isSingleSlide) return;
    setPrevIndex(index);
    setLoaded(false);
    setIndex((i) => (i + 1) % slides.length);
  };

  // Preload current image (if it is an image) and next image
  useEffect(() => {
    let cancelled = false;
    const currentSlide = slides[index];

    if (currentSlide.startsWith("video:")) {
      setLoaded(true);
    } else {
      const img = new Image();
      img.src = currentSlide;
      img.onload = () => {
        if (cancelled) return;
        setLoaded(true);
        // Preload next image quietly if it's an image
        const nextSlide = slides[nextIndex(index)];
        if (!nextSlide.startsWith("video:")) {
          const nextImg = new Image();
          nextImg.src = nextSlide;
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        setLoaded(true); // avoid stuck loader on error
      };
    }

    return () => {
      cancelled = true;
    };
  }, [index, slides]);

  // Clear prevIndex after the fade transition ends
  useEffect(() => {
    if (prevIndex === null) return;
    const timer = window.setTimeout(() => setPrevIndex(null), 500);
    return () => window.clearTimeout(timer);
  }, [prevIndex]);

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay || isPaused || isSingleSlide) return;

    // Don't autoplay if current slide is video
    if (slides[index].startsWith("video:")) return;

    timerRef.current = window.setTimeout(() => {
      setPrevIndex(index);
      setLoaded(false);
      setIndex((i) => nextIndex(i));
    }, intervalMs) as unknown as number;

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, autoPlay, isPaused, intervalMs, slides]);

  // Pause on hover handlers
  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  };
  const handleMouseLeave = () => setIsPaused(false);

  const renderSlide = (slide: string, isPrev: boolean = false) => {
    if (slide.startsWith("video:")) {
      const videoId = slide.split(":")[1];
      return (
        <div className={`w-full h-full flex items-center justify-center bg-black ${isPrev ? "absolute inset-0" : ""}`}>
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
      <img
        src={slide}
        alt={alt}
        className={`
          ${isHovered ? "h-[350px]" : "h-auto"}
          max-h-full w-auto max-w-full 
          object-contain 
          ${isPrev ? "absolute inset-0 transition-opacity duration-500 mx-auto" : "transition duration-500 ease-out mx-auto hover:scale-150 origin-center"}
        `}
        style={isPrev ? { opacity: loaded ? 0 : 1, transition: "opacity 0.5s" } : undefined}
      />
    );
  };

  return (
    <div
      className={`
            ${isHovered ? "h-[350px]" : ""}
        w-full h-40 bg-muted rounded-lg mb-4 overflow-hidden relative`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={dataTestId}
    >
      {/* Previous slide (fades out) */}
      {typeof prevIndex === "number" && slides[prevIndex] && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {renderSlide(slides[prevIndex], true)}
        </div>
      )}

      {/* Current slide */}
      {renderSlide(slides[index])}

      {/* Loading overlay */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Controls */}
      {!isSingleSlide && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 z-10"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1 z-10"
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrevIndex(index);
                  setLoaded(false);
                  setIndex(i);
                }}
                className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
