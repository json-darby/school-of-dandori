import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VideoOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  dimmed?: boolean;
}

const videos = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4'
];

/**
 * Renders the video overlay container component.
 * 
 * Displays a custom curved side-panel featuring continuous looping video 
 * transitions, with controls to manage playback speed and overlay visibility.
 * 
 * @param props - The component properties.
 * @param props.isVisible - Determines if the video overlay is currently active.
 * @param props.onClose - Handler invoked when closing the overlay.
 * @param props.dimmed - Optional flag to dim the video display opacity.
 */
export default function VideoOverlay({ isVisible, onClose, dimmed = false }: VideoOverlayProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  /**
   * Advances the sequence to the next video when playback completes.
   */
  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  /**
   * Resets the video sequence when the overlay is toggled visible.
   */
  useEffect(() => {
    if (isVisible) {
      setCurrentVideoIndex(0);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ 
            type: 'tween',
            ease: [0.65, 0, 0.35, 1],
            duration: 1.2
          }}
          className="absolute left-0 top-0 bottom-0 w-[60%] z-[5]"
        >
          {/* Defines the custom SVG clipping path to create a curved aesthetic edge. */}
          <svg width="0" height="0">
            <defs>
              <clipPath id="curvedEdge" clipPathUnits="objectBoundingBox">
                <path d="M 0,0 L 0.65,0 Q 1,0.5 0.65,1 L 0,1 Z" />
              </clipPath>
            </defs>
          </svg>
          
          {/* Clips the video display area using the custom curved path. */}
          <div
            className="relative w-full h-full transition-opacity duration-500"
            style={{
              clipPath: 'url(#curvedEdge)',
              opacity: dimmed ? 0.2 : 1
            }}
          >
            {videos.map((src, index) => (
              <video
                key={src}
                src={src}
                preload="auto"
                muted
                playsInline
                onEnded={handleVideoEnd}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentVideoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                ref={(video) => {
                  if (video) {
                    video.playbackRate = 0.8;
                    if (index === currentVideoIndex) {
                      if (video.currentTime >= video.duration || video.paused) {
                        video.currentTime = 0;
                        video.play().catch(() => {});
                      }
                    } else {
                      // We deliberately don't reset currentTime to 0 here.
                      // If the video just ended, it will sit on its final frame
                      // gracefully while fading out behind the new video.
                      video.pause();
                    }
                  }
                }}
              />
            ))}
            
            <div className="absolute inset-0 bg-white/10 z-20 pointer-events-none" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-dandori-dark hover:bg-white transition-all shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
