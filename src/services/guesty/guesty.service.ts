
// Entry point for all Guesty service exports, maintaining backward compatibility.

import { guestyListingsService } from './guestyListings.service';
import { guestyBookingsService } from './guestyBookings.service';
import { guestySyncService } from './guestySync.service';
import { guestyBookingSyncService } from './guestyBookingSyncService';

import type {
  GuestyListingDB,
  GuestyBookingDB,
  GuestySyncResponse
} from './guesty.types';

export const guestyService = {
  ...guestyListingsService,
  ...guestyBookingsService,
  ...guestySyncService,
  ...guestyBookingSyncService,
};

export type {
  GuestyListingDB,
  GuestyBookingDB,
  GuestySyncResponse
};
