import { Phone, Mail } from 'lucide-react';

/**
 * Renders the main application footer component.
 * 
 * Displays contact information, copyright details, and organisational
 * branding credits.
 */
export default function Footer() {
  return (
    <footer className="bg-dandori-dark text-dandori-white py-4 mt-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-base">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+44 (0) 20 1234 5678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>hello@schoolofdandori.co.uk</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-base opacity-80">
              © {new Date().getFullYear()} School of Dandori. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <span>Website created on behalf of</span>
              <img 
                src="/df-icon.ico" 
                alt="Digital Futures" 
                className="w-4 h-4"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 600 }}>Digital Futures</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
