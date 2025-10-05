import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import sportsImage from "../assets/cartoon.jpg";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  SPORTS SCHEDULER
                </h1>
                <p className="text-xs text-gray-500">
                  Play · Connect · Compete
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                HOME
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                ABOUT
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                FEATURES
              </a>
              <a
                href="#matches"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                MATCHES
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                CONTACT
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
              >
                LOGIN
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                REGISTER NOW
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section
        id="home"
        className="relative bg-white flex-grow flex items-center overflow-hidden"
      >
        {/* Decorative Elements - Subtle */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100 rounded-full opacity-10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-100 rounded-full opacity-5 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-md">
                🏅 Premier Sports League
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 leading-tight">
                <span className="gradient-text">JOIN THE ACTION!</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                Every game starts with a schedule – let's make yours count.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all inline-flex items-center shadow-lg"
                >
                  REGISTER NOW
                  <svg
                    className="w-6 h-6 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="bg-white text-orange-600 border-2 border-orange-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all shadow-lg"
                >
                  LEARN MORE
                </a>
              </div>
            </div>

            {/* Right Content - Sports Image Placeholder */}
            <div className="relative animate-slide-in">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center border border-gray-200">
                  {/* Sports Image */}
                  <img
                    src={sportsImage}
                    alt="Sports Community"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
