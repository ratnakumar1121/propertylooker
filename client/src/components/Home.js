import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [properties, setProperties] = useState([]);
  const [searchParams, setSearchParams] = useState({
    price: '',
    facing: '',
    location: '',
    area: ''
  });
  const [imageIndexes, setImageIndexes] = useState({});

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/properties');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('/api/properties/search', {
        params: searchParams
      });
      setProperties(response.data);
    } catch (error) {
      console.error('Error searching properties:', error);
    }
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
      [propertyId]: prev[propertyId] > 0 ? prev[propertyId] - 1 : imagesLength - 1
    }));
  };

  const handleNextImage = (propertyId, imagesLength) => {
    setImageIndexes(prev => ({
      ...prev,
      [propertyId]: prev[propertyId] < imagesLength - 1 ? prev[propertyId] + 1 : 0
    }));
  };

  return (
    <div className="home">
      <div className="search-section">
        <h2>Search Properties</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="number"
            name="price"
            placeholder="Max Price"
            value={searchParams.price}
            onChange={handleInputChange}
          />
          <select
            name="facing"
            value={searchParams.facing}
            onChange={handleInputChange}
          >
            <option value="">Select Facing</option>
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
            placeholder="Location"
            value={searchParams.location}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="area"
            placeholder="Max Area (sq ft)"
            value={searchParams.area}
            onChange={handleInputChange}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="properties-grid">
        {properties.map((property) => {
          const currentIndex = imageIndexes[property._id] || 0;
          return (
            <div key={property._id} className="property-card">
              {property.imageUrls && property.imageUrls.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <img src={property.imageUrls[currentIndex]} alt={property.title} />
                  {property.imageUrls.length > 1 && (
                    <>
                      <button
                        style={{
                          position: 'absolute',
                          left: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: 36,
                          height: 36,
                          fontSize: '1.5em',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          transition: 'background 0.2s',
                        }}
                        onClick={() => handlePrevImage(property._id, property.imageUrls.length)}
                        aria-label="Previous image"
                      >&#8592;</button>
                      <button
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: 36,
                          height: 36,
                          fontSize: '1.5em',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          transition: 'background 0.2s',
                        }}
                        onClick={() => handleNextImage(property._id, property.imageUrls.length)}
                        aria-label="Next image"
                      >&#8594;</button>
                    </>
                  )}
                </div>
              )}
              <div className="property-info">
                <h3>{property.title}</h3>
                <p className="price">₹{property.price.toLocaleString()}</p>
                <p className="location">{property.location}</p>
                <p className="details">
                  Area: {property.area} sq ft | Facing: {property.facing}
                </p>
                <p className="description">{property.description}</p>
                <div className="features">
                  {property.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home; 