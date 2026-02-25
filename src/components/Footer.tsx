import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dandori-dark text-dandori-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
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
            <p className="text-sm opacity-80">
              © {new Date().getFullYear()} School of Dandori. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs opacity-60">
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
