# Database Documentation

## Database Type
MongoDB

## Connection String
Default: `mongodb://localhost:27017/qiskit-fall-fest`

Configure via `MONGODB_URI` environment variable.

## Collections

### registrations
Stores event registration information.

**Fields:**
- `_id`: ObjectId (auto-generated)
- `firstName`: String
- `lastName`: String
- `email`: String (unique)
- `phone`: String
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `email` (unique)

### workshops
Stores workshop information.

**Fields:**
- `_id`: ObjectId
- `title`: String
- `description`: String
- `instructor`: String
- `duration`: String
- `level`: String (Beginner, Intermediate, Advanced)
- `maxAttendees`: Number
- `createdAt`: Date

### workshop_attendees
Stores workshop attendance records.

**Fields:**
- `_id`: ObjectId
- `workshopId`: ObjectId (reference to workshops)
- `registrationId`: ObjectId (reference to registrations)
- `registeredAt`: Date

**Indexes:**
- `workshopId`
- `registrationId`

### hackathon_teams
Stores hackathon team information.

**Fields:**
- `_id`: ObjectId
- `teamName`: String
- `leaderId`: String
- `members`: [String] (array of member IDs)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:**
- `teamName` (unique)

### certificates
Stores certificate information.

**Fields:**
- `_id`: ObjectId
- `certId`: String (unique)
- `registrationId`: ObjectId (reference to registrations)
- `issuedAt`: Date
- `filePath`: String

**Indexes:**
- `certId` (unique)
- `registrationId`

## Database Operations

### Connection Setup
```javascript
import mongoose from 'mongoose'

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/qiskit-fall-fest'
await mongoose.connect(mongoUri)
```

### Model Definition
Models are typically defined in a `models/` directory with Mongoose schemas.

## Backup and Recovery

Regular backups are recommended for production environments.

```bash
# Backup
mongodump --uri "mongodb://localhost:27017/qiskit-fall-fest" --out ./backup

# Restore
mongorestore --uri "mongodb://localhost:27017/qiskit-fall-fest" ./backup
```
