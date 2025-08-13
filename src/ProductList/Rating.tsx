import React from "react";
import "./Rating.scss";

interface RatingProps {
  ratingInPercent: number;
  totalRating: number;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="star-rating-container">
      <div className="star-rating-top" style={{ width: rating + "%" }}>
        <div className="star-rating-box">
          <img
            className="star-ratings__stars star-ratings__stars-bottom"
            src="https://img.shop.com/Image/resources/images/star_rating.svg"
            alt=""
          />
        </div>
      </div>
      <div className="star-rating-bottom">
        <div className="star-rating-box">
          <img
            className="star-ratings__stars star-ratings__stars-bottom"
            src="https://img.shop.com/Image/resources/images/star_rating.svg"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};
const Rating: React.FC<RatingProps> = React.memo(
  ({ ratingInPercent = 0, totalRating }) => {
    if (totalRating === 0 || !totalRating) {
      return <></>;
    }
    return (
      <div className="qa-reviews review-container">
        <div className="rating-list-container">
          <StarRating rating={ratingInPercent} />
          <span className="review-count">({totalRating})</span>
        </div>
      </div>
    );
  }
);
export default Rating;
