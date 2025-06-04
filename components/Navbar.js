import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function Navbar() {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      {/* ...existing code... */}
      <button 
        onClick={toggleDarkMode}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600"
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
      {/* ...existing code... */}
    </nav>
  );
}

export default Navbar;