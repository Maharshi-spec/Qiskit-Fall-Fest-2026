# Deployment Guide

This document describes deployment considerations for the frontend and backend.

## Event reminders

Apply `database/migrations/20260901_event_reminders.sql` to the same PostgreSQL database that stores `registrations`.

A confirmed registration creates four `PENDING` reminder rows for the event days:

- September 7, 2026
- September 8, 2026
- September 9, 2026
- September 10, 2026

Configure these backend environment variables. The application does not choose a default reminder time:

```text
EVENT_TIMEZONE=Asia/Kolkata
EVENT_REMINDER_TIME=09:00
REMINDER_PROCESSOR_TOKEN=<long-random-secret>
```

`EVENT_TIMEZONE` controls the reminder timezone. `EVENT_REMINDER_TIME` uses 24-hour `HH:mm` format and controls the reminder clock time. `REMINDER_PROCESSOR_TOKEN` protects the internal reminder processor endpoint. Keep the processor token private.

There is no in-process scheduler. Configure an external cron, scheduler, or platform job to call the processor endpoint at least every minute:

```text
POST /api/v1/internal/reminders/process
Authorization: Bearer <REMINDER_PROCESSOR_TOKEN>
```

The processor selects only due `PENDING` rows, claims them with PostgreSQL row locking, and marks them `SENT` only after SMTP delivery succeeds. Failed deliveries remain `PENDING` with `last_error` for a later retry. Reminder state is stored in PostgreSQL and survives backend restarts.

Existing confirmed registrations can be populated using:

```text
backend/scripts/backfill-event-reminders.js
```
