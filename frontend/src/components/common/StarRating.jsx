import React from 'react';
import { Star } from 'lucide-react';

/**
 * Interactive 1-5 star selector used by rating modals.
 *
 * The parent owns the selected value so this component stays reusable across
 * organiser and worker flows. It only renders the UI and reports changes.
 */
export const StarRatingInput = ({ value, onChange, size = 32 }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map((rating) => (
      <button
        key={rating}
        type="button"
        onClick={() => onChange(rating)}
        className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
        aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
      >
        <Star
          size={size}
          className={
            rating <= value
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 hover:text-amber-300'
          }
        />
      </button>
    ))}
  </div>
);

/**
 * Read-only star display for existing ratings.
 */
export const StarDisplay = ({ score, size = 14 }) => {
  const numericScore = Number(score || 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Star
            key={rating}
            size={size}
            className={
              rating <= Math.round(numericScore)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200'
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">
        {numericScore.toFixed(1)}
      </span>
    </div>
  );
};
