import { useEffect, useState } from "react";
import axios from "axios";
import BookCard from "../components/BookCard"; // Adjust the path as needed

const Home = () => {
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState({ author: "", genre: "" });
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const query = new URLSearchParams(filter).toString();
      const res = await axios.get(`${baseURL}/books?${query}`);
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Explore Books</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by author"
          value={filter.author}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, author: e.target.value }))
          }
          className="p-2 border rounded w-1/2"
        />
        <input
          type="text"
          placeholder="Filter by genre"
          value={filter.genre}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, genre: e.target.value }))
          }
          className="p-2 border rounded w-1/2"
        />
      </div>

      {loading ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
