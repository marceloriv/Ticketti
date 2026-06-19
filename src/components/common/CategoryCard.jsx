import React from 'react';

const CategoryCard = ({ title, imgSrc, description, onClick }) => {
  return (
    <div className="category-card text-center h-100 p-3 shadow-sm rounded" role="button" onClick={onClick}>
      <div className="category-icon mb-3">
        <img src={imgSrc} alt={title} className="category-card-image" />
      </div>
      <h3 className="h5 mb-2">{title}</h3>
      {description && <p className="text-muted small mb-3">{description}</p>}
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick();
        }}
      >
        Ver más
      </button>
    </div>
  );
};

export default CategoryCard;
