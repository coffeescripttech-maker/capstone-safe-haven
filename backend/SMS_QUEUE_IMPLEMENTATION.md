# SMS Queue Implementation

## Overview

The SMS Queue service provides reliable message queuing for bulk SMS delivery using BullMQ and Redis. It implements priority-based queuing, job scheduling, retry logic, and comprehensive status tracking.

## Features

### ✅ Implemented

1. **Priority-Based Queuing**
   - Three separate queues: critical, high, and normal priority
   - Critical messages processed first
   - Configurable priority values

2. **Queue Operations**
   - `enqueue()` - Add single SMS job to queue
   - `enqueueBulk()` - Add multiple SMS jobs efficiently
   - `schedule()` - Schedule SMS for future delivery
   - `getJobStatus()` - Track job progress and status
   - `cancelJob()` - Cancel scheduled or waiting jobs

3. **Job Retention**
   - Completed jobs: 7 days (configurable)
   - Failed jobs: 30 days (configurable)
   - Automatic cleanup of old jobs

4. **Retry Logic**
   - Automatic retry on failure (up to 3 attempts)
   - Exponential backoff (30s, 2m, 5m)
   - Configurable retry delays

5. **Monitoring & Statistics**
   - Queue depth tracking (waiting, active, completed, failed, delayed)
   - Per-queue statistics
   - Aggregate statistics across all queues

6. **Queue Management**
   - Pause/resume queues
   - Clean old jobs
   - Graceful shutdown

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SMS Queue Service                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Critical   │  │     High     │  │    Normal    │     │
│  │    Queue     │  │    Queue     │  │    Queue     │     │
│  │  Priority: 1 │  │  Priority: 5 │  │ Priority: 10 │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│                    ┌──────────────┐                         │
│                    │ 