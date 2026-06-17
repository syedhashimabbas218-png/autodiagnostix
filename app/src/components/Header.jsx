import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const navLinkClass = isScrolled
        ? 'text-zinc-600 font-medium hover:text-zinc-900 transition-colors text-sm tracking-tight'
        : 'text-white/80 font-medium hover:text-white transition-colors text-sm tracking-tight';

    const activeLinkClass = isScrolled
        ? 'text-red-600 font-bold border-b-2 border-red-600 pb-1 text-sm tracking-tight'
        : 'text-white font-bold border-b-2 border-white pb-1 text-sm tracking-tight';

    const headerBgClass = isScrolled
        ? 'bg-white/70 backdrop-blur-xl border-b border-white/20'
        : 'bg-transparent border-b border-white/10';

    const searchIconClass = isScrolled
        ? 'text-zinc-400 hover:text-zinc-600'
        : 'text-white/60 hover:text-white';

    return (
        <nav className={`fixed top-0 w-full z-50 h-16 flex items-center transition-colors duration-300 ${headerBgClass}`}>
            <div className="flex justify-between items-center w-full px-8 h-16 max-w-screen-2xl mx-auto">
                <div className="flex items-center h-full">
                    <a href="/">
                        <img
                            src="/logo-full.png"
                            alt="Autodiagnostix"
                            className={`h-14 w-auto object-contain transition-all duration-300 ${isScrolled ? '' : 'brightness-0 invert'}`}
                        />
                    </a>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a className={activeLinkClass} href="#scanners">Diagnostics</a>
                    <a className={navLinkClass} href="#software">Software</a>
                    <a className={navLinkClass} href="#hardware">Hardware</a>
                    <a className={navLinkClass} href="#oem">OEM Specs</a>
                    <a className={navLinkClass} href="#adas">Calibration</a>
                    <a className={navLinkClass} href="#contact">Support</a>
                </div>
                <div className="flex items-center gap-6">
                    <form onSubmit={handleSearch} className="relative hidden md:flex items-center h-10">
                        {!isSearchOpen ? (
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(true)}
                                className={`transition-colors cursor-pointer p-2 flex items-center justify-center ${searchIconClass}`}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </button>
                        ) : (
                            <div className="relative flex items-center w-48">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search products..."
                                    className="bg-zinc-100 border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    title="Search products"
                                    onBlur={() => {
                                        if (!searchQuery.trim()) setIsSearchOpen(false);
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="absolute left-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    onMouseDown={(e) => { if (!searchQuery.trim()) { e.preventDefault(); } }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </form>
                    <button
                        onClick={() => navigate('/contact')}
                        className="bg-primary text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:scale-[0.98] transition-all cursor-pointer"
                    >
                        Request a Quote
                    </button>
                </div>
            </div>
        </nav>
    );
}
