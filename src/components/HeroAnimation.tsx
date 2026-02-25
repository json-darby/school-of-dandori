import { motion } from 'motion/react';
import { Briefcase, PartyPopper } from 'lucide-react';

export default function HeroAnimation() {
  return (
    <div className="relative w-64 h-64 mx-auto cursor-pointer group perspective-1000">
      {/* The "Adult" Outer Shell */}
      <motion.div 
        className="absolute inset-0 bg-stone-200 rounded-full flex items-center justify-center border-4 border-stone-300 shadow-lg z-20 overflow-hidden"
        whileHover={{ 
          scale: 1.1,
          opacity: 0,
          transition: { duration: 0.5 }
        }}
      >
        <div className="text-stone-400 flex flex-col items-center">
          <Briefcase className="w-24 h-24 mb-2" />
          <span className="font-mono text-sm uppercase tracking-widest">Serious Mode</span>
        </div>
      </motion.div>

      {/* The "Inner Child" Core */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-dandori-yellow via-rose-400 to-dandori-light rounded-full flex items-center justify-center shadow-xl z-10"
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="text-white flex flex-col items-center">
          <PartyPopper className="w-24 h-24 mb-2 drop-shadow-md" />
          <span className="font-serif text-lg font-bold tracking-wide">Play Time!</span>
        </div>
      </motion.div>
      
      {/* Burst particles effect (simulated with absolute divs) */}
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         <div className="absolute top-0 left-1/2 w-2 h-2 bg-dandori-yellow rounded-full animate-ping" />
         <div className="absolute bottom-0 left-1/4 w-3 h-3 bg-rose-400 rounded-full animate-ping delay-100" />
         <div className="absolute top-1/4 right-0 w-2 h-2 bg-dandori-light rounded-full animate-ping delay-200" />
      </div>
    </div>
  );
}
