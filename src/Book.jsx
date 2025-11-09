import React from "react";
import "./App.css";

export default function Book({
    image,
    title,
    authors,
    url,
    price,
    isSelected,
    onSelect,
    onLoan,
    onViewDetails,
}) {
    const handleBookClick = () => {
        onSelect();
    };

    const handleViewDetails = (e) => {
        e.stopPropagation(); // Prevent book selection when clicking details button
        if (onViewDetails) {
            onViewDetails();
        }
    };

    return (
        <div
            className={`book normal ${isSelected ? "selected" : ""}`}
            onClick={handleBookClick}>
            <div className='image'>
                <img
                    src={image}
                    alt={title}
                />
                {onLoan && <div className='badge badge-loan'>On loan</div>}
            </div>
            <div className='meta'>
                <h3 className='title'>{title}</h3>
                <p className='author'>{authors}</p>
                {price && <p className='price'>{price}</p>}
                {onViewDetails && (
                    <button
                        className='view-details-btn'
                        onClick={handleViewDetails}
                        title='View book details'>
                        View Details
                    </button>
                )}
            </div>
        </div>
    );
}
