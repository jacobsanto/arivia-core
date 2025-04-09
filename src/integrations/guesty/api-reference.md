
# Guesty API Integration Reference

This document provides a reference for working with the Guesty API in our application.

## API Base URL
- API Base URL: `https://open-api.guesty.com/v1`

## Authentication
Authentication is handled by the platform-specific adapter (Supabase or Netlify) which obtains an OAuth token using the Guesty credentials.

## Available API Endpoints

### Listings (Properties)
- **GET /listings** - Get all listings with pagination
- **GET /listings/{id}** - Get a specific listing by ID
- **PUT /listings/{id}** - Update a listing

### Reservations (Bookings)
- **GET /reservations** - Get all reservations with pagination
- **GET /reservations/{id}** - Get a specific reservation by ID
- **POST /reservations** - Create a new reservation
- **PUT /reservations/{id}** - Update a reservation

### Tasks
- **GET /tasks** - Get all tasks with pagination
- **GET /tasks/{id}** - Get a specific task by ID
- **POST /tasks** - Create a new task
- **PUT /tasks/{id}** - Update a task

## Query Parameters

### Common Parameters
- **limit** - Number of results per page (default: 20)
- **skip** - Number of results to skip (default: 0)
- **sort** - Sorting criteria (e.g. `createdAt:-1` for descending by creation date)

### Listing Specific Parameters
- **active** - Filter by active status (boolean)

### Reservation Specific Parameters
- **listingId** - Filter by listing ID
- **status** - Filter by status (inquiry, pending, declined, canceled, confirmed, checked-in, checked-out)
- **checkInFrom** - Filter by check-in date from (ISO date string)
- **checkInTo** - Filter by check-in date to (ISO date string)
- **checkOutFrom** - Filter by check-out date from (ISO date string)
- **checkOutTo** - Filter by check-out date to (ISO date string)

### Task Specific Parameters
- **listingId** - Filter by listing ID
- **assigneeId** - Filter by assignee ID
- **status** - Filter by status (pending, inProgress, completed, canceled)
- **priority** - Filter by priority (low, medium, high)

## Examples

### Fetching Properties
```typescript
// Get active properties
const activeProperties = await guestyClient.get('/listings', { 
  active: 'true',
  limit: '10',
  skip: '0' 
});

// Get a single property
const property = await guestyClient.get(`/listings/${propertyId}`);
```

### Working with Bookings
```typescript
// Get upcoming bookings
const today = new Date().toISOString();
const upcomingBookings = await guestyClient.get('/reservations', {
  checkInFrom: today,
  status: 'confirmed',
  limit: '20'
});

// Update a booking status
await guestyClient.put(`/reservations/${bookingId}`, {
  status: 'checked-in'
});
```

### Managing Tasks
```typescript
// Create a new task
const newTask = await guestyClient.post('/tasks', {
  title: 'Clean villa before check-in',
  description: 'Full cleaning required before next guest arrival',
  listingId: 'property123',
  priority: 'high',
  due: new Date(2023, 6, 15).toISOString()
});

// Get tasks for a specific property
const propertyTasks = await guestyClient.get('/tasks', {
  listingId: 'property123',
  status: 'pending'
});
```

## Rate Limiting
The Guesty API has rate limits. The adapter implementation includes caching of auth tokens to minimize authentication requests.

## Error Handling
Error responses include HTTP status codes and descriptive messages. Our client implementation throws errors with detailed error messages for easier debugging.
