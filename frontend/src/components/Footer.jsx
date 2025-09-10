import React from "react";
import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full p-8 sm:p-10 bg-gray-900 text-gray-300 relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col lg-flex-row items-center space-y-8">
        
        {/* Brand Info */}
        <div className="flex flex-col items-center space-y-1 text-center">
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            KitÉtudes
          </span>
          <span className="text-sm sm:text-base text-gray-400">
            A modern toolkit to help students organize, track, and succeed
          </span>
        </div>

        {/* Developer Info */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <p className="text-sm sm:text-base">
            Developed by <span className="font-semibold">Syed Mohibul Alam</span>
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com/Mohibsadee"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Github size={22} />
            </a>
            <a
              href="https://www.linkedin.com/in/syed-mohibul-alam-2912881a3/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Linkedin size={22} />
            </a>
            <a
              href="mailto:sadeemohib@gmail.com"
              className="hover:text-white transition-colors"
            >
              <Mail size={22} />
            </a>
          </div>
        </div>

   

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © {new Date().getFullYear()} KitÉtudes — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
