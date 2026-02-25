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

export default function VideoOverlay({ isVisible, onClose, dimmed = false }: VideoOverlayProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

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
          <svg width="0" height="0">
            <defs>
              <clipPath id="curvedEdge" clipPathUnits="objectBoundingBox">
                <path d="M 0,0 L 0.65,0 Q 1,0.5 0.65,1 L 0,1 Z" />
              </clipPath>
            </defs>
          </svg>
          
          <div
            className="relative w-full h-full"
            style={{
              clipPath: 'url(#curvedEdge)'
            }}
          >
            <video
              key={currentVideoIndex}
              src={videos[currentVideoIndex]}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
              className="w-full h-full object-cover transition-opacity duration-500"
              style={{ 
                playbackRate: 0.8,
                opacity: dimmed ? 0.2 : 1
              }}
              ref={(video) => {
                if (video) video.playbackRate = 0.8;
              }}
            />
            
            <div className="absolute inset-0 bg-white/10" />
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
