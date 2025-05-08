import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css'; // Make sure this CSS file is correctly styled

function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    area: '', // Will store the numerical value for input
    areaUnit: 'sqft', // Default unit
    facing: '',
    imageUrls: [],
    features: []
  });
  const [feature, setFeature] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchProperties();
  }, [navigate]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('/api/properties', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      } else {
        setFormError('Could not fetch properties. Please try again later.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProperty({
      ...newProperty,
      [name]: value
    });
  };

  const handleFeatureAdd = () => {
    if (feature.trim()) {
      setNewProperty({
        ...newProperty,
        features: [...newProperty.features, feature.trim()]
      });
      setFeature('');
    }
  };

  const handleFeatureRemove = (index) => {
    setNewProperty({
      ...newProperty,
      features: newProperty.features.filter((_, i) => i !== index)
    });
  };

  const handleEdit = (property) => {
    setNewProperty({
      title: property.title || '',
      description: property.description || '',
      price: property.price !== undefined ? String(property.price) : '',
      location: property.location || '',
      area: property.area !== undefined && property.area !== null ? String(property.area) : '',
      areaUnit: property.areaUnit || 'sqft',
      facing: property.facing || '',
      imageUrls: property.imageUrls || [],
      features: property.features || []
    });
    setEditingId(property._id);
    setFormError(''); // Clear previous form errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validation
    if (!newProperty.title.trim() || !newProperty.description.trim() || newProperty.price.trim() === '' || !newProperty.location.trim() || !newProperty.facing.trim()) {
        setFormError('Please fill all required fields: Title, Description, Price, Location, Facing.');
        return;
    }
    if (newProperty.imageUrls.some(url => !url.trim())) {
        setFormError('All image URLs must be filled if added. Remove empty URL fields or provide a valid URL.');
        return;
    }
    

    const priceValue = parseFloat(newProperty.price);
    if (isNaN(priceValue) || priceValue < 0) {
      setFormError('Price must be a valid non-negative number.');
      return;
    }

    let areaValue;
    let areaUnitValue = newProperty.areaUnit;

    if (newProperty.area.trim() !== '') {
        areaValue = parseFloat(newProperty.area);
        if (isNaN(areaValue) || areaValue < 0) {
            setFormError('Area must be a valid non-negative number if provided.');
            return;
        }
        if (!areaUnitValue) { // Should not happen if dropdown is used correctly
            setFormError('Area unit is required if area value is provided.');
            return;
        }
    } else {
        areaValue = undefined; // Send undefined if area is empty, backend will handle optional nature
        areaUnitValue = undefined; // Don't send unit if no area value
    }

    const payload = {
      ...newProperty,
      price: priceValue,
      area: areaValue,
      areaUnit: areaUnitValue,
      features: Array.isArray(newProperty.features) ? newProperty.features : [],
      imageUrls: Array.isArray(newProperty.imageUrls) ? newProperty.imageUrls.filter(url => url.trim() !== '') : [],
    };

    // Clean up payload: remove area and areaUnit if areaValue is undefined
    if (payload.area === undefined) {
        delete payload.area;
        delete payload.areaUnit;
    }


    try {
      if (editingId) {
        await axios.put(`/api/properties/${editingId}`, payload, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
      } else {
        await axios.post('/api/properties', payload, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
      }
      setNewProperty({ // Reset form
        title: '',
        description: '',
        price: '',
        location: '',
        area: '',
        areaUnit: 'sqft', // Reset to default unit
        facing: '',
        imageUrls: [],
        features: []
      });
      setEditingId(null);
      fetchProperties();
    } catch (error) {
      console.error('Error adding/updating property:', error);
      if (error.response) {
        console.error('Backend Error Status:', error.response.status);
        console.error('Backend Error Data:', error.response.data);
        const backendErrorMessage = typeof error.response.data === 'string' ? error.response.data :
                                    (error.response.data && (error.response.data.message || error.response.data.error)) ? (error.response.data.message || error.response.data.error) :
                                    'An error occurred. Please check details and try again.';
        setFormError(`Server Error: ${backendErrorMessage}`);
        if (error.response.status === 401) {
            localStorage.removeItem('token');
            navigate('/admin/login');
        }
      } else if (error.request) {
        console.error('No response from server:', error.request);
        setFormError('Could not connect to the server. Please check your network connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setFormError(`Request Error: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
        return;
    }
    try {
      await axios.delete(`/api/properties/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      } else {
        setFormError('Failed to delete property. Please try again.');
      }
    }
  };

  const handleImageUrlChange = (index, value) => {
    const updatedUrls = [...newProperty.imageUrls];
    updatedUrls[index] = value;
    setNewProperty({
      ...newProperty,
      imageUrls: updatedUrls
    });
  };

  const handleAddImageUrl = () => {
    setNewProperty({
      ...newProperty,
      imageUrls: [...newProperty.imageUrls, '']
    });
  };

  const handleRemoveImageUrl = (index) => {
    const updatedUrls = newProperty.imageUrls.filter((_, i) => i !== index);
    setNewProperty({
      ...newProperty,
      imageUrls: updatedUrls
    });
  };

  const formatAreaDisplay = (area, unit) => {
    if (area === undefined || area === null || area === '') return 'N/A';
    let unitDisplay = 'sqft'; // Default display string if unit is missing but area exists
    if (unit === 'sqft') unitDisplay = 'sq ft';
    else if (unit === 'sqyd') unitDisplay = 'sq yds';
    else if (unit === 'sqmt') unitDisplay = 'sq m';
    else if (unit === 'acre') unitDisplay = 'acres';
    // Add more units display logic here if needed based on your backend enum
    return `${area} ${unitDisplay}`;
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="add-property-section">
        <h3>{editingId ? 'Edit Property' : 'Add New Property'}</h3>
        {formError && <div className="form-error-message">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={newProperty.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newProperty.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              id="price"
              type="number"
              name="price"
              value={newProperty.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={newProperty.location}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Area</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                name="area"
                value={newProperty.area}
                onChange={handleInputChange}
                placeholder="e.g., 1200"
                style={{ flex: 2 }}
                min="0"
              />
              <select
                name="areaUnit"
                value={newProperty.areaUnit}
                onChange={handleInputChange}
                style={{ flex: 1 }}
                // required={!!newProperty.area.trim()} // Unit required if area is filled
              >
                <option value="sqft">sq ft</option>
                <option value="sqyd">sq yds</option>
                <option value="sqmt">sq m</option>
                <option value="acre">acres</option>
                {/* Add more units based on your backend Property model enum */}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="facing">Facing</label>
            <select
              id="facing"
              name="facing"
              value={newProperty.facing}
              onChange={handleInputChange}
              required
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
          </div>
          <div className="form-group">
            <label>Image URLs (at least one required)</label>
            {newProperty.imageUrls.map((url, idx) => (
              <div key={idx} className="image-url-input">
                <input
                  type="url"
                  value={url}
                  onChange={e => handleImageUrlChange(idx, e.target.value)}
                  placeholder={`Image URL #${idx + 1}`} 
                />
                <button type="button" onClick={() => handleRemoveImageUrl(idx)} className="remove-image-url-button">Remove</button>
              </div>
            ))}
            <button type="button" onClick={handleAddImageUrl} className="add-image-url-button">
              Add Image URL
            </button>
          </div>
          <div className="form-group feature-input-container">
            <label htmlFor="feature-text">Features</label>
            <div className="feature-input">
                <input
                  id="feature-text"
                  type="text"
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  placeholder="Add a feature (e.g., Parking, Garden)"
                />
                <button type="button" onClick={handleFeatureAdd}
                 className="button-inline"> 
                  Add
                </button>
            </div>
          </div>
          <div className="features-list">
            {newProperty.features.map((f, index) => (
              <span key={index} className="feature-tag">
                {f}
                <button
                  type="button"
                  onClick={() => handleFeatureRemove(index)}
                  className="remove-feature"
                  aria-label={`Remove feature ${f}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button type="submit">{editingId ? 'Update Property' : 'Add Property'}</button>
        </form>
      </div>

      <div className="properties-list">
        <h3>Manage Properties</h3>
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property._id} className="property-card">
              <img 
                src={property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls[0] : 'https://via.placeholder.com/250x150.png?text=No+Image'} 
                alt={property.title || 'Property Image'}
                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/250x150.png?text=Invalid+Image'; }}
              />
              <div className="property-info">
                {property.propertyId && 
                    <div className="property-id-display">
                      ID: {property.propertyId}
                    </div>
                }
                <h4>{property.title}</h4>
                <p>₹{property.price ? property.price.toLocaleString() : 'N/A'}</p>
                <p>{property.location}</p>
                <p>Area: {formatAreaDisplay(property.area, property.areaUnit)} | Facing: {property.facing}</p>
                <button
                  onClick={() => handleEdit(property)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(property._id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;