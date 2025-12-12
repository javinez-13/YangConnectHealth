# Setup Guide

Follow these steps to get the Healthcare Website up and running.

## Step 1: Install Dependencies

Run the following command to install all dependencies for both backend and frontend:

```bash
npm run install:all
```

Or install them separately:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Database Setup

The database connection is already configured in `backend/.env` with the provided Neon PostgreSQL connection string.

### Option A: Using the initialization script (Recommended)

```bash
cd backend
npm run init-db
```

This will:
- Create all necessary tables
- Insert sample data (providers, facilities, events)

### Option B: Manual setup

If you prefer to set up the database manually:

1. Connect to your PostgreSQL database
2. Run the schema file:
   ```bash
   psql <your-connection-string> < backend/database/schema.sql
   ```
3. Run the seed file:
   ```bash
   psql <your-connection-string> < backend/database/seed.sql
   ```

## Step 3: Start the Development Servers

### Option A: Run both servers concurrently (Recommended)

From the root directory:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

### Option B: Run servers separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Step 4: Access the Application

1. **Frontend**: Open http://localhost:3000 in your browser
2. **Backend API**: http://localhost:5000/api

## Step 5: Create Your First Account

1. Navigate to http://localhost:3000/register
2. Fill in your details and create an account
3. You'll be automatically logged in and redirected to the dashboard

## Testing the Application

### Sample Data

After running the seed script, you'll have:

- **5 Providers** across different specialties (Cardiology, Pediatrics, Dermatology, etc.)
- **3 Facilities** (Main Medical Center, Northside Clinic, Downtown Health Hub)
- **5 Sample Events** (Classes, Screenings, Webinars)

### Test User Flow

1. **Register/Login**: Create an account or login
2. **Dashboard**: View your personalized dashboard
3. **Schedule**: Book an appointment with a provider
4. **Appointments**: View and manage your appointments
5. **Care Team**: See your providers and facilities
6. **Events**: Browse and register for health events

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify your `DATABASE_URL` in `backend/.env`
2. Ensure your database is accessible
3. Check that SSL is properly configured (required for Neon)

### Port Already in Use

If port 5000 or 3000 is already in use:

1. **Backend**: Change `PORT` in `backend/.env`
2. **Frontend**: Update `NEXT_PUBLIC_API_URL` in your environment or `next.config.js`

### Module Not Found Errors

If you see module errors:

1. Ensure all dependencies are installed: `npm run install:all`
2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules backend/node_modules frontend/node_modules
   npm run install:all
   ```

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://neondb_owner:npg_1DJm8pzfEQKF@ep-long-dew-a10k93ik-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=healthcare-secret-key-2024-production-change
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend

The frontend uses Next.js environment variables. The API URL is configured in `frontend/next.config.js` and defaults to `http://localhost:5000/api`.

To override, create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Next Steps

- Explore the codebase structure
- Customize the design and colors in `frontend/tailwind.config.js`
- Add more features based on your requirements
- Deploy to production (Vercel for frontend, Railway/Render for backend)

## Support

For issues or questions, refer to the main README.md file.

