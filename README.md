# Qiskit Fall Fest 2026

A comprehensive event management platform for the Qiskit Fall Fest 2026, featuring registration, workshops, hackathon management, and certificate generation.

## Features

- 🎫 **Event Registration** - Easy registration for attendees
- 🎓 **Workshop Management** - Schedule and manage workshop sessions
- 🚀 **Hackathon Platform** - Team creation and hackathon management
- 🏆 **Certificate Generation** - Automated certificate creation and verification
- 📊 **Health Monitoring** - API health check endpoints
- 🔒 **Error Handling** - Comprehensive error handling and validation
- ⚡ **Rate Limiting** - API rate limiting for protection

## Tech Stack

### Frontend
- React 18.2
- Vite
- JavaScript/JSX
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Quick Start

### Prerequisites
- Node.js 16 or higher
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd qiskit-fall-fest-2026
```

2. **Backend Setup**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The backend will run on `http://localhost:3000`

3. **Frontend Setup**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Project Structure

```
qiskit-fall-fest-2026/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── data/            # Static data
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                 # Express backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Middleware
│   │   ├── config/          # Configuration
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── database/                # Database files
│   ├── migrations/
│   ├── seeds/
│   └── schema/
│
├── docs/                    # Documentation
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── deployment.md
│
├── .gitignore
└── README.md
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Registration
- `POST /api/registration/register` - Register for event
- `GET /api/registration` - Get all registrations
- `GET /api/registration/:id` - Get specific registration
- `PUT /api/registration/:id` - Update registration
- `DELETE /api/registration/:id` - Delete registration

### Workshops
- `GET /api/workshop` - Get all workshops
- `GET /api/workshop/:id` - Get specific workshop
- `POST /api/workshop/:workshopId/register` - Register for workshop
- `GET /api/workshop/:workshopId/attendees` - Get workshop attendees

### Hackathon
- `GET /api/hackathon` - Get hackathon info
- `POST /api/hackathon/team/create` - Create team
- `GET /api/hackathon/teams` - Get all teams
- `POST /api/hackathon/team/:teamId/join` - Join team
- `POST /api/hackathon/team/:teamId/leave` - Leave team

### Certificates
- `GET /api/certificate/:registrationId` - Generate certificate
- `GET /api/certificate/verify/:certId` - Verify certificate

See [API Documentation](./docs/api.md) for detailed endpoints.

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/qiskit-fall-fest
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)

## Development

### Running in Development Mode

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend**
```bash
cd backend
npm run build
npm start
```

**Frontend**
```bash
cd frontend
npm run build
# Serves from dist/ directory
```

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@qiskit-fall-fest.com or create an issue in the repository.

## Acknowledgments

- Qiskit Community
- Event Organizers
- Contributors and Volunteers
