'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * A sticky banner displayed at the top of every page to indicate the site is awaiting state approval.
 * Matches the requested design with a premium feel and smooth animation.
 * Includes a dismiss button.
 */
export default function ApprovalBanner() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (isVisible) {
            document.documentElement.style.setProperty('--banner-height', '44px');
        } else {
            document.documentElement.style.setProperty('--banner-height', '0px');
        }
    }, [isVisible]);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="sticky top-0 w-full bg-[#e6a032] text-white py-2.5 px-4 flex items-center justify-center z-[100] shadow-md overflow-hidden"
                >
                    {/* Subtle shimmer effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[20px] select-none drop-shadow-sm">
                            info
                        </span>
                        <span className="text-sm font-semibold tracking-wide drop-shadow-sm">
                            Waiting for state approval.
                        </span>
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={handleDismiss}
                        className="absolute right-4 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 flex items-center justify-center"
                        aria-label="Close banner"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            close
                        </span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
