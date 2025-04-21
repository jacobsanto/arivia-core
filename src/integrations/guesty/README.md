
# Guesty API Integration for Arivia Villas

This integration connects the Arivia Villas All-in-One Operations App with the Guesty property management system API.

## Overview

The integration uses a serverless function approach to securely handle API credentials without exposing them in the frontend code. API calls are proxied through a Netlify serverless function that manages authentication with the Guesty API.

## Key Components

1. **API Service (`api.ts`)**: Provides methods for interacting with Guesty API endpoints
2. **Type Definitions (`types.ts`)**: TypeScript interfaces for Guesty API responses
3. **Data Adapters (`adapters.ts`)**: Functions to transform Guesty data to our internal data models
4. **Serverless Function (`netlify/functions/guesty-api.js`)**: Securely handles API authentication and proxies requests
5. **React Hooks**: Custom hooks for properties, bookings, and tasks

## Environment Configuration

For this integration to work in production, the following environment variables must be configured in Netlify:

- `GUESTY_CLIENT_ID`: Your Guesty API Client ID
- `GUESTY_CLIENT_SECRET`: Your Guesty API Client Secret

## Usage

### Properties

```typescript
import { useGuestyProperties, useGuestyProperty } from '@/hooks/guesty/useGuestyProperties';

// Get a list of properties
const { properties, isLoading, error } = useGuestyProperties();

// Get a single property
const { data: property } = useGuestyProperty(propertyId);
```

### Bookings

```typescript
import { useGuestyBookings, useGuestyBooking } from '@/hooks/guesty/useGuestyBookings';

// Get bookings with filters
const { bookings } = useGuestyBookings({
  propertyIds: ['property1', 'property2'],
  statuses: ['confirmed', 'pending'],
  startDate: new Date(),
  endDate: new Date()
});

// Get a single booking
const { data: booking } = useGuestyBooking(bookingId);
```

### Tasks

```typescript
import { 
  useGuestyTasks, 
  useGuestyTask, 
  useCreateGuestyTask, 
  useUpdateGuestyTask 
} from '@/hooks/guesty/useGuestyTasks';

// Get tasks with filters
const { tasks } = useGuestyTasks({ 
  type: 'housekeeping',
  propertyIds: ['property1']
});

// Get a single task
const { data: task } = useGuestyTask(taskId, 'maintenance');

// Create a new task
const createTask = useCreateGuestyTask('housekeeping');
createTask.mutate({
  title: 'Clean Villa',
  status: 'pending',
  priority: 'normal',
  dueDate: new Date()
});

// Update a task
const updateTask = useUpdateGuestyTask('maintenance');
updateTask.mutate({
  taskId: 'task123',
  updates: { status: 'completed' }
});
```

## Security Considerations

- API credentials are never exposed to the frontend
- Authentication tokens are managed by the serverless function
- Token caching is implemented to reduce API calls
