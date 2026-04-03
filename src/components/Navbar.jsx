import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ scrolled }) {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleNavClick = (anchor) => {
    setMobileMenuIsOpen(false);
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.querySelector(anchor)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/80 backdrop-blur-lg border-b border-slate-800"
          : "bg-slate-950/20 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
            <div className="flex-shrink-0">
              <img
                src="/robocraft-logo.png"
                alt="RoboCraft Technologies"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                style={{ mixBlendMode: "screen" }}
              />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold leading-tight">
              <span className="text-orange-400">Robo</span>
              <span className="text-white">Craft</span>
              <span className="block text-green-400 text-xs sm:text-sm font-semibold tracking-widest uppercase -mt-1">
                Technologies
              </span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <button
              onClick={() => handleNavClick("#features")}
              className="text-gray-300 hover:text-white text-sm lg:text-base transition-colors duration-200"
            >
              Features
            </button>
            <Link
              to="/projects"
              className="text-gray-300 hover:text-white text-sm lg:text-base transition-colors duration-200"
            >
              Projects
            </Link>
            <button
              onClick={() => handleNavClick("#testimonials")}
              className="text-gray-300 hover:text-white text-sm lg:text-base transition-colors duration-200"
            >
              Community
            </button>
          </div>

          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setMobileMenuIsOpen((prev) => !prev)}
          >
            {mobileMenuIsOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuIsOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
            <button
              onClick={() => handleNavClick("#features")}
              className="block text-gray-300 hover:text-white text-sm lg:text-base w-full text-left"
            >
              Features
            </button>
            <Link
              to="/projects"
              onClick={() => setMobileMenuIsOpen(false)}
              className="block text-gray-300 hover:text-white text-sm lg:text-base"
            >
              Projects
            </Link>
            <button
              onClick={() => handleNavClick("#testimonials")}
              className="block text-gray-300 hover:text-white text-sm lg:text-base w-full text-left"
            >
              Community
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
