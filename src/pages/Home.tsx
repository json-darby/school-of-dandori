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
                          className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group border border-dandori-dark/5 cursor-pointer"
                        >
                          <div className="h-2 bg-dandori-light" />
                          
                          <div className="p-6 flex-grow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-dandori-white text-dandori-dark border border-dandori-dark/10">
                                {course['Course Type']}
                              </span>
                              <span className="font-mono text-lg font-bold text-dandori-yellow">
                                {course.Cost}
                              </span>
                            </div>

                            <h2 className="text-xl font-serif font-bold text-dandori-dark mb-2 group-hover:text-dandori-light transition-colors">
                              {course['Course Name']}
                            </h2>

                            <div className="flex items-center text-dandori-dark/60 text-xs mb-4">
                              <User className="w-3 h-3 mr-1" />
                              <span className="font-medium">{course.Instructor}</span>
                            </div>

                            {/* Tags Section */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {course['Skills Developed'].split(',').slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">
                                  {skill.trim()}
                                </span>
                              ))}
                              {course['Skills Developed'].split(',').length > 3 && (
                                 <span className="text-[10px] px-2 py-0.5 bg-stone-50 text-stone-400 rounded-full">
                                   +{course['Skills Developed'].split(',').length - 3} more
                                 </span>
                              )}
                            </div>

                            <p className="text-dandori-dark/70 mb-6 text-sm line-clamp-3 leading-relaxed">
                              {course.Description}
                            </p>

                            <div className="mt-auto pt-4 border-t border-dandori-dark/5 flex items-center justify-between">
                              <div className="flex items-center text-dandori-dark/50 text-xs">
                                <MapPin className="w-3 h-3 mr-1" />
                                {course.Location}
                              </div>
                              
                              <span className="inline-flex items-center justify-center px-4 py-2 bg-dandori-dark text-white text-sm rounded-full font-medium group-hover:bg-dandori-light transition-colors">
                                View Details
                              </span>
                            </div>
                          </div>
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
