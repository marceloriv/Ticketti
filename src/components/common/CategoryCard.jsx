import React from 'react';

const CategoryCard = ({ title, imgSrc, description, onClick }) => {
  return (
    <div
      className="category-card text-center h-100 p-3 shadow-sm rounded"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Explorar categoría ${title}`}
    >
      <div className="category-icon mb-3">
        <img src={imgSrc} alt={title} className="category-card-image" loading="lazy" />
      </div>
      <h3 className="h5 mb-2">{title}</h3>
      {description && <p className="text-muted small mb-3">{description}</p>}
      <button
        className="btn btn-sm btn-outline-primary"
        tabIndex={-1}
        aria-hidden="true"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        Ver más
      </button>
    </div>
  );
};

export default CategoryCard;
