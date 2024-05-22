import React, { useState, useEffect } from 'react';
import { useAuth } from '../contxt/AuthContext';

export default function Reviews() {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(1);
  const [reviews, setReviews] = useState([]);
  const { isLoggedIn, login, logout} = useAuth();

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/reviewsList');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    // Fetch existing reviews from the server when the component mounts

    fetchReviews();
    const id = localStorage.getItem('id');
    if (id) {
        login();
    } else {
        logout();
    }
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const date = new Date().toLocaleString();
    console.log(localStorage.getItem('id'));
    console.log(rating);
    console.log(reviewText);
    console.log(date);

    try {
      const response = await fetch('http://localhost:5000/reviews', {
        method: 'POST',
        body: JSON.stringify({user_id: localStorage.getItem('id'), rating: rating, content: reviewText, date: date}),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setReviews([...reviews, data]);
        setReviewText('');
        setRating(1);
        fetchReviews();
        alert('Review submitted successfully');
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  const renderReviews = () => {
    return reviews.map((review, index) => (
      <div key={index} className="review">
        <p><strong>{review.email}</strong> ({review.date}):</p>
        <p>Rating: {review.rating}</p>
        <p>{review.content}</p>
      </div>
    ));
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <h2>Submit a Review</h2>
          <form onSubmit={handleReviewSubmit}>
            <div>
              <label>Rating: </label>
              <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))} required>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Review: </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
            </div>
            <button type="submit">Submit Review</button>
          </form>
          <h2>Reviews</h2>
          {renderReviews()}
        </div>
      ) : (
        <p>Please log in to submit a review</p>
      )}
    </div>
  );
}
