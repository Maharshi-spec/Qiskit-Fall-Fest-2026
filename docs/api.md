# API Documentation

## Base URL
`http://localhost:3000/api`

## Health Check

### GET /health
Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-31T10:00:00.000Z",
  "uptime": 3600
}
```

## Registration Endpoints

### POST /registration/register
Create a new registration.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123456",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "createdAt": "2026-08-31T10:00:00.000Z"
  }
}
```

### GET /registration/:id
Get a specific registration.

### GET /registration
Get all registrations.

### PUT /registration/:id
Update a registration.

### DELETE /registration/:id
Delete a registration.

## Workshop Endpoints

### GET /workshop
Get all workshops.

### GET /workshop/:id
Get a specific workshop.

### POST /workshop/:workshopId/register
Register for a workshop.

**Request Body:**
```json
{
  "attendeeId": "user123"
}
```

### POST /workshop/:workshopId/unregister
Unregister from a workshop.

### GET /workshop/:workshopId/attendees
Get workshop attendees.

## Hackathon Endpoints

### GET /hackathon
Get hackathon information.

### POST /hackathon/team/create
Create a new hackathon team.

**Request Body:**
```json
{
  "teamName": "Quantum Dream",
  "leaderId": "user123"
}
```

### GET /hackathon/teams
Get all hackathon teams.

### GET /hackathon/team/:teamId
Get a specific team.

### POST /hackathon/team/:teamId/join
Join a hackathon team.

**Request Body:**
```json
{
  "memberId": "user456"
}
```

### POST /hackathon/team/:teamId/leave
Leave a hackathon team.

## Certificate Endpoints

### GET /certificate/:registrationId
Generate a certificate for a registration.

### POST /certificate/:registrationId/download
Download a certificate.

### GET /certificate/verify/:certId
Verify a certificate.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "status": 400,
    "message": "Error description"
  }
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
