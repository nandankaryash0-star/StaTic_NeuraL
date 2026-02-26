import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './Chatpage'; // Modified import path
import ProfilePage from './pages/ProfilePage';
import CustomizePage from './pages/CustomizePage';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar is persistent across all pages, handles its own state */}
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/customize" element={<CustomizePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
