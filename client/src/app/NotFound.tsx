import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    const redirect = setTimeout(() => navigate("/"), 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#000000] text-[#262626] dark:text-[#f5f5f5] flex flex-col justify-between antialiased font-sans transition-colors duration-200">
      {/* --- INSTAGRAM SYSTEM BRAND HEADER --- */}
      <header className="w-full h-[60px] border-b border-[#dbdbdb] dark:border-[#262626] bg-[#ffffff] dark:bg-[#000000] sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-[935px] h-full mx-auto flex justify-between items-center px-4 md:px-10">
          <Link
            to="/"
            className="text-xl font-semibold tracking-tight font-sans text-[#262626] dark:text-[#f5f5f5]"
          >
            Hellotalk
          </Link>
          <span className="text-xs font-normal text-[#737373] dark:text-[#a8a8a8]">
            Error Log: 404
          </span>
        </div>
      </header>

      {/* --- INSTAGRAM CONTENT CANVAS AREA --- */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-12 max-w-[400px] mx-auto">
        {/* Typographic Large Indicator */}
        <motion.h1
          className="text-8xl font-light tracking-tighter text-[#000000] dark:text-[#ffffff] mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          404
        </motion.h1>

        {/* Narrative Copy */}
        <motion.div
          className="space-y-2.5"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h2 className="text-[22px] font-semibold tracking-tight leading-7 text-[#262626] dark:text-[#f5f5f5]">
            Sorry, this page isn't available.
          </h2>
          <p className="text-sm font-normal text-[#737373] dark:text-[#a8a8a8] leading-[18px]">
            The link you followed may be broken, or the page may have been
            removed. Go back to Hellotalk.
          </p>
        </motion.div>

        {/* Action Call Button Component */}
        <motion.div
          className="mt-8 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Instagram's Native Premium Fill Action Blue Button */}
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 h-8 text-sm font-semibold rounded-lg text-white bg-[#0095f6] hover:bg-[#1877f2] dark:bg-[#0095f6] dark:hover:bg-[#1877f2] transition-colors duration-150 select-none text-center"
          >
            Return to Feed ({countdown}s)
          </Link>
        </motion.div>
      </main>

      {/* --- FLAT APP FOOTER REGION --- */}
      <footer className="w-full max-w-[935px] mx-auto flex flex-col gap-4 items-center text-[12px] text-[#737373] dark:text-[#737373] pb-12 pt-6 px-4 md:px-10">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center font-normal text-[#737373] dark:text-[#a8a8a8]">
          <span className="hover:underline cursor-pointer transition-all">
            About
          </span>
          <span className="hover:underline cursor-pointer transition-all">
            Blog
          </span>
          <span className="hover:underline cursor-pointer transition-all">
            API
          </span>
          <span className="hover:underline cursor-pointer transition-all">
            Privacy
          </span>
          <span className="hover:underline cursor-pointer transition-all">
            Terms
          </span>
          <span className="hover:underline cursor-pointer transition-all">
            Locations
          </span>
        </div>

        <div className="tracking-tight text-[12px] text-[#737373] uppercase font-mono scale-95 opacity-80 mt-2">
          © 2026 HELLOTALK FROM META
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
