import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ score }) => {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      if (starValue <= score) {
        return <FaStar key={index} className="text-yellow-500" />;
      } else if (starValue - score < 1) {
        return <FaStarHalfAlt key={index} className="text-yellow-500" />;
      } else {
        return <FaRegStar key={index} className="text-gray-400" />;
      }
    });
  };

  return <div className="flex">{renderStars()}</div>;
};

export default StarRating;
