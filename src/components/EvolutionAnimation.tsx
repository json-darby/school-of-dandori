import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface EvolutionAnimationProps {
  onComplete: () => void;
}

export default function EvolutionAnimation({ onComplete }: EvolutionAnimationProps) {
  const [stage, setStage] = useState<'raining' | 'clearing' | 'growing'>('raining');

  const handleClick = () => {
    if (stage !== 'raining') return;
    
    window.dispatchEvent(new CustomEvent('svg-clicked'));
    
    setStage('clearing');
    
    setTimeout(() => {
      // 2. Plant begins to grow
      setStage('growing');
      
      setTimeout(() => {
        // 3. Animation complete, transition page
        onComplete();
      }, 4000); // Wait for full bloom sequence
    }, 800);
  };

  return (
    <div 
      className="relative w-72 h-72 mx-auto cursor-pointer group"
      onClick={handleClick}
    >
      {/* Circular Container */}
      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] group-hover:border-dandori-yellow group-hover:shadow-[0_10px_60px_-5px_rgba(244,197,66,0.8)] transition-all duration-700">
        
        {/* Sky */}
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            backgroundColor: stage === 'raining' ? '#9ca3af' : '#bae6fd' 
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Sun */}
        <motion.div
          className="absolute top-8 right-12 w-14 h-14 rounded-full bg-dandori-yellow shadow-[0_0_40px_rgba(242,176,53,0.6)]"
          initial={{ y: 40, opacity: 0 }}
          animate={{ 
            y: stage === 'raining' ? 40 : 0, 
            opacity: stage === 'raining' ? 0 : 1 
          }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />

        {/* Rain */}
        <AnimatePresence>
          {stage === 'raining' && (
            <motion.div 
              className="absolute inset-0 z-10"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-5 bg-blue-300/60 rounded-full"
                  initial={{ 
                    x: Math.random() * 300 - 20, 
                    y: -30, 
                    rotate: 10 
                  }}
                  animate={{ 
                    y: 350, 
                    x: `+=${60}`,
                  }}
                  transition={{ 
                    duration: 0.5 + Math.random() * 0.3, 
                    repeat: Infinity, 
                    delay: Math.random() * 1,
                    ease: "linear"
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Soil */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-[#5d4037] z-20 border-t-4 border-[#4e342e]">
           <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,_#3e2723_2px,_transparent_2px)] bg-[length:12px_12px]" />
        </div>

        <div className="absolute inset-0 z-30 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 288 288">
            
            <motion.ellipse
              cx="144" cy="240" rx="7" ry="5"
              fill="#271c19"
              initial={{ scale: 1 }}
              animate={{ scale: stage === 'growing' ? 0.8 : 1 }}
              transition={{ duration: 1 }}
            />

            <motion.path
              d="M144 240 Q 135 170 144 100"
              fill="none"
              stroke="#53733C"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: stage === 'growing' ? 1 : 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            <motion.path
              d="M142 180 Q 100 170 90 140 Q 120 150 142 180"
              fill="#9CBF50"
              initial={{ scale: 0, opacity: 0 }}
              animate={stage === 'growing' ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8, type: "spring", bounce: 0.4 }}
              style={{ transformOrigin: "142px 180px" }}
            />

            <motion.path
              d="M146 150 Q 180 140 190 110 Q 160 120 146 150"
              fill="#9CBF50"
              initial={{ scale: 0, opacity: 0 }}
              animate={stage === 'growing' ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.1, type: "spring", bounce: 0.4 }}
              style={{ transformOrigin: "146px 150px" }}
            />

            <motion.g
              initial={{ scale: 0, y: 10 }}
              animate={stage === 'growing' ? { scale: 1, y: 0 } : { scale: 0, y: 10 }}
              transition={{ duration: 1, delay: 1.6, type: "spring", bounce: 0.5 }}
              style={{ transformOrigin: "144px 100px" }}
            >
              <path d="M144 105 Q 110 70 125 50 Q 135 70 144 105" fill="#fb7185" />
              <path d="M144 105 Q 178 70 163 50 Q 153 70 144 105" fill="#fb7185" />
              <path d="M144 105 Q 125 55 144 45 Q 163 55 144 105" fill="#f43f5e" />
              <circle cx="144" cy="98" r="4" fill="#F2B035" />
            </motion.g>

            <motion.g
              initial={{ opacity: 1 }}
              animate={{ opacity: stage === 'raining' ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {[...Array(20)].map((_, i) => {
                const x = 30 + (i * 12) + (Math.sin(i) * 15);
                const delay = Math.random() * 2;
                const duration = 0.8 + Math.random() * 0.4;
                return (
                  <motion.line
                    key={i}
                    x1={x}
                    y1={-10}
                    x2={x + 3}
                    y2={10}
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity={0.6}
                    initial={{ y: -20 }}
                    animate={{ y: 300 }}
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      delay: delay,
                      ease: "linear",
                      repeatDelay: 0
                    }}
                  />
                );
              })}
            </motion.g>

          </svg>
        </div>

      </div>

      {/* Prompt */}
      <motion.div 
        className="absolute -bottom-8 left-0 right-0 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="font-mono text-xs tracking-widest text-dandori-dark uppercase font-bold"
           style={{
             textShadow: '0 2px 10px rgba(255,255,255,0.9), 0 4px 20px rgba(255,255,255,0.6)'
           }}>
          {stage === 'raining' ? 'Nurture the Soil' : 'Watch it Bloom'}
        </p>
      </motion.div>
    </div>
  );
}
