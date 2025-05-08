import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    area: '',
    facing: '',
    imageUrls: [],
    features: []
  });
  const [feature, setFeature] = useState('');
  const [editingId, setEditingId] = useState(null);
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'imageUrls') {
      setNewProperty({
        ...newProperty,
        imageUrls: value.split(',').map(url => url.trim()).filter(Boolean)
      });
    } else {
      setNewProperty({
        ...newProperty,
        [name]: value
      });
    }
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
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      area: property.area,
      facing: property.facing,
      imageUrls: property.imageUrls,
      features: property.features
    });
    setEditingId(property._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/properties/${editingId}`, newProperty, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
      } else {
        await axios.post('/api/properties', newProperty, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
      }
      setNewProperty({
        title: '',
        description: '',
        price: '',
        location: '',
        area: '',
        facing: '',
        imageUrls: [],
        features: []
      });
      setEditingId(null);
      fetchProperties();
    } catch (error) {
      console.error('Error adding/updating property:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/properties/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
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

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="add-property-section">
        <h3>Add New Property</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={newProperty.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newProperty.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={newProperty.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={newProperty.location}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Area (sq yd)</label>
            <input
              type="number"
              name="area"
              value={newProperty.area}
              onChange={handleInputChange}
            
            />
          </div>
          <div className="form-group">
            <label>Facing</label>
            <select
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
            <label>Image URLs</label>
            {newProperty.imageUrls.map((url, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <input
                  type="url"
                  value={url}
                  onChange={e => handleImageUrlChange(idx, e.target.value)}
                  placeholder={`Image URL #${idx + 1}`}
                  required
                  style={{ flex: 1, marginRight: 8, minWidth: 0 }}
                />
                <button type="button" onClick={() => handleRemoveImageUrl(idx)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', minWidth: 'auto', width: 'auto' }}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={handleAddImageUrl} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', marginTop: 8, width: 'auto', minWidth: 'auto' }}>
              Add URL
            </button>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ flex: '0 0 80px' }}>Features</label>
            <input
              type="text"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="Add a feature"
              style={{ flex: 1, minWidth: 0 }}
            />
            <button type="button" onClick={handleFeatureAdd} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', width: 'auto', minWidth: 'auto' }}>
              Add
            </button>
          </div>
          <div className="features-list">
            {newProperty.features.map((f, index) => (
              <span key={index} className="feature-tag">
                {f}
                <button
                  type="button"
                  onClick={() => handleFeatureRemove(index)}
                  className="remove-feature"
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
              <img src={property.imageUrls[0]} alt={property.title} />
              <div className="property-info">
                <div style={{ fontWeight: 'bold', color: '#888', fontSize: '0.95em', marginBottom: 4 }}>
                  ID: {property.propertyId}
                </div>
                <h4>{property.title}</h4>
                <p>₹{property.price.toLocaleString()}</p>
                <p>{property.location}</p>
                <p>Area: {property.area} sq yd | Facing: {property.facing}</p>
                <button
                  onClick={() => handleDelete(property._id)}
                  className="delete-button"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(property)}
                  className="edit-button"
                  style={{ marginTop: '10px', backgroundColor: '#ffc107', color: '#333' }}
                >
                  Edit
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