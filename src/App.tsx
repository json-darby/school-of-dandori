/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import ChatWidget from './components/ChatWidget';

/**
 * Renders the main application component.
 * 
 * Configures the router and defines core routes, alongside the global
 * chat assistant widget.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book/:id" element={<Booking />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  );
}
