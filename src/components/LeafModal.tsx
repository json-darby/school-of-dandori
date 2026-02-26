import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Course } from '../types';

interface LeafModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: () => void;
  bookingClicked: boolean;
}

export default function LeafModal({ course, isOpen, onClose, onBook, bookingClicked }: LeafModalProps) {
  if (!course) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (!bookingClicked && e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateZ: -5 }}
            animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateZ: 5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-5xl aspect-[1.15/1] max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* SVG Tree Stump Cross-Section */}
            <svg
              viewBox="0 0 1000 1000"
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
            >
              <defs>
                {/* Wood gradient */}
                <radialGradient id={`woodGradient-${course.ID}`}>
                  <stop offset="0%" stopColor="#d4a574" />
                  <stop offset="40%" stopColor="#b8956a" />
                  <stop offset="70%" stopColor="#9d7f5a" />
                  <stop offset="100%" stopColor="#7a6347" />
                </radialGradient>

                {/* Bark texture */}
                <pattern id={`barkTexture-${course.ID}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#5a4a3a" />
                  <path d="M0,10 Q5,8 10,10 T20,10" stroke="#4a3a2a" strokeWidth="2" fill="none" />
                </pattern>
              </defs>

              {/* Outer bark edge */}
              <circle
                cx="500"
                cy="500"
                r="480"
                fill={`url(#barkTexture-${course.ID})`}
                stroke="#3a2a1a"
                strokeWidth="4"
              />

              {/* Main wood surface */}
              <circle
                cx="500"
                cy="500"
                r="460"
                fill={`url(#woodGradient-${course.ID})`}
              />

              {/* Tree rings - 6 rings with varied thickness */}
              {[400, 320, 240, 160, 100, 60].map((r, i) => (
                <circle
                  key={i}
                  cx="500"
                  cy="500"
                  r={r}
                  fill="none"
                  stroke={i % 2 === 0 ? 'rgba(90,70,50,0.3)' : 'rgba(90,70,50,0.15)'}
                  strokeWidth={i % 2 === 0 ? '3' : '1.5'}
                />
              ))}

              {/* Additional detail rings between main rings */}
              {[360, 280, 200, 130, 80].map((r, i) => (
                <circle
                  key={`detail-${i}`}
                  cx="500"
                  cy="500"
                  r={r}
                  fill="none"
                  stroke="rgba(90,70,50,0.08)"
                  strokeWidth="1"
                />
              ))}

              {/* Center knot/heart with more detail */}
              <circle
                cx="500"
                cy="500"
                r="45"
                fill="#6a5a4a"
                opacity="0.4"
              />
              <circle
                cx="500"
                cy="500"
                r="30"
                fill="#5a4a3a"
                opacity="0.5"
              />
              <circle
                cx="500"
                cy="500"
                r="15"
                fill="#4a3a2a"
                opacity="0.6"
              />

              {/* Cracks in the wood - more detailed */}
              <path
                d="M500,40 Q505,200 500,360"
                stroke="rgba(90,70,50,0.35)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M500,640 Q495,800 500,960"
                stroke="rgba(90,70,50,0.35)"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M40,500 Q200,495 360,500"
                stroke="rgba(90,70,50,0.25)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M640,500 Q800,505 960,500"
                stroke="rgba(90,70,50,0.25)"
                strokeWidth="2"
                fill="none"
              />

              {/* Wood grain texture lines */}
              <path
                d="M300,100 Q350,150 400,100 T500,100"
                stroke="rgba(90,70,50,0.1)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M600,200 Q650,250 700,200 T800,200"
                stroke="rgba(90,70,50,0.1)"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M200,700 Q250,750 300,700 T400,700"
                stroke="rgba(90,70,50,0.1)"
                strokeWidth="1"
                fill="none"
              />

              {/* Animated Ladybug - stays on outer ring */}
              <g>
                <circle cx="0" cy="0" r="10" fill="#e74c3c">
                  <animateMotion
                    dur="30s"
                    repeatCount="indefinite"
                    path="M500,80 A420,420 0 1,1 499,80"
                  />
                </circle>
                <circle cx="0" cy="-3" r="4" fill="black">
                  <animateMotion
                    dur="30s"
                    repeatCount="indefinite"
                    path="M500,80 A420,420 0 1,1 499,80"
                  />
                </circle>
                <circle cx="-2" cy="-2" r="1.5" fill="black">
                  <animateMotion
                    dur="30s"
                    repeatCount="indefinite"
                    path="M500,80 A420,420 0 1,1 499,80"
                  />
                </circle>
                <circle cx="2" cy="-2" r="1.5" fill="black">
                  <animateMotion
                    dur="30s"
                    repeatCount="indefinite"
                    path="M500,80 A420,420 0 1,1 499,80"
                  />
                </circle>
              </g>

              {/* Animated Ant - middle ring */}
              <g>
                <ellipse cx="0" cy="0" rx="7" ry="5" fill="#2c3e50">
                  <animateMotion
                    dur="20s"
                    repeatCount="indefinite"
                    path="M500,220 A280,280 0 1,0 499,220"
                  />
                </ellipse>
                <circle cx="0" cy="-2" r="3" fill="#2c3e50">
                  <animateMotion
                    dur="20s"
                    repeatCount="indefinite"
                    path="M500,220 A280,280 0 1,0 499,220"
                  />
                </circle>
              </g>

              {/* Animated Beetle - inner ring */}
              <g>
                <ellipse cx="0" cy="0" rx="8" ry="6" fill="#654321">
                  <animateMotion
                    dur="25s"
                    repeatCount="indefinite"
                    path="M500,340 A160,160 0 1,1 499,340"
                  />
                </ellipse>
                <circle cx="-2" cy="-1" r="1.5" fill="#8b6914">
                  <animateMotion
                    dur="25s"
                    repeatCount="indefinite"
                    path="M500,340 A160,160 0 1,1 499,340"
                  />
                </circle>
              </g>

              {/* Flying Bee - random figure-8 pattern around center */}
              <g>
                {/* Bee body */}
                <ellipse cx="0" cy="0" rx="8" ry="6" fill="#f4a300">
                  <animateMotion
                    dur="18s"
                    repeatCount="indefinite"
                    path="M500,300 Q600,400 500,500 Q400,400 500,300 Q600,200 500,100 Q400,200 500,300"
                  />
                </ellipse>
                {/* Black stripes */}
                <line x1="-3" y1="-4" x2="-3" y2="4" stroke="black" strokeWidth="2">
                  <animateMotion
                    dur="18s"
                    repeatCount="indefinite"
                    path="M500,300 Q600,400 500,500 Q400,400 500,300 Q600,200 500,100 Q400,200 500,300"
                  />
                </line>
                <line x1="3" y1="-4" x2="3" y2="4" stroke="black" strokeWidth="2">
                  <animateMotion
                    dur="18s"
                    repeatCount="indefinite"
                    path="M500,300 Q600,400 500,500 Q400,400 500,300 Q600,200 500,100 Q400,200 500,300"
                  />
                </line>
                {/* Wings */}
                <ellipse cx="-4" cy="-3" rx="5" ry="3" fill="white" opacity="0.7">
                  <animateMotion
                    dur="18s"
                    repeatCount="indefinite"
                    path="M500,300 Q600,400 500,500 Q400,400 500,300 Q600,200 500,100 Q400,200 500,300"
                  />
                  <animate attributeName="ry" values="3;4;3" dur="0.2s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="4" cy="-3" rx="5" ry="3" fill="white" opacity="0.7">
                  <animateMotion
                    dur="18s"
                    repeatCount="indefinite"
                    path="M500,300 Q600,400 500,500 Q400,400 500,300 Q600,200 500,100 Q400,200 500,300"
                  />
                  <animate attributeName="ry" values="3;4;3" dur="0.2s" repeatCount="indefinite" />
                </ellipse>
              </g>
            </svg>

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[85%] h-[85%] overflow-y-auto pointer-events-auto custom-scrollbar">
                <div className="px-6 py-5">
                  {/* Course Type Badge */}
                  <div className="text-center mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-dandori-dark border-2 border-dandori-dark/20 shadow-sm">
                      {course['Course Type']}
                    </span>
                  </div>

                  {/* Course Name */}
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-4 text-center leading-tight">
                    {course['Course Name']}
                  </h2>

                  {/* Info Grid - Compact */}
                  <div className="grid grid-cols-3 gap-3 mb-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="text-center">
                      <p className="text-xs text-dandori-dark/60 mb-1 font-semibold">Instructor</p>
                      <p className="font-medium text-dandori-dark text-sm">{course.Instructor}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-dandori-dark/60 mb-1 font-semibold">Location</p>
                      <p className="font-medium text-dandori-dark text-sm">{course.Location}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-dandori-dark/60 mb-1 font-semibold">Cost</p>
                      <p className="font-mono text-xl font-bold text-dandori-yellow">{course.Cost}</p>
                    </div>
                  </div>

                  {/* Description - Full Width at Top */}
                  <div className="mb-3 bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                    <h3 className="font-bold text-dandori-dark mb-2 text-base">Description</h3>
                    <p className="text-dandori-dark/80 leading-relaxed text-sm">{course.Description}</p>
                  </div>

                  {/* Learning Objectives - Full Width */}
                  <div className="mb-3 bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                    <h3 className="font-bold text-dandori-dark mb-2 text-base">Learning Objectives</h3>
                    <p className="text-dandori-dark/80 leading-relaxed text-sm">{course['Learning Objectives']}</p>
                  </div>

                  {/* Skills - Compact */}
                  <div className="mb-3 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <h3 className="font-bold text-dandori-dark mb-2 text-base">Skills Developed</h3>
                    <div className="flex flex-wrap gap-2">
                      {course['Skills Developed'].split(',').map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-dandori-light/30 text-dandori-dark rounded-full text-sm font-medium border border-dandori-dark/10"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Materials */}
                  <div className="mb-4 bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                    <h3 className="font-bold text-dandori-dark mb-2 text-base">Provided Materials</h3>
                    <p className="text-dandori-dark/80 leading-relaxed text-sm">{course['Provided Materials']}</p>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={onBook}
                    className={`w-full py-3 rounded-full font-bold text-base transition-all shadow-lg ${
                      bookingClicked
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-dandori-yellow text-dandori-dark hover:bg-dandori-cream hover:scale-105'
                    }`}
                  >
                    {bookingClicked ? 'This feature is out of scope for this project, sorry!' : 'Book This Course'}
                  </button>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-dandori-dark hover:bg-white transition-all shadow-lg z-10 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
