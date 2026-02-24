import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, LogOut, User, Trophy } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinkClass = "text-xs font-mono tracking-[0.2em] uppercase text-gray-500 hover:text-white smooth-transition relative group";
    const activeLinkClass = "text-[#07fc03]";

    const getLinkClass = (path) => {
        return `${navLinkClass} ${location.pathname === path ? activeLinkClass : ''}`;
    };

    return (
        <nav className="bg-black/90 backdrop-blur-xl border-b border-[#07fc03]/30 sticky top-0 z-50 px-8 py-5 flex items-center justify-between font-mono">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 smooth-transition">
                <div className="bg-[#07fc03] w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(7,252,3,0.4)]">
                    <span className="text-white font-bold text-lg leading-none">&lt;/&gt;</span>
                </div>
                <span className="text-[#07fc03] text-2xl font-bold tracking-tight">CodeNation</span>
            </Link>

            {/* Desktop Navigation Links (Middle) */}
            <div className="hidden md:flex items-center justify-center space-x-12 absolute left-1/2 -translate-x-1/2">
                 <Link to="/" className={getLinkClass('/')}>
                    SYSTEM
                    {location.pathname === '/' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                </Link>
                {user && (
                    <>
                        <Link to="/problems" className={getLinkClass('/problems')}>
                            CHALLENGES
                            {location.pathname === '/problems' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                        </Link>
                        <Link to="/contests" className={getLinkClass('/contests')}>
                            CONTESTS
                            {location.pathname.startsWith('/contests') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                        </Link>
                        <Link to="/notes" className={getLinkClass('/notes')}>
                            NOTES
                            {location.pathname === '/notes' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                        </Link>
                    </>
                )}
                {user?.role === 'Admin' && (
                    <Link to="/admin" className={getLinkClass('/admin')}>
                        TERMINAL
                         {location.pathname === '/admin' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                    </Link>
                )}
            </div>

            {/* Right side Auth Controls */}
            <div className="flex items-center space-x-6">
                {user ? (
                    <>
                        <Link to="/profile" className="flex items-center space-x-2 text-gray-400 font-mono text-xs tracking-widest uppercase hover:text-[#07fc03] border-b border-transparent hover:border-[#07fc03] pb-1 smooth-transition">
                            {user.profile_image_url ? (
                                <img 
                                    src={user.profile_image_url.startsWith('http') ? user.profile_image_url : `${import.meta.env.VITE_API_URL}${user.profile_image_url}`} 
                                    alt="Avatar" 
                                    className="w-5 h-5 rounded-sm object-cover border border-[#07fc03]/50" 
                                />
                            ) : (
                                <User size={14} className="text-[#07fc03]" />
                            )}
                            <span>{user.name}</span>
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="text-xs font-mono tracking-widest uppercase text-gray-500 hover:text-red-500 smooth-transition flex items-center space-x-2"
                        >
                            <span>LOGOUT</span>
                            <LogOut size={14} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={getLinkClass('/login')}>AUTH</Link>
                        <Link to="/register" className="text-xs font-mono tracking-widest uppercase border border-[#07fc03]/40 hover:border-[#07fc03] hover:text-black hover:bg-[#07fc03] text-[#07fc03] px-6 py-2.5 rounded-sm smooth-transition shadow-[0_0_10px_rgba(7,252,3,0.1)] hover:shadow-[0_0_15px_rgba(7,252,3,0.4)]">
                            REGISTER
                        </Link>
                    </>
                )}
                
                {/* Mobile Menu Icon (Visual Only) */}
                <button className="md:hidden text-[#07fc03]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
