import { Filter, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Course } from '../types';

interface FilterBarProps {
  locations: string[];
  types: string[];
  filters: {
    location: string;
    type: string;
    maxPrice: number;
    sortBy: string;
  };
  setFilters: (filters: any) => void;
  priceRange: { min: number; max: number };
  limit: number;
  setLimit: (limit: number) => void;
}

export default function FilterBar({ locations, types, filters, setFilters, priceRange, limit, setLimit }: FilterBarProps) {
  const handleChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-dandori-dark p-4 rounded-2xl shadow-lg text-white mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        
        {/* Location Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-dandori-light uppercase tracking-wider">Location</label>
          <div className="relative">
            <select 
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-dandori-yellow appearance-none cursor-pointer hover:bg-white/20 transition-colors"
            >
              <option value="" className="bg-dandori-dark text-white">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc} className="bg-dandori-dark text-white">{loc}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-dandori-light uppercase tracking-wider">Course Type</label>
          <div className="relative">
            <select 
              value={filters.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-dandori-yellow appearance-none cursor-pointer hover:bg-white/20 transition-colors"
            >
              <option value="" className="bg-dandori-dark text-white">All Types</option>
              {types.map(type => (
                <option key={type} value={type} className="bg-dandori-dark text-white">{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          </div>
        </div>

        {/* Price Filter */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-dandori-light uppercase tracking-wider flex justify-between">
            <span>Max Price</span>
            <span className="text-dandori-yellow">£{filters.maxPrice}</span>
          </label>
          <input 
            type="range" 
            min={priceRange.min} 
            max={priceRange.max} 
            value={filters.maxPrice} 
            onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-dandori-yellow"
          />
        </div>

        {/* Sort By */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-dandori-light uppercase tracking-wider">Sort By</label>
          <div className="relative">
            <select 
              value={filters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value)}
              className="w-full bg-dandori-yellow text-dandori-dark font-bold border border-transparent rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none cursor-pointer hover:bg-dandori-cream transition-colors"
            >
              <option value="recommended" className="bg-white text-dandori-dark font-medium">Recommended</option>
              <option value="price_asc" className="bg-white text-dandori-dark font-medium">Price: Low to High</option>
              <option value="price_desc" className="bg-white text-dandori-dark font-medium">Price: High to Low</option>
              <option value="name_asc" className="bg-white text-dandori-dark font-medium">Name: A to Z</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dandori-dark/50 pointer-events-none" />
          </div>
        </div>

        {/* Limit Results */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-dandori-light uppercase tracking-wider">Show</label>
          <div className="relative">
            <select 
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-dandori-yellow appearance-none cursor-pointer hover:bg-white/20 transition-colors"
            >
              <option value={6} className="bg-dandori-dark text-white">6 Results</option>
              <option value={12} className="bg-dandori-dark text-white">12 Results</option>
              <option value={24} className="bg-dandori-dark text-white">24 Results</option>
              <option value={100} className="bg-dandori-dark text-white">All Results</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}
