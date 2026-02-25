import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Booking() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full border-2 border-dashed border-green-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-yellow-300 to-rose-400" />
          
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-green-800 mb-4">
            Coming Soon!
          </h1>
          
          <p className="text-lg text-stone-600 mb-8">
            We are currently preparing the booking system for course <span className="font-mono font-bold text-rose-500">#{id}</span>.
            <br />
            Please check back later for updates!
          </p>

          <Link 
            to="/"
            className="inline-flex items-center px-6 py-3 bg-green-700 text-white rounded-xl font-medium hover:bg-green-800 transition-colors shadow-lg hover:shadow-green-200 hover:-translate-y-1"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Courses
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
