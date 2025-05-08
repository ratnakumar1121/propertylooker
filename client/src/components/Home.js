import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css'; // Ensure this CSS file is correctly styled

function Home() {
  const [properties, setProperties] = useState([]);
  const [searchParams, setSearchParams] = useState({
    price: '',
    facing: '',
    location: '',
    area: '' // For "Max Area" numerical input
  });
  const [imageIndexes, setImageIndexes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (params = {}) => {
    setIsLoading(true);
    setError('');
    try {
      // Use GET /api/properties/search for all fetching, including initial load if no params
      const endpoint = Object.keys(params).length > 0 ? '/api/properties/search' : '/api/properties';
      const response = await axios.get(endpoint, { params });
      setProperties(response.data);
      const newImageIndexes = {};
      response.data.forEach(p => { newImageIndexes[p._id] = 0; });
      setImageIndexes(newImageIndexes);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => { // Renamed to avoid conflict with form's onSubmit
    e.preventDefault();
    const activeSearchParams = {};
    for (const key in searchParams) {
      if (searchParams[key] !== '' && searchParams[key] !== null) {
        activeSearchParams[key] = searchParams[key];
      }
    }
    fetchProperties(activeSearchParams); // Pass active search params
  };

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handlePrevImage = (propertyId, imagesLength) => {
    setImageIndexes(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] || 0) > 0 ? (prev[propertyId] || 0) - 1 : imagesLength - 1
    }));
  };

  const handleNextImage = (propertyId, imagesLength) => {
    setImageIndexes(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] || 0) < imagesLength - 1 ? (prev[propertyId] || 0) + 1 : 0
    }));
  };

  const formatAreaDisplay = (area, unit) => {
    if (area === undefined || area === null || area === '') return 'N/A';
    let unitDisplay = 'sqft'; // Default display string
    if (unit === 'sqft') unitDisplay = 'sq ft';
    else if (unit === 'sqyd') unitDisplay = 'sq yds';
    else if (unit === 'sqmt') unitDisplay = 'sq m';
    else if (unit === 'acre') unitDisplay = 'acres';
    return `${area} ${unitDisplay}`;
  };

  return (
    <div className="home">
      <div className="search-section">
        <h2>Find Your Dream Property</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="number"
            name="price"
            placeholder="Max Price (₹)"
            value={searchParams.price}
            onChange={handleInputChange}
            min="0"
            aria-label="Maximum price"
          />
          <select
            name="facing"
            value={searchParams.facing}
            onChange={handleInputChange}
            aria-label="Property facing direction"
          >
            <option value="">Any Facing</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North-East">North-East</option>
            <option value="North-West">North-West</option>
            <option value="South-East">South-East</option>
            <option value="South-West">South-West</option>
          </select>
          <input
            type="text"
            name="location"
            placeholder="Location (e.g., City, Area)"
            value={searchParams.location}
            onChange={handleInputChange}
            aria-label="Property location"
          />
          <input
            type="number"
            name="area"
            placeholder="Max Area (e.g., 1500)"
            value={searchParams.area}
            onChange={handleInputChange}
            min="0"
            aria-label="Maximum area"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {isLoading && <div className="loading-indicator">Loading properties...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!isLoading && !error && properties.length === 0 && (
        <div className="no-properties-found">
          No properties found matching your criteria. Try adjusting your search.
        </div>
      )}

      {!isLoading && !error && properties.length > 0 && (
        <div className="properties-grid">
          {properties.map((property) => {
            const currentIndex = imageIndexes[property._id] || 0;
            const hasMultipleImages = property.imageUrls && property.imageUrls.length > 1;
            return (
              <div key={property._id} className="property-card">
                {property.imageUrls && property.imageUrls.length > 0 ? (
                  <div className="property-image-container">
                    <img 
                      src={property.imageUrls[currentIndex] || 'https://via.placeholder.com/300x200.png?text=Image+Not+Available'} 
                      alt={property.title || 'Property image'}
                      className="property-image"
                      onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/300x200.png?text=Invalid+Image'; }}
                    />
                    {hasMultipleImages && (
                      <>
                        <button
                          className="carousel-button prev"
                          onClick={() => handlePrevImage(property._id, property.imageUrls.length)}
                          aria-label="Previous image"
                        >←</button>
                        <button
                          className="carousel-button next"
                          onClick={() => handleNextImage(property._id, property.imageUrls.length)}
                          aria-label="Next image"
                        >→</button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="property-image-container">
                    <img 
                      src='https://via.placeholder.com/300x200.png?text=No+Image+Available' 
                      alt='No image available'
                      className="property-image"
                    />
                  </div>
                )}
                <div className="property-info">
                  {property.propertyId && 
                      <div className="property-id">
                        ID: {property.propertyId}
                      </div>
                  }
                  <h3>{property.title}</h3>
                  <p className="price">₹{property.price ? property.price.toLocaleString() : 'Price not available'}</p>
                  <p className="location"><span role="img" aria-label="location pin">📍</span> {property.location}</p>
                  <p className="details">
                    Area: {formatAreaDisplay(property.area, property.areaUnit)}
                    {property.facing && ` | Facing: ${property.facing}`}
                  </p>
                  <p className="description">{property.description}</p>
                  {property.features && property.features.length > 0 && (
                      <div className="features">
                        <h4>Features:</h4>
                        <ul>
                          {property.features.map((feature, index) => (
                            <li key={index} className="feature-tag">
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Home;