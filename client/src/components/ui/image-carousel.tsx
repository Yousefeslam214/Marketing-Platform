import { useEffect, useRef, useState } from "react";

export function ImageCarousel({
  images,
  alt,
  dataTestId,
  intervalMs = 3000,
  autoPlay = true,
}: {
  images: string[];
  alt?: string;
  dataTestId?: string;
  intervalMs?: number;
  autoPlay?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  if (!images || images.length === 0) return null;

  const nextIndex = (i: number) => (i + 1) % images.length;
  const prev = () => {
    setPrevIndex(index);
    setLoaded(false);
    setIndex((i) => (i - 1 + images.length) % images.length);
  };
  const next = () => {
    setPrevIndex(index);
    setLoaded(false);
    setIndex((i) => (i + 1) % images.length);
  };

  // Preload current image and next image to smooth transitions
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = images[index];
    img.onload = () => {
      if (cancelled) return;
      setLoaded(true);
      // Preload next image quietly
      const nextImg = new Image();
      nextImg.src = images[nextIndex(index)];
    };
    img.onerror = () => {
      if (cancelled) return;
      setLoaded(true); // avoid stuck loader on error
    };
    return () => {
      cancelled = true;
    };
  }, [index, images]);

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay || isPaused) return;
    timerRef.current = window.setTimeout(() => {
      setPrevIndex(index);
      setLoaded(false);
      setIndex((i) => nextIndex(i));
    }, intervalMs) as unknown as number;
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, autoPlay, isPaused, intervalMs, images]);

  // Pause on hover handlers
  const handleMouseEnter = () => {
    setIsPaused(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
  };
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div
      className="w-full h-40 bg-muted rounded-lg mb-4 overflow-hidden relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Previous image (fades out) */}
      {typeof prevIndex === "number" && images[prevIndex] && (
        <img
          src={images[prevIndex]}
          alt={alt}
          className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
          style={{ opacity: loaded ? 0 : 1 }}
          aria-hidden
        />
      )}

      {/* Current image (fades in when loaded) */}
      <img
        src={images[index]}
        alt={alt}
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        data-testid={dataTestId}
      />

      {/* Loading overlay while current image is loading */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Controls */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous image"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1">
        <i className="fas fa-chevron-left"></i>
      </button>

      <button
        type="button"
        onClick={next}
        aria-label="Next image"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1">
        <i className="fas fa-chevron-right"></i>
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setPrevIndex(index);
              setLoaded(false);
              setIndex(i);
            }}
            className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
