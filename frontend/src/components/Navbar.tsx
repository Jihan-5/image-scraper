import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiImage, FiClock, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ImageScraper
          </span>
        </Link>

        <div className="hidden md:flex space-x-1">
          <NavItem to="/" icon={<FiHome />} text="Home" />
          <NavItem to="/scraper" icon={<FiImage />} text="Scraper" />
          <NavItem to="/history" icon={<FiClock />} text="History" />
          {user && <NavItem to="/profile" icon={<FiUser />} text="Profile" />}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <button
              onClick={logout}
              className="flex items-center space-x-1 text-red-500 hover:text-red-700"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
            >
              <FiLogIn />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      }`
    }
  >
    {icon}
    <span>{text}</span>
  </NavLink>
);