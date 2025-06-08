import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  return (
    <Link
      to={`/books/${book._id}`}
      className="block p-4 bg-white shadow rounded hover:shadow-lg transition"
    >
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={book.title}
          className="mb-2 w-full h-48 object-cover rounded"
        />
      )}

      <h3 className="text-xl font-semibold text-blue-700">{book.title}</h3>
      <p className="text-gray-600 text-sm">by {book.author}</p>
      <p className="text-gray-500 text-sm mt-1">Genre: {book.genre}</p>
    </Link>
  );
};

export default BookCard;
