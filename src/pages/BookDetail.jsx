import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BookDetail = () => {
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ comment: "", rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`${baseURL}/books/${id}`);
        setBook(res.data.book);
        setReviews(res.data.reviews);
        setAverageRating(res.data.averageRating);
      } catch (err) {
        console.error("Failed to fetch book", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${baseURL}/review/${id}/reviews`,
        newReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews((prev) => [...prev, res.data]);
      setNewReview({ comment: "", rating: 0 });
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${baseURL}/review/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const deleteBook = async (bookId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${baseURL}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/");
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const startEditReview = (review) => {
    setEditingReview({ ...review });
  };


  const renderStars = (count) => "⭐".repeat(count) + "☆".repeat(5 - count);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!book) return <p className="p-4">Book not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        className="mb-4 text-sm text-blue-500 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </button>

      {/* Book Info */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
  {book.imageUrl && (
    <img
      src={book.imageUrl}
      alt={book.title}
      className="w-full md:w-64 h-80 object-cover rounded shadow"
    />
  )}

  <div className="flex-1">
    {editingBook ? (
      <div className="w-full bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 className="text-2xl font-semibold text-blue-700 mb-4">Edit Book</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-gray-700 mb-1 font-medium">Title</label>
      <input
        type="text"
        value={editingBook.title}
        onChange={(e) =>
          setEditingBook((prev) => ({ ...prev, title: e.target.value }))
        }
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-gray-700 mb-1 font-medium">Author</label>
      <input
        type="text"
        value={editingBook.author}
        onChange={(e) =>
          setEditingBook((prev) => ({ ...prev, author: e.target.value }))
        }
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-gray-700 mb-1 font-medium">Genre</label>
      <input
        type="text"
        value={editingBook.genre}
        onChange={(e) =>
          setEditingBook((prev) => ({ ...prev, genre: e.target.value }))
        }
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-gray-700 mb-1 font-medium">Change Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setEditingBook((prev) => ({
            ...prev,
            newImage: e.target.files[0],
          }))
        }
        className="w-full p-1 border border-gray-300 rounded bg-white file:mr-4 file:py-1 file:px-2 file:border file:rounded file:border-gray-300 file:text-sm file:bg-blue-50 file:text-blue-700"
      />
    </div>
  </div>

  <div className="flex justify-end gap-4 mt-6">
    <button
      onClick={async () => {
        try {
          const token = localStorage.getItem("token");
          const formData = new FormData();
          formData.append("title", editingBook.title);
          formData.append("author", editingBook.author);
          formData.append("genre", editingBook.genre);
          if (editingBook.newImage) {
            formData.append("image", editingBook.newImage);
          }

          const res = await axios.put(
            `${baseURL}/books/${book._id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          setBook(res.data);
          setEditingBook(null);
        } catch (err) {
          console.error("Failed to update book", err);
        }
      }}
      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded transition"
    >
      Save
    </button>

    <button
      onClick={() => setEditingBook(null)}
      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-5 rounded transition"
    >
      Cancel
    </button>
  </div>
</div>

    ) : (
      <>
        <h2 className="text-3xl font-bold text-blue-600 mb-2">
          {book.title}
        </h2>
        <p className="text-gray-800 mb-1">
          <strong>Author:</strong> {book.author}
        </p>
        <p className="text-gray-800 mb-1">
          <strong>Genre:</strong> {book.genre}
        </p>
        <p className="text-gray-700 mt-2">
          <strong>Average Rating:</strong>{" "}
          {averageRating
            ? `${averageRating.toFixed(1)} / 5.0`
            : "No ratings yet"}
        </p>

        {JSON.stringify(book.createdBy) === currentUserId && (
          <div className="flex gap-3 mt-3">
            <button
              onClick={() =>
                setEditingBook({
                  title: book.title,
                  author: book.author,
                  genre: book.genre,
                })
              }
              className="text-sm text-blue-500 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition border"
            >
              Edit
            </button>
            <button
              onClick={() => deleteBook(book._id)}
              className="text-sm text-red-500 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition border"
            >
              Delete
            </button>
          </div>
        )}
      </>
    )}
  </div>
</div>

      {/* Reviews Section */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-3 text-blue-500">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-100 rounded shadow-sm relative"
              >
                <p className="text-gray-800 italic">"{review.comment}"</p>
                <p className="text-sm text-yellow-600 mt-1">
                  Rating: {renderStars(review.rating)} ({review.rating}/5)
                </p>
                <p className="text-sm text-gray-500">
                  By: {review.createdBy || "Anonymous"}
                </p>

                {JSON.stringify(review.userId) === currentUserId && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => startEditReview(review)}
                      className="text-sm text-blue-500 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="text-sm text-red-500 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {editingReview?._id === review._id && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const token = localStorage.getItem("token");
                      try {
                        const res = await axios.put(
                          `${baseURL}/review/${editingReview._id}`,
                          {
                            rating: editingReview.rating,
                            comment: editingReview.comment,
                          },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setReviews((prev) =>
                          prev.map((r) =>
                            r._id === editingReview._id ? res.data : r
                          )
                        );
                        setEditingReview(null);
                      } catch (err) {
                        console.error("Update failed", err);
                      }
                    }}
                    className="mt-4 space-y-2"
                  >
                    <textarea
                      rows={3}
                      value={editingReview.comment}
                      onChange={(e) =>
                        setEditingReview((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded"
                    />
                    <select
                      value={editingReview.rating}
                      onChange={(e) =>
                        setEditingReview((prev) => ({
                          ...prev,
                          rating: parseInt(e.target.value),
                        }))
                      }
                      className="w-full p-2 border rounded"
                    >
                      {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>
                          {r} - {renderStars(r)}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingReview(null)}
                        className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Review Form */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-3">Leave a Review</h3>
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <textarea
            required
            rows={3}
            placeholder="Write your thoughts..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview((prev) => ({ ...prev, comment: e.target.value }))
            }
            className="w-full p-2 border rounded"
          />
          <div>
            <label className="block mb-1">Rating:</label>
            <select
              required
              value={newReview.rating}
              onChange={(e) =>
                setNewReview((prev) => ({
                  ...prev,
                  rating: parseInt(e.target.value),
                }))
              }
              className="p-2 border rounded w-full"
            >
              <option value={0}>Select Rating</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} - {renderStars(r)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookDetail;
