# Database Directory

This directory contains database-related files for the Qiskit Fall Fest 2026 project.

## Subdirectories

### migrations/
Database migration scripts. These files are used to update the database schema when changes are needed.

**Naming Convention:** `YYYYMMDD_HHmmss_description.js`

Example migration files:
- `20260831_100000_create_registrations_table.js`
- `20260831_110000_create_workshops_table.js`

### seeds/
Database seed scripts for populating initial data.

Example seed files:
- `workshops.seed.js` - Initial workshop data
- `organizers.seed.js` - Organizer information
- `speakers.seed.js` - Speaker data

### schema/
Database schema definitions and documentation.

**Files:**
- `registrations.schema.js` - Registration collection schema
- `workshops.schema.js` - Workshop collection schema
- `hackathon_teams.schema.js` - Hackathon team schema
- `certificates.schema.js` - Certificate schema

## Usage

### Running Migrations
```bash
npm run migrate
```

### Seeding the Database
```bash
npm run seed
```

### Viewing Schema
Refer to individual schema files or see [Database Documentation](../docs/database.md)

## MongoDB Connection

Default connection string (configure in `.env`):
```
mongodb://localhost:27017/qiskit-fall-fest
```

## Database Operations

### Backup
```bash
mongodump --uri "mongodb://localhost:27017/qiskit-fall-fest" --out ./backup
```

### Restore
```bash
mongorestore --uri "mongodb://localhost:27017/qiskit-fall-fest" ./backup
```

## Collections

- **registrations** - Event registration records
- **workshops** - Workshop information
- **workshop_attendees** - Workshop attendance records
- **hackathon_teams** - Hackathon team information
- **certificates** - Generated certificates

For more details, see [Database Documentation](../docs/database.md)
