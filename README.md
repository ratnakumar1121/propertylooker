# Property Looker

A real estate property listing website where users can browse properties and administrators can manage property listings.

## Features

- Browse property listings without login
- Search properties by price, facing, location, and area
- Admin dashboard for managing properties
- Secure admin authentication
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd property-looker
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/property-looker
JWT_SECRET=your_jwt_secret_key_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=5000
```

5. Start the development servers:

For backend:
```bash
npm run dev
```

For frontend:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Admin Access

Default admin credentials:
- Username: admin
- Password: admin123

## API Endpoints

### Public Endpoints
- GET /api/properties - Get all properties
- GET /api/properties/search - Search properties

### Admin Endpoints (requires authentication)
- POST /api/auth/login - Admin login
- POST /api/properties - Add new property
- DELETE /api/properties/:id - Delete property

## Technologies Used

- Frontend:
  - React
  - React Router
  - Axios
  - CSS3

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication 