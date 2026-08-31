# Deployment Guide

## Prerequisites
- Node.js 16+
- MongoDB (local or cloud)
- npm or yarn package manager

## Environment Setup

### Backend (.env)
```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qiskit-fall-fest
JWT_SECRET=your_secure_secret_key
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env)
```
VITE_API_URL=https://api.yourdomain.com
```

## Deployment Steps

### 1. Backend Deployment

#### Using Node.js directly
```bash
cd backend
npm install
npm run build
npm start
```

#### Using Docker
```bash
# Create Dockerfile in backend/
docker build -t qiskit-backend .
docker run -p 3000:3000 --env-file .env qiskit-backend
```

#### Using Heroku
```bash
heroku login
heroku create qiskit-fall-fest-backend
git push heroku main
```

### 2. Frontend Deployment

#### Build for production
```bash
cd frontend
npm install
npm run build
```

#### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

#### Deploy to Netlify
```bash
npm run build
# Upload 'dist' folder to Netlify
```

#### Using Docker
```bash
docker build -t qiskit-frontend .
docker run -p 5173:5173 qiskit-frontend
```

## Database Setup

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create a cluster
3. Create a user with read/write permissions
4. Get connection string
5. Update `MONGODB_URI` in backend `.env`

### Local MongoDB
```bash
# Install MongoDB
# Start MongoDB service
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Monitoring and Logging

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Logging
Configure logging in backend:
```javascript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})
```

## Performance Optimization

### Frontend
- Enable gzip compression
- Minify CSS and JavaScript
- Use CDN for static assets
- Implement lazy loading

### Backend
- Use connection pooling for MongoDB
- Implement caching (Redis)
- Enable request compression
- Use clustering for multi-core servers

## SSL/TLS Certificate

Use Let's Encrypt for free SSL certificates:
```bash
certbot certonly --standalone -d yourdomain.com
```

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run build
      - run: npm run deploy
```

## Troubleshooting

### Connection Issues
- Check firewall settings
- Verify MongoDB connection string
- Check CORS configuration

### Performance Issues
- Monitor database queries
- Use database indexing
- Implement pagination for large datasets

### Deployment Failures
- Check logs: `heroku logs --tail`
- Verify environment variables
- Test locally before deploying
