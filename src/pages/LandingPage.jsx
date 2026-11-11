import React, { useState } from "react";
import { Link } from "react-router";
import LogoImage from "../assets/logo.jpg";
import bgImage from "../assets/bg.jpg";
import { FiSearch, FiPlayCircle, FiMonitor, FiCheckCircle, FiLinkedin, FiYoutube, FiX, FiMenu } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { GiProgression } from "react-icons/gi";
import { PiToolboxLight } from "react-icons/pi";

const LandingPage = () => {
  const [overlay, setOverlay] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  const navLinkClass = "relative text-slate-300 hover:text-white transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full";

  return (
    <div className="min-h-screen bg-[#F7FAF9] font-sans">

      <div className="bg-[#0f2137] relative pb-12 md:pb-16 pt-4 md:pt-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
          <div className="absolute left-[5%] top-0 bottom-0 border-l border-dashed border-[#2563EB]/40"></div>
          <div className="absolute right-[5%] top-0 bottom-0 border-r border-dashed border-[#2563EB]/40"></div>
          <div className="absolute left-0 right-0 top-[150px] border-t border-dashed border-[#2563EB]/40"></div>
          <div className="absolute left-0 right-0 bottom-[200px] border-b border-dashed border-[#2563EB]/40"></div>
        </div>

        <div className="mx-auto max-w-7xl relative z-20">

          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <img src={LogoImage} alt="Project Finder" className="h-8 w-8 rounded bg-white object-contain p-0.5" />
              <span className="text-lg font-bold tracking-wide text-white">PROJECT FINDER</span>
            </div>

            
            <div className="hidden items-center gap-6 lg:gap-10 text-sm font-medium md:flex">
              <a href="#home" onClick={handleHomeClick} className={navLinkClass}>
                Home
              </a>
              <button onClick={() => setOverlay("how-it-works")} className={navLinkClass}>
                How It Works
              </button>
              <button onClick={() => setOverlay("about")} className={navLinkClass}>
                About
              </button>
            </div>

    
            <div className="hidden md:flex items-center gap-4 sm:gap-6">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#0f2137] shadow-sm hover:bg-slate-100"
              >
                Get Started
              </Link>
            </div>

            
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </nav>

        
          {menuOpen && (
            <div className="md:hidden absolute top-[70px] left-4 right-4 z-50 rounded-xl bg-[#1a345c] p-4 shadow-2xl border border-[#2563EB]/30">
              <div className="flex flex-col gap-4">
                <a href="#home" onClick={handleHomeClick} className="text-white text-sm font-medium py-2 border-b border-white/10">
                  Home
                </a>
                <button
                  onClick={() => { setOverlay("how-it-works"); setMenuOpen(false); }}
                  className="text-left text-white text-sm font-medium py-2 border-b border-white/10"
                >
                  How It Works
                </button>
                <button
                  onClick={() => { setOverlay("about"); setMenuOpen(false); }}
                  className="text-left text-white text-sm font-medium py-2 border-b border-white/10"
                >
                  About
                </button>
                
                <div className="flex flex-col gap-3 mt-2">
                  <Link
                    to="/login"
                    className="text-center text-white text-sm font-medium border border-white/30 rounded-md py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-center rounded-md bg-white py-2 text-sm font-semibold text-[#0f2137]"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 md:mt-16 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16 items-start">
            
            <div className="flex flex-col relative z-20">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight text-white">
                Where projects skills <br className="hidden sm:block" />
                meets <span className="text-[#4A90E2]">practical experience</span>
              </h1>
              <p className="mt-4 md:mt-6 max-w-lg text-sm md:text-base text-slate-300 leading-relaxed">
                Discover project scenarios, explore professional roles, build your experience through realistic simulations.
              </p>

              <div className="mt-8 md:mt-16 rounded-xl bg-white p-5 md:p-6 shadow-2xl relative z-20 lg:w-[110%] max-w-[650px]">
                <p className="mb-4 md:mb-6 text-xs font-medium text-[#0f2137]">Get started in just a few simple steps</p>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 md:grid-cols-4">
                  {[
                    { icon: <FiSearch size={22} />, title: "1. Discover", text: "Explore a wide range project simulations" },
                    { icon: <FiPlayCircle size={22} />, title: "2. Explore", text: "Learn about the project and your role" },
                    { icon: <FiMonitor size={22} />, title: "3. Work", text: "Complete tasks and build your skills" },
                    { icon: <FiCheckCircle size={22} />, title: "4. Submit", text: "Upload your deliverables and track progress" },
                  ].map((step) => (
                    <div key={step.title} className="flex flex-col items-start">
                      <div className="mb-2 text-[#2563EB]">{step.icon}</div>
                      <h3 className="text-[11px] font-bold text-[#0f2137]">{step.title}</h3>
                      <p className="mt-1 text-[10px] text-slate-500 leading-tight">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[480px] rounded-xl overflow-hidden mt-4 lg:mt-0">
              <img src={bgImage} alt="Woman working" className="h-full w-full object-cover" />
              
              <div className="absolute left-3 md:left-4 top-8 md:top-12 flex items-center gap-2 rounded-lg bg-white px-2 md:px-3 py-1.5 md:py-2 shadow-lg">
                <div className="bg-blue-100 p-1 rounded text-[#2563EB]"><GiProgression size={14} /></div>
                <span className="text-[10px] md:text-[11px] font-bold text-[#0f2137] leading-tight">Explore<br/>Projects</span>
              </div>
              
              <div className="absolute bottom-16 md:bottom-20 left-3 md:left-4 flex items-center gap-2 rounded-lg bg-white px-2 md:px-3 py-1.5 md:py-2 shadow-lg">
                <div className="bg-blue-50 p-1 rounded text-[#2563EB]"><PiToolboxLight  size={14} /></div>
                <span className="text-[10px] md:text-[11px] font-bold text-[#0f2137] leading-tight">Build<br/>Skills</span>
              </div>

              <div className="absolute bottom-28 md:bottom-32 right-3 md:right-4 flex items-center gap-2 rounded-lg bg-white px-2 md:px-3 py-1.5 md:py-2 shadow-lg">
                <div className="bg-green-50 p-1 rounded text-green-500"><FiCheckCircle size={14} /></div>
                <span className="text-[10px] md:text-[11px] font-bold text-[#0f2137] leading-tight">Grow Your<br/>Career</span>
              </div>
            </div>
          </div>

          <div className="mt-12 md:mt-16 text-left relative z-20">
            <div className="mb-4 flex flex-wrap gap-2 text-[10px] md:text-xs font-medium text-white">
              {["Project Management", "Business Analysis", "Healthcare", "EdTech and more..."].map(tag => (
                <span key={tag} className="rounded bg-[#4A90E2] px-2 md:px-2.5 py-1">{tag}</span>
              ))}
            </div>
            
            <h2 className="text-base md:text-lg font-bold text-white">
              Ready to build <span className="text-[#4A90E2]">practical project experience?</span>
            </h2>
            <p className="mt-1 text-[11px] md:text-xs text-slate-300">Join Project Finder today and take the next step in your career journey</p>
            
            <div className="mt-4 md:mt-5 flex gap-4 text-white">
              <a href="#" className="hover:text-slate-300"><FiLinkedin size={20} /></a>
              <a href="#" className="hover:text-slate-300"><FiYoutube size={20} /></a>
              <a href="#" className="hover:text-slate-300"><FaXTwitter size={20} /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="h-4 md:h-6 w-full bg-[#4A90E2]"></div>

      {overlay === "how-it-works" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
            <button onClick={() => setOverlay(null)} className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <FiX size={24} />
            </button>
            <h2 className="mb-6 text-xl font-bold text-[#0f2137]">How it works</h2>
            <div className="space-y-6">
              {[
                { title: "1. Discover", text: "Explore project simulations across different industries, difficulty levels and professional roles." },
                { title: "2. Explore", text: "Choose a project, understand its scenario, review the objectives and discover your responsibilities." },
                { title: "3. Work", text: "Take on the project tasks, apply your knowledge and develop practical problem-solving skills." },
                { title: "4. Submit", text: "Upload your required deliverables and complete your project simulation." },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-sm font-bold text-[#0f2137]">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {overlay === "about" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 md:p-8 shadow-2xl">
            <button onClick={() => setOverlay(null)} className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <FiX size={24} />
            </button>
            <h2 className="mb-6 text-xl font-bold text-[#0f2137]">About</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#0f2137]">About ProjectFinder</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Bridging the gap between knowledge and practical experience. ProjectFinder is a practical project simulation platform designed to help aspiring and experienced project professionals strengthen their skills through structured, scenario-based learning.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f2137]">Our purpose</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  We believe professional growth goes beyond understanding concepts. It also means knowing how to apply them, approach challenges and deliver meaningful outcomes.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f2137]">What we offer</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  A growing library of project scenarios, professional role experiences and guided simulations that encourage practical learning and skill development.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f2137]">Who we serve</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Aspiring project professionals and individuals looking to strengthen their understanding of project work across different roles and industries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;