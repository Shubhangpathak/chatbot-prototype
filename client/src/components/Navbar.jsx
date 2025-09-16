import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", to: "/" },
    { name: "Features", to: "/features" },
    { name: "Dashboard", to: "/dashboard" },
    // { name: "Login", to: "/login" },
    // { name: "Sign Up", to: "/signup" },
  ];

  return (
    <nav className="bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-gray-800"
        >
          <span className="text-indigo-600">Mentora</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="text-gray-700 hover:text-indigo-600 transition font-medium"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/signup"
            className="ml-4 px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-sm"
          >
            Get started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-800 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/signup"
            onClick={() => setIsOpen(false)}
            className="block text-center px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
