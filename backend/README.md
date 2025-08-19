# Smart Helpdesk

A full-stack helpdesk application with Node.js/Express backend and React frontend.

## Project Structure

```
smart-helpdesk/
├── backend/                 # Node.js + Express + Mongoose
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── controllers/        # Route handlers
│   ├── middlewares/        # Custom middleware
│   ├── utils/              # Utility functions
│   ├── server.js           # Express server entry point
│   └── package.json        # Backend dependencies
├── frontend/                # React + Vite + Redux
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind CSS config
└── README.md               # This file
```

## Features

### Backend
- Express.js server with middleware (CORS, Morgan, Cookie Parser)
- MongoDB connection with Mongoose
- JWT authentication with bcrypt password hashing
- User model with name, email, password hash, and role
- Environment variable support with dotenv
- RESTful API endpoints for authentication

### Frontend
- React 19 with Vite for fast development
- React Router for client-side routing
- Redux Toolkit for state management
- Tailwind CSS for styling
- Protected routes with authentication
- Responsive design

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd smart-helpdesk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend root:
   ```env
   PORT=8080
   MONGO_URI=mongodb://127.0.0.1:27017/smart-helpdesk
   JWT_SECRET=your_super_secret_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Health Check
- `GET /health` - Server health status

## Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technologies Used

### Backend
- Node.js
- Express.js
- Mongoose (MongoDB ODM)
- JWT (JSON Web Tokens)
- bcryptjs (Password hashing)
- dotenv (Environment variables)
- CORS (Cross-origin resource sharing)
- Morgan (HTTP request logger)

### Frontend
- React 19
- Vite (Build tool)
- React Router (Routing)
- Redux Toolkit (State management)
- Tailwind CSS (Styling)

## Development

The application is set up with a modern development workflow:
- Hot reloading for both frontend and backend
- Environment-based configuration
- Modular component architecture
- Type-safe Redux state management
- Responsive design with Tailwind CSS

## License

ISC
