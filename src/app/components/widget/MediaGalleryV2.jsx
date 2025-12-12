// Shopify Structure Component - Refactored for better UX and performance

"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";

const MediaGallery = ({ mediaItems = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const containerRef = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const mainImageRef = useRef(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Get active media item
  const activeItem = mediaItems[activeIndex] || null;

  // Reset states when mediaItems change
  useEffect(() => {
    setActiveIndex(0);
    setImageError(false);
  }, [mediaItems]);

  // Auto-scroll thumbnail into view when active index changes
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const thumbnails =
        thumbnailContainerRef.current.querySelectorAll("[data-thumbnail]");
      const activeThumbnail = thumbnails[activeIndex];

      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mediaItems.length === 0) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "Escape":
          if (isFullscreen) {
            setIsFullscreen(false);
          } else if (isZoomed) {
            setIsZoomed(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, mediaItems.length, isFullscreen, isZoomed]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (mediaItems.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % mediaItems.length);
    setImageError(false);
  }, [mediaItems.length]);

  const handlePrevious = useCallback(() => {
    if (mediaItems.length === 0) return;
    setActiveIndex(
      (prev) => (prev - 1 + mediaItems.length) % mediaItems.length
    );
    setImageError(false);
  }, [mediaItems.length]);

  const handleThumbnailClick = useCallback((index) => {
    setActiveIndex(index);
    setImageError(false);
  }, []);

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    setIsZoomed(false);
  }, []);

  // Disable body scroll and page interactions when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Disable scrolling
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Add class to body to disable ProductOptionItem links
      document.body.classList.add("gallery-fullscreen-active");

      return () => {
        // Re-enable scrolling and restore position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);

        // Remove the class
        document.body.classList.remove("gallery-fullscreen-active");
      };
    }
  }, [isFullscreen]);

  // Image load handlers
  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // If no media items, show placeholder
  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Icon
            icon="mdi:image-off"
            className="mx-auto text-6xl text-gray-400 mb-2"
          />
          <p className="text-gray-500">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main Image Display */}
        <div className="w-full relative">
          <div
            ref={mainImageRef}
            className="relative w-full aspect-[5/3] sm:aspect-1 bg-white rounded-lg shadow-md overflow-hidden group"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            role="tabpanel"
            aria-label={`Image ${activeIndex + 1} of ${mediaItems.length}`}
          >
            {/* Error State */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Icon
                    icon="mdi:image-broken"
                    className="mx-auto text-5xl text-gray-400 mb-2"
                  />
                  <p className="text-gray-500 text-sm">Failed to load image</p>
                </div>
              </div>
            )}

            {/* Main Image */}
            {activeItem && !imageError && (
              <div
                className={`relative w-full h-full cursor-zoom-in transition-transform duration-300 ${
                  isZoomed ? "scale-150 cursor-zoom-out z-30" : ""
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <Image
                  src={activeItem.src}
                  alt={activeItem.alt || `Product image ${activeIndex + 1}`}
                  className="object-contain p-4"
                  fill
                  sizes="(max-width: 640px) 100vw, 80vw"
                  priority={activeIndex === 0}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            )}

            {/* Navigation Arrows - Desktop */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                  aria-label="Previous image"
                >
                  <Icon icon="mdi:chevron-left" className="text-2xl" />
                </button>
                <button
                  onClick={handleNext}
                  className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
                  aria-label="Next image"
                >
                  <Icon icon="mdi:chevron-right" className="text-2xl" />
                </button>
              </>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
              aria-label="Toggle fullscreen"
            >
              <Icon icon="mdi:fullscreen" className="text-xl" />
            </button>

            {/* Image Counter */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                {activeIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>

        </div>

        {/* Thumbnail Gallery - Horizontal Below Main Image */}
        <div
          ref={thumbnailContainerRef}
          className="w-full p-1 flex flex-row gap-2 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
          role="tablist"
          aria-label="Product image thumbnails"
        >
          {mediaItems.map((item, index) => (
            <button
              key={`thumbnail-${index}`}
              data-thumbnail
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0 w-[72px] h-[72px] sm:w-[90px] sm:h-[90px] bg-white rounded-md shadow-sm transition-all duration-200 border-2 ${
                index === activeIndex
                  ? "shadow-md border-neutral-300"
                  : "hover:shadow-md border-[transparent]"
              }`}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1} of ${mediaItems.length}`}
            >
              <Image
                src={item.src}
                alt={item.alt || `Thumbnail ${index + 1}`}
                className="rounded-md object-contain p-1"
                fill
                sizes="(max-width: 640px) 72px, 90px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/95 !z-[99999] flex items-center justify-center p-4"
          onClick={toggleFullscreen}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image view"
          style={{ zIndex: 99999 }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors !z-[100000] cursor-pointer bg-black/30 hover:bg-black/50 rounded-full p-2"
            aria-label="Close fullscreen"
            type="button"
            style={{ zIndex: 100000 }}
          >
            <Icon icon="mdi:close" className="text-3xl" />
          </button>

          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors !z-[100000] cursor-pointer bg-black/30 hover:bg-black/50 rounded-full p-2"
                aria-label="Previous image"
                type="button"
                style={{ zIndex: 100000 }}
              >
                <Icon icon="mdi:chevron-left" className="text-4xl" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors !z-[100000] cursor-pointer bg-black/30 hover:bg-black/50 rounded-full p-2"
                aria-label="Next image"
                type="button"
                style={{ zIndex: 100000 }}
              >
                <Icon icon="mdi:chevron-right" className="text-4xl" />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] !z-[99999]"
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 99999 }}
          >
            {activeItem && (
              <Image
                src={activeItem.src}
                alt={activeItem.alt || `Product image ${activeIndex + 1}`}
                className="object-contain"
                fill
                sizes="100vw"
              />
            )}
          </div>

          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full !z-[100000]"
            style={{ zIndex: 100000 }}
          >
            {activeIndex + 1} / {mediaItems.length}
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;
