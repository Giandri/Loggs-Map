'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface NavbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, onSearchChange }) => {
    return (
        <div className="absolute top-0 left-0 right-0 z-1000">
            {/* Main Navbar with gradient fade */}
            <div
                className="px-4 pt-4 pb-36"
                style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0.4) 70%, rgba(255, 255, 255, 0) 100%)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    maskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, transparent 100%)',
                }}
            >
                <div className="max-w-md mx-auto space-y-3">
                    {/* Logo */}
                    <div id="navbar-logo" className="flex justify-center">
                        <img
                            src="/images/loggs logo.png"
                            alt="Loggs Cafe"
                            className="h-12 object-contain"
                        />
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            id="search-input"
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full px-5 py-3 pr-12 rounded-full bg-gray-100/90 border-0 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm text-gray-600 placeholder-gray-400"
                        />
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
