import { Link, useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const [hasClickedSVG, setHasClickedSVG] = useState(false);

  useEffect(() => {
    const handleSVGClick = () => setHasClickedSVG(true);
    window.addEventListener('svg-clicked', handleSVGClick);
    return () => window.removeEventListener('svg-clicked', handleSVGClick);
  }, []);

  const handleCoursesClick = () => {
    if (!hasClickedSVG) {
      const btn = document.querySelector('[data-courses-btn]');
      btn?.classList.add('animate-flash-red');
      setTimeout(() => btn?.classList.remove('animate-flash-red'), 1000);
    } else {
      window.dispatchEvent(new CustomEvent('show-courses'));
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('go-home'));
  };

  return (
    <header className="bg-dandori-dark text-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3 group ml-8">
          <div className="bg-white rounded-full group-hover:rotate-360 transition-transform duration-1000 overflow-hidden w-18 h-18 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="School of Dandori Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Sprout className="w-11 h-11 text-dandori-dark hidden" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-3xl font-bold tracking-wide text-dandori-yellow drop-shadow-sm">
              School of Dandori
            </span>
          </div>
        </Link>
        <nav className="mr-8">
          <ul className="flex gap-8 items-center">
            <li>
              <button
                onClick={handleHomeClick}
                className="hover:text-dandori-yellow transition-colors font-medium"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                data-courses-btn
                onClick={handleCoursesClick}
                className="hover:text-dandori-yellow transition-colors font-medium"
              >
                Courses
              </button>
            </li>
            <li>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-chat'))}
                className="hover:text-dandori-yellow transition-colors font-medium cursor-pointer"
              >
                Help
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
