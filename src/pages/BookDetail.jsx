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
        `${baseURL}/books/${id}/reviews`,
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
      await axios.delete(`${baseURL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((r) => r._id !== reviewId));
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
        <div>
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
            {averageRating ? `${averageRating.toFixed(1)} / 5.0` : "No ratings yet"}
          </p>
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
              <div key={idx} className="p-4 bg-gray-100 rounded shadow-sm relative">
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
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteReview(review._id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
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
                          `${baseURL}/books/${editingReview._id}`,
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
