# Trust Coin - Full Stack Application

A full-stack cryptocurrency/digital currency application built with React (frontend) and Node.js/Express (backend).

## 🏗️ Project Structure

```
trust-coin/
├── backend/          # Node.js/Express API server
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Authentication & middleware
│   ├── Server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   ├── .env          # Environment variables (keep secret)
│   └── .env.example  # Example environment file
│
├── frontend/         # React + Vite frontend
│   ├── src/          # React components
│   ├── index.html    # HTML entry point
│   ├── package.json  # Frontend dependencies
│   ├── .env          # Environment variables
│   └── .env.example  # Example environment file
│
└── render.yaml       # Render.com deployment config
```

## 🚀 Deployment on Render.com

### Prerequisites
- GitHub repository with this code pushed
- Render.com account (free or paid)
- MongoDB Atlas cluster for database

### ⚙️ Step-by-Step Deployment

#### 1. **Set Up MongoDB**
   - Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string (MONGO_URI)
   - Allow all IP addresses (0.0.0.0) or Render's IP range

#### 2. **Connect GitHub to Render**
   - Log in to [Render.com](https://render.com)
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Choose the repository containing this project

#### 3. **Deploy Backend API**
   - Service Type: **Web Service**
   - Name: `trust-coin-api`
   - Environment: **Node**
   - Build Command:
     ```
     cd backend && npm install
     ```
   - Start Command:
     ```
     cd backend && npm start
     ```
   - Root Directory: (leave blank)
   - Plan: Free tier or higher
   - **Environment Variables:**
     ```
     NODE_ENV=production
     PORT=10000
     MONGO_URI=<your_mongodb_atlas_connection_string>
     JWT_SECRET=<your_secret_key>
     FRONTEND_URL=https://trust-coin-frontend.onrender.com
     ```
   - Deploy and wait for it to finish (may take 2-3 minutes)
   - Note the backend URL: `https://trust-coin-api.onrender.com`

#### 4. **Deploy Frontend**
   - Create another Web Service for frontend
   - Service Type: **Web Service**
   - Name: `trust-coin-frontend`
   - Environment: **Node**
   - Build Command:
     ```
     cd frontend && npm install && npm run build
     ```
   - Start Command:
     ```
     cd frontend && npm run preview
     ```
   - **Publish Directory:** `frontend/dist`
   - Root Directory: (leave blank)
   - **Environment Variables:**
     ```
     VITE_API_URL=https://trust-coin-api.onrender.com
     ```
   - Deploy and wait for it to finish
   - Note the frontend URL: `https://trust-coin-frontend.onrender.com`

#### 5. **Using render.yaml (Optional - Automatic Deployment)**
   If your repository has `render.yaml` in the root:
   - Render will automatically detect and deploy both services
   - Update the environment variable values in the Render dashboard:
     - `MONGO_URI`
     - `JWT_SECRET`
     - Frontend/Backend URLs matching your Render service URLs

### 🔑 Environment Variables Setup

**Backend (.env):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=5005
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173
```

**Backend (.env for Render):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=10000
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=https://trust-coin-frontend.onrender.com
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5005
```

**Frontend (.env for Render):**
```env
VITE_API_URL=https://trust-coin-api.onrender.com
```

## 💻 Local Development

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your MongoDB URI and JWT_SECRET
# Then start the server
npm run dev
# or
npm start
```

Server runs on `http://localhost:5005`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### Running Both Together
Open two terminals:
- Terminal 1: `cd backend && npm start`
- Terminal 2: `cd frontend && npm run dev`

Then visit `http://localhost:5173`

## 📝 Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start the development server

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🔧 Technology Stack

**Frontend:**
- React 19
- Vite (build tool)
- React Router DOM (routing)
- Axios (HTTP client)
- Recharts (charts)
- Lucide React (icons)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT (authentication)
- CORS (cross-origin)
- Bcryptjs (password hashing)
- Multer (file uploads)

## 🛠️ Important Configuration Notes

### CORS Configuration
The backend CORS is configured to accept requests from:
- Development: `http://localhost:5173` (default)
- Production: Your Render frontend URL

Update the `FRONTEND_URL` environment variable when deploying to change this.

### API Calls
All frontend API calls use a centralized `apiClient` utility located at:
```
frontend/src/utils/apiClient.js
```

This client:
- Uses `VITE_API_URL` from environment variables
- Automatically attaches JWT tokens from localStorage
- Handles authentication headers

### Environment Variables
- **Never commit `.env` files** to version control
- Use `.env.example` as reference
- Create `.env` locally with your actual secrets

## 🚀 Production Optimization

### Frontend
- Build optimization: Minified bundle
- Lazy loading: Route-based code splitting
- Environment detection: Different API endpoints for dev/prod

### Backend
- CORS whitelist: Only accepts requests from your frontend
- JWT authentication: Secure API endpoints
- MongoDB optimization: Indexed queries

## 📊 Database

Uses MongoDB with the following models:
- User (authentication, profile)
- Transaction (money transfers)
- Plan (pricing tiers)
- Store (admin stores)
- RechargeRequest (fund requests)

Connection string required: `MONGO_URI`

## 🔐 Security

- Passwords hashed with bcryptjs
- API protected with JWT tokens
- CORS enabled only for specified frontend URL
- Environment variables for sensitive data
- No hardcoded URLs in code

## 🐛 Troubleshooting

**Frontend can't connect to API:**
- Check `VITE_API_URL` environment variable
- Ensure backend is running and accessible
- Check CORS settings in `backend/Server.js`
- Verify backend `FRONTEND_URL` matches frontend domain

**Database connection fails:**
- Check `MONGO_URI` is correct
- Ensure IP whitelist allows your connection
- Verify MongoDB Atlas cluster is running

**Build fails on Render:**
- Check `package.json` has all dependencies
- Verify build scripts in `package.json`
- Check for syntax errors: Run `npm run build` locally

## 📞 Support

For issues or questions, refer to the configuration files:
- Backend structure: `backend/Server.js`
- Frontend API calls: `frontend/src/utils/apiClient.js`
- Routes: `backend/routes/`

---

**Happy Deploying!** 🎉
