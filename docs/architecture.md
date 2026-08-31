# Architecture

## Overview

Qiskit Fall Fest 2026 is a full-stack web application for managing a quantum computing event, including registration, workshops, hackathon, and certificate management.

## Technology Stack

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite
- **Language**: JavaScript/JSX

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB

## Project Structure

```
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── data/         # Static data files
│   │   └── utils/        # Utility functions
│   └── vite.config.js
│
├── backend/          # Express backend API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   └── server.js
│
├── database/         # Database files
│   ├── migrations/   # Database migrations
│   ├── seeds/        # Database seeds
│   └── schema/       # Database schemas
│
└── docs/            # Documentation
```

## Data Flow

1. **Frontend** → Makes API calls via the API service layer
2. **Backend Routes** → Receive requests and route to controllers
3. **Controllers** → Validate input and call services
4. **Services** → Handle business logic and data operations
5. **Database** → Persist and retrieve data

## Key Features

- User registration for the event
- Workshop management and registration
- Hackathon team management
- Certificate generation and verification
- Health check endpoint

## Running the Application

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Environment Configuration

Both frontend and backend require `.env` files. See `.env.example` files for reference.
