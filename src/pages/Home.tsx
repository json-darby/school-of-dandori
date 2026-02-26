import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, User, Tag, ArrowRight, Loader2, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCourses } from '../utils/csvParser';
import { Course } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EvolutionAnimation from '../components/EvolutionAnimation';
import FilterBar from '../components/FilterBar';
import VideoOverlay from '../components/VideoOverlay';
import LeafModal from '../components/LeafModal';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<'landing' | 'search'>('landing');
  const [placeholder, setPlaceholder] = useState('Find Your Course');
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [bookingClicked, setBookingClicked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [tileShape, setTileShape] = useState<'acorn' | 'leaf'>('acorn');
  
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    maxPrice: 1000,
    sortBy: 'recommended'
  });
  const [limit, setLimit] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRandomCourse = () => {
    setIsSpinning(true);
    setSearchTerm('');
    setTimeout(() => {
      const availableCourses = courses.filter(c => c['Course Name'] !== searchTerm);
      const randomCourse = availableCourses[Math.floor(Math.random() * availableCourses.length)];
      setSearchTerm(randomCourse['Course Name']);
      setIsSpinning(false);
    }, 2000);
  };

  useEffect(() => {
    if (viewState === 'search') {
      setTimeout(() => {
        setPlaceholder('Search by name, description...');
      }, 2500);
    } else {
      setPlaceholder('Find Your Course');
    }
  }, [viewState]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'search') {
      setViewState('search');
    }

    const handleShowCourses = () => setViewState('search');
    const handleGoHome = () => setViewState('landing');
    
    window.addEventListener('show-courses', handleShowCourses);
    window.addEventListener('go-home', handleGoHome);
    
    return () => {
      window.removeEventListener('show-courses', handleShowCourses);
      window.removeEventListener('go-home', handleGoHome);
    };
  }, []);

  useEffect(() => {
    getCourses()
      .then((data) => {
        setCourses(data);
        // Initialise max price based on data
        const max = Math.max(...data.map(c => parseFloat(c.Cost.replace(/[£,]/g, '')) || 0));
        setFilters(prev => ({ ...prev, maxPrice: max }));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load courses', err);
        setLoading(false);
      });
  }, []);

  // Derived Data for Filters
  const locations = useMemo(() => [...new Set(courses.map(c => c.Location))].sort(), [courses]);
  const types = useMemo(() => [...new Set(courses.map(c => c['Course Type']))].sort(), [courses]);
  const priceRange = useMemo(() => {
    const prices = courses.map(c => parseFloat(c.Cost.replace(/[£,]/g, '')) || 0);
    return { min: Math.min(...prices, 0), max: Math.max(...prices, 100) };
  }, [courses]);

  // Filtering and Sorting Logic
  const filteredCourses = useMemo(() => {
    let result = courses.filter(course => {
      const price = parseFloat(course.Cost.replace(/[£,]/g, '')) || 0;
      const matchesLocation = !filters.location || course.Location === filters.location;
      const matchesType = !filters.type || course['Course Type'] === filters.type;
      const matchesPrice = price <= filters.maxPrice;
      const matchesSearch = !searchTerm || 
        course['Course Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.Description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesLocation && matchesType && matchesPrice && matchesSearch;
    });

    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => (parseFloat(a.Cost.replace(/[£,]/g, '')) || 0) - (parseFloat(b.Cost.replace(/[£,]/g, '')) || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (parseFloat(b.Cost.replace(/[£,]/g, '')) || 0) - (parseFloat(a.Cost.replace(/[£,]/g, '')) || 0));
        break;
      case 'name_asc':
        result.sort((a, b) => a['Course Name'].localeCompare(b['Course Name']));
        break;
      default:
        // Recommended (default order or random)
        break;
    }

    return result;
  }, [courses, filters, searchTerm]);

  const displayedCourses = filteredCourses.slice(0, limit);

  return (
    <div 
      className="min-h-screen flex flex-col bg-dandori-white font-sans text-dandori-dark relative"
      style={{
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-dandori-white/30 pointer-events-none" style={{ zIndex: 0 }} />
      
      <VideoOverlay isVisible={showVideo} onClose={() => setShowVideo(false)} dimmed={viewState === 'search'} />
      
      <div className="relative z-10">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh] relative">
        {/* Structural Background Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-dandori-dark/10" />
          <div className="absolute right-8 top-0 bottom-0 w-px bg-dandori-dark/10" />
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-dandori-dark/10 hidden md:block" />
          <div className="absolute right-1/4 top-0 bottom-0 w-px bg-dandori-dark/10 hidden md:block" />
        </div>

        <AnimatePresence mode="wait">
          {viewState === 'landing' ? (
            <motion.div 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center w-full max-w-5xl mx-auto z-10 flex flex-col items-center"
            >
              <div className="mb-12 w-full">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-dandori-dark tracking-tight whitespace-normal md:whitespace-nowrap mb-6"
                    style={{
                      textShadow: '0 2px 20px rgba(255,255,255,0.9), 0 4px 40px rgba(255,255,255,0.7), 0 0 60px rgba(255,255,255,0.5)'
                    }}>
                  Permission to <span className="text-dandori-yellow italic relative inline-block"
                    style={{
                      textShadow: '0 2px 20px rgba(255,255,255,0.9), 0 4px 40px rgba(255,255,255,0.7), 0 0 60px rgba(255,255,255,0.5)'
                    }}>
                    Play Again
                    <motion.svg 
                      className="absolute -bottom-2 left-0 w-full h-3 text-dandori-light"
                      viewBox="0 0 100 10" 
                      preserveAspectRatio="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                      style={{
                        filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.8))'
                      }}
                    >
                      <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
                    </motion.svg>
                  </span>
                </h1>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-2xl mx-auto"
                >
                  <p className="text-xl text-dandori-dark font-semibold leading-relaxed italic"
                     style={{
                       textShadow: '0 2px 15px rgba(255,255,255,0.9), 0 4px 30px rgba(255,255,255,0.6)'
                     }}>
                    Step away from screens. Step into life.
                  </p>
                </motion.div>
              </div>
              
              <div className="flex justify-center mb-12">
                <EvolutionAnimation onComplete={() => setViewState('search')} />
              </div>

              <button
                onClick={() => setShowVideo(!showVideo)}
                className="px-6 py-2 bg-white/80 backdrop-blur-sm text-dandori-dark rounded-full font-medium hover:bg-white transition-all shadow-sm border border-dandori-dark/10"
              >
                🎬 Rediscover Play
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-7xl"
            >
              
              <div className="mb-6 flex gap-3 max-w-2xl mx-auto">
                <div className="relative group flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-dandori-dark/40 group-focus-within:text-dandori-light transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-dandori-light rounded-full shadow-sm text-dandori-dark focus:outline-none focus:ring-4 focus:ring-dandori-light/10 transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleRandomCourse}
                  disabled={isSpinning}
                  title="Cosmic Pick - Random Course"
                  className="w-14 h-14 bg-dandori-yellow text-dandori-dark rounded-full font-medium hover:bg-dandori-cream transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center text-2xl"
                >
                  <span className={isSpinning ? 'animate-spin' : ''}>✨</span>
                </button>
              </div>

              {/* Filter Section */}
              <FilterBar 
                locations={locations} 
                types={types} 
                filters={filters} 
                setFilters={setFilters} 
                priceRange={priceRange}
                limit={limit}
                setLimit={setLimit}
              />

              {/* Results Section */}
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-12 h-12 text-dandori-light animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-dandori-dark/60 font-medium">
                      Showing {displayedCourses.length} of {courses.length} courses
                    </span>
                    
                    {/* Shape Toggle Button - Emoji Only */}
                    <button
                      onClick={() => setTileShape(prev => prev === 'acorn' ? 'leaf' : 'acorn')}
                      className="w-12 h-12 bg-white border-2 border-dandori-dark/10 rounded-full hover:border-dandori-light hover:bg-dandori-light/5 hover:scale-110 transition-all shadow-sm flex items-center justify-center"
                      title={tileShape === 'acorn' ? 'Switch to Leaf View' : 'Switch to Acorn View'}
                    >
                      <span className="text-2xl">{tileShape === 'acorn' ? '🍂' : '🌰'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode='popLayout'>
                      {displayedCourses.map((course, index) => (
                        <motion.div
                          key={course.ID}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => setSelectedCourse(course)}
                          className="relative cursor-pointer group"
                          style={{ aspectRatio: tileShape === 'acorn' ? '0.95/1' : '0.95/1' }}
                        >
                          {tileShape === 'acorn' ? (
                            /* ACORN SHAPE */
                            <>
                              <svg
                                viewBox="0 0 300 400"
                                className="w-full h-full drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
                              >
                                <defs>
                                  <linearGradient id={`acornGradient-${course.ID}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#d4a574" />
                                    <stop offset="30%" stopColor="#c49a6a" />
                                    <stop offset="70%" stopColor="#b8956a" />
                                    <stop offset="100%" stopColor="#a8865a" />
                                  </linearGradient>
                                  <pattern id={`capPattern-${course.ID}`} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                                    <circle cx="6" cy="6" r="2.5" fill="#5a4a3a" opacity="0.5" />
                                  </pattern>
                                  <pattern id={`woodGrain-${course.ID}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                    <path d="M0,20 Q25,18 50,20 T100,20" stroke="rgba(90,70,50,0.1)" strokeWidth="1.5" fill="none" />
                                    <path d="M0,40 Q25,38 50,40 T100,40" stroke="rgba(90,70,50,0.1)" strokeWidth="1.5" fill="none" />
                                    <path d="M0,60 Q25,58 50,60 T100,60" stroke="rgba(90,70,50,0.1)" strokeWidth="1.5" fill="none" />
                                    <path d="M0,80 Q25,78 50,80 T100,80" stroke="rgba(90,70,50,0.1)" strokeWidth="1.5" fill="none" />
                                  </pattern>
                                  <radialGradient id={`capGradient-${course.ID}`}>
                                    <stop offset="0%" stopColor="#7a6347" />
                                    <stop offset="100%" stopColor="#5a4a3a" />
                                  </radialGradient>
                                </defs>
                                
                                {/* Stem */}
                                <rect x="145" y="40" width="10" height="25" rx="4" fill="#4a3a2a" />
                                
                                {/* Acorn Cap - more textured and rounded */}
                                <ellipse cx="150" cy="85" rx="95" ry="45" fill={`url(#capGradient-${course.ID})`} stroke="#4a3a2a" strokeWidth="2.5" />
                                <ellipse cx="150" cy="85" rx="95" ry="45" fill={`url(#capPattern-${course.ID})`} />
                                
                                {/* Cap rim with shadow */}
                                <ellipse cx="150" cy="110" rx="100" ry="22" fill="#6a5a4a" stroke="#4a3a2a" strokeWidth="2" />
                                <ellipse cx="150" cy="108" rx="100" ry="8" fill="rgba(0,0,0,0.15)" />

                                {/* Acorn Body - more rounded and bulbous */}
                                <path
                                  d="M 50 110 
                                     Q 45 160, 50 210
                                     Q 55 260, 80 300
                                     Q 110 340, 150 355
                                     Q 190 340, 220 300
                                     Q 245 260, 250 210
                                     Q 255 160, 250 110
                                     Z"
                                  fill={`url(#acornGradient-${course.ID})`}
                                  stroke="#9d7f5a"
                                  strokeWidth="2.5"
                                />
                                
                                {/* Wood grain overlay */}
                                <path
                                  d="M 50 110 
                                     Q 45 160, 50 210
                                     Q 55 260, 80 300
                                     Q 110 340, 150 355
                                     Q 190 340, 220 300
                                     Q 245 260, 250 210
                                     Q 255 160, 250 110
                                     Z"
                                  fill={`url(#woodGrain-${course.ID})`}
                                />

                                {/* Highlight on body */}
                                <ellipse cx="110" cy="200" rx="35" ry="70" fill="white" opacity="0.12" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 pb-4">
                                <div>
                                  <div className="flex justify-between items-start mb-2.5">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-dandori-dark shadow-sm border border-dandori-dark/10">
                                      {course['Course Type']}
                                    </span>
                                    <span className="font-mono text-xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                                      {course.Cost}
                                    </span>
                                  </div>
                                  <h2 className="text-xl font-serif font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] mb-2 leading-tight group-hover:scale-105 transition-transform">
                                    {course['Course Name']}
                                  </h2>
                                  <div className="flex items-center text-white/95 text-sm mb-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                    <User className="w-4 h-4 mr-1.5" />
                                    <span className="font-medium">{course.Instructor}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-2.5">
                                    {course['Skills Developed'].split(',').slice(0, 2).map((skill, i) => (
                                      <span key={i} className="text-[10px] px-2.5 py-1 bg-white/95 text-dandori-dark rounded-full font-medium shadow-sm">
                                        {skill.trim()}
                                      </span>
                                    ))}
                                    {course['Skills Developed'].split(',').length > 2 && (
                                      <span className="text-[10px] px-2.5 py-1 bg-white/75 text-dandori-dark rounded-full font-medium">
                                        +{course['Skills Developed'].split(',').length - 2}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white/90 text-sm line-clamp-5 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                    {course.Description}
                                  </p>
                                </div>
                                <div className="space-y-2.5 mt-3">
                                  <div className="flex items-center text-white/90 text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                    <MapPin className="w-4 h-4 mr-1.5" />
                                    {course.Location}
                                  </div>
                                  <button className="w-full py-3 bg-white/95 backdrop-blur-sm text-dandori-dark text-base font-bold rounded-full group-hover:bg-white group-hover:scale-105 transition-all shadow-lg">
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            /* LEAF SHAPE */
                            <>
                              <svg
                                viewBox="0 0 300 400"
                                className="w-full h-full drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
                              >
                                <defs>
                                  <linearGradient id={`leafGradient-${course.ID}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8fbc8f" />
                                    <stop offset="50%" stopColor="#7aa87a" />
                                    <stop offset="100%" stopColor="#6b9b6b" />
                                  </linearGradient>
                                  <pattern id={`leafVeins-${course.ID}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                    <path d="M50,0 L50,100" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                    <path d="M50,20 Q70,20 80,30" stroke="rgba(90,120,90,0.1)" strokeWidth="1" fill="none" />
                                    <path d="M50,40 Q70,40 80,50" stroke="rgba(90,120,90,0.1)" strokeWidth="1" fill="none" />
                                    <path d="M50,60 Q70,60 80,70" stroke="rgba(90,120,90,0.1)" strokeWidth="1" fill="none" />
                                    <path d="M50,20 Q30,20 20,30" stroke="rgba(90,120,90,0.1)" strokeWidth="1" fill="none" />
                                    <path d="M50,40 Q30,40 20,50" stroke="rgba(90,120,90,0.1)" strokeWidth="1" fill="none" />
                                    <path d="M50,60 Q30,60 20,70" stroke="rgba(90,120,90,0.1)" strokeWidth="1" fill="none" />
                                  </pattern>
                                </defs>
                                
                                {/* Leaf shape - taller to match acorn */}
                                <path
                                  d="M 150 40 
                                     Q 210 80, 240 140
                                     Q 260 200, 240 260
                                     Q 210 320, 150 360
                                     Q 90 320, 60 260
                                     Q 40 200, 60 140
                                     Q 90 80, 150 40 Z"
                                  fill={`url(#leafGradient-${course.ID})`}
                                  stroke="#5a7a5a"
                                  strokeWidth="3"
                                />
                                
                                {/* Leaf veins overlay */}
                                <path
                                  d="M 150 40 
                                     Q 210 80, 240 140
                                     Q 260 200, 240 260
                                     Q 210 320, 150 360
                                     Q 90 320, 60 260
                                     Q 40 200, 60 140
                                     Q 90 80, 150 40 Z"
                                  fill={`url(#leafVeins-${course.ID})`}
                                />
                                
                                {/* Center vein */}
                                <path
                                  d="M 150 40 Q 150 200, 150 360"
                                  stroke="rgba(90,120,90,0.25)"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                
                                {/* Side veins */}
                                <path d="M 150 100 Q 180 110, 200 130" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                <path d="M 150 100 Q 120 110, 100 130" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                <path d="M 150 160 Q 190 170, 210 190" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                <path d="M 150 160 Q 110 170, 90 190" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                <path d="M 150 220 Q 180 230, 200 250" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                <path d="M 150 220 Q 120 230, 100 250" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                <path d="M 150 280 Q 170 290, 180 310" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                <path d="M 150 280 Q 130 290, 120 310" stroke="rgba(90,120,90,0.15)" strokeWidth="2" fill="none" />
                                
                                {/* Highlight */}
                                <ellipse cx="130" cy="140" rx="35" ry="60" fill="white" opacity="0.15" />
                              </svg>
                              <div className="absolute inset-0 flex flex-col justify-between p-5 pt-14 pb-4">
                                <div>
                                  <div className="flex justify-between items-start mb-2.5">
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-dandori-dark shadow-sm border border-dandori-dark/10">
                                      {course['Course Type']}
                                    </span>
                                    <span className="font-mono text-xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                                      {course.Cost}
                                    </span>
                                  </div>
                                  <h2 className="text-xl font-serif font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] mb-2 leading-tight group-hover:scale-105 transition-transform">
                                    {course['Course Name']}
                                  </h2>
                                  <div className="flex items-center text-white/95 text-sm mb-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                    <User className="w-4 h-4 mr-1.5" />
                                    <span className="font-medium">{course.Instructor}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-2.5">
                                    {course['Skills Developed'].split(',').slice(0, 2).map((skill, i) => (
                                      <span key={i} className="text-[10px] px-2.5 py-1 bg-white/95 text-dandori-dark rounded-full font-medium shadow-sm">
                                        {skill.trim()}
                                      </span>
                                    ))}
                                    {course['Skills Developed'].split(',').length > 2 && (
                                      <span className="text-[10px] px-2.5 py-1 bg-white/75 text-dandori-dark rounded-full font-medium">
                                        +{course['Skills Developed'].split(',').length - 2}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white/90 text-sm line-clamp-5 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                    {course.Description}
                                  </p>
                                </div>
                                <div className="space-y-2.5 mt-3">
                                  <div className="flex items-center text-white/90 text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                    <MapPin className="w-4 h-4 mr-1.5" />
                                    {course.Location}
                                  </div>
                                  <button className="w-full py-3 bg-white/95 backdrop-blur-sm text-dandori-dark text-base font-bold rounded-full group-hover:bg-white group-hover:scale-105 transition-all shadow-lg">
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Pagination / Load More */}
                  {filteredCourses.length > limit && (
                    <div className="mt-12 text-center">
                      <button 
                        onClick={() => setLimit(prev => prev + 6)}
                        className="px-8 py-3 bg-white border border-dandori-dark/20 text-dandori-dark rounded-full font-medium hover:bg-dandori-dark hover:text-white transition-colors shadow-sm"
                      >
                        Show More Results
                      </button>
                    </div>
                  )}

                  {filteredCourses.length === 0 && (
                    <div className="text-center py-12 text-dandori-dark/50 bg-white rounded-2xl border border-dashed border-dandori-dark/20">
                      <p className="text-lg mb-2">No courses found matching your criteria.</p>
                      <button 
                        onClick={() => {
                          setFilters({
                            location: '',
                            type: '',
                            maxPrice: 1000,
                            sortBy: 'recommended'
                          });
                          setSearchTerm('');
                        }}
                        className="text-dandori-light hover:underline font-medium"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <LeafModal
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => {
          if (!bookingClicked) setSelectedCourse(null);
        }}
        onBook={() => {
          setBookingClicked(true);
          setTimeout(() => {
            setBookingClicked(false);
            setSelectedCourse(null);
          }, 3000);
        }}
        bookingClicked={bookingClicked}
      />

      <Footer />
      </div>
    </div>
  );
}
