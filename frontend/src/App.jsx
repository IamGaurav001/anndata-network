import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Navbar'
import ImageSliderContainer from './ImageSliderContainer'

import MapPreviewSection from './MapPreviewSection'

// const App = () => {
//   return (
//     <>
//       <Navbar />
//       <ImageSliderContainer />
//       <MapPreviewSection />
//     </>
//   )

import LogInPage from './LogInPage'
import SignUpPage from './SignUpPage'
import DonorDashboard from './DonorDashboard' 
import NgoDashboard from './NgoDashboard' // Assuming NgoDashboard is imported

// --- Constants for Local Storage Keys ---
const AUTH_TOKEN_KEY = 'authToken';
const USER_ROLE_KEY = 'userRole';
const IS_LOGGED_IN_KEY = 'isLoggedIn';

/**
 * Component to handle the switching between Login and Signup pages.
 * Uses a unified onAuthSuccess prop for both successful Login and Donor Signup.
 */
const AuthPage = ({ onClose, onAuthSuccess }) => {
  // Start with the Login view
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignup = () => setIsLogin(false);
  const handleSwitchToLogin = () => setIsLogin(true);

  return (
    <div className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-xl relative">
        {/* Close Button for Modal */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition"
            aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        
        <div className="mt-4">
            {isLogin ? (
                // LogInPage uses onAuthSuccess
                <LogInPage onSwitchToSignup={handleSwitchToSignup} onAuthSuccess={onAuthSuccess} />
            ) : (
                // SignUpPage uses onSignupSuccess which maps to onAuthSuccess
                <SignUpPage onSwitchToLogin={handleSwitchToLogin} onSignupSuccess={onAuthSuccess} />
            )}
        </div>
    </div>
  );
};

// Modal Component with the user's requested blurred background style
const Modal = ({ children, onClose }) => {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-md p-4 transition-opacity duration-300"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="relative z-50">
                {children}
            </div>
        </div>
    );
};


const App = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    // 💡 State initialized from localStorage for persistence on refresh
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem(IS_LOGGED_IN_KEY) === 'true'); 
    const [userRole, setUserRole] = useState(localStorage.getItem(USER_ROLE_KEY) || null);

    // --- EFFECT: Check localStorage on mount for persistent state ---
    useEffect(() => {
        // This ensures state is correctly set on initial load/refresh.
        const storedLoggedIn = localStorage.getItem(IS_LOGGED_IN_KEY) === 'true';
        const storedRole = localStorage.getItem(USER_ROLE_KEY);
        
        if (storedLoggedIn) {
            setIsLoggedIn(true);
            setUserRole(storedRole);
        }
    }, []); 

    const openAuthModal = () => setShowAuthModal(true);
    const closeAuthModal = () => setShowAuthModal(false);
    
    // 🛑 Unified handler for successful login or donor signup
    const handleAuthSuccess = ({ token, user }) => { //
        // 1. Persist Data
        localStorage.setItem(AUTH_TOKEN_KEY, token); // Store the token
        localStorage.setItem(IS_LOGGED_IN_KEY, 'true'); // Set the logged-in flag
        localStorage.setItem(USER_ROLE_KEY, user.role); // Store the user's role

        // 2. Update State
        setIsLoggedIn(true); //
        setUserRole(user.role); //

        // 3. Close UI
        console.log(`Auth successful. User role: ${user.role}`);
        closeAuthModal();
    };

    // 🛑 Handler for logging out and clearing persistent storage
    const handleLogout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.setItem(IS_LOGGED_IN_KEY, 'false'); 
        localStorage.removeItem(USER_ROLE_KEY);
        
        setIsLoggedIn(false);
        setUserRole(null);
    };

    // Apply filter/blur class to main content when modal is open
    const mainContentClass = showAuthModal ? 'filter blur-sm pointer-events-none' : '';

    return (
        <>
            <Navbar onLoginClick={openAuthModal} />
            
            <main className={mainContentClass} style={{ transition: 'filter 0.3s ease-out' }}>
                {/* 🛑 PROTECTED ROUTE LOGIC */}
                {isLoggedIn ? (
                    // Render Dashboard based on userRole
                    <Routes>
                        <Route 
                            path="/*" // Catch all routes when logged in
                            element={userRole === 'donor' ? (
                                <DonorDashboard onLogout={handleLogout} /> // Donor Dashboard
                            ) : userRole === 'ngo' ? (
                                <NgoDashboard onLogout={handleLogout} /> // NGO Dashboard
                            ) : (
                                <div className="pt-20 text-center p-8">Loading or Unknown Role...</div>
                            )}
                        />
                    </Routes>
                ) : (
                    // PUBLIC ROUTES
                    <Routes>
                        {/* Home Page Route - Renders the Image Slider */}
                        <Route 
                            path="/" 
                            element={<ImageSliderContainer />} 
                        />
                        
                        {/* Placeholder Routes for Navbar links remain public */}
                        <Route path="/donate" element={<div className="pt-20 text-center text-xl p-8">Donate Page Placeholder</div>} />
                        <Route path="/impact" element={<div className="pt-20 text-center text-xl p-8">Our Impact Page Placeholder</div>} />
                        <Route path="/testimonial" element={<div className="pt-20 text-center text-xl p-8">Testimonial Page Placeholder</div>} />
                        <Route path="/about" element={<div className="pt-20 text-center text-xl p-8">About Page Placeholder</div>} />
                    </Routes>
                )}
            </main>

            {/* Authentication Modal */}
            {showAuthModal && (
                <Modal onClose={closeAuthModal}>
                    <AuthPage 
                        onClose={closeAuthModal} 
                        onAuthSuccess={handleAuthSuccess} // Unified handler passed to AuthPage
                    />
                </Modal>
            )}
            <Navbar />
      <ImageSliderContainer />
      <MapPreviewSection />
        </>
    )

}

export default App