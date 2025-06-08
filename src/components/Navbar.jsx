import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-semibold text-blue-600">BookReview</Link>
      <div className="flex gap-4">
        {!user ? (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link to="/signup" className="text-gray-700 hover:text-blue-600">Signup</Link>
          </>
        ) : (
          <>
            <Link to="/add-book" className="text-gray-700 hover:text-blue-600">Add Book</Link>
            <button onClick={logout} className="text-red-500 hover:text-red-700">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
