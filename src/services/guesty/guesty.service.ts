
// Entry point for all Guesty service exports, maintaining backward compatibility.

import { guestyListingsService } from './guestyListings.service';
import { guestyBookingsService } from './guestyBookings.service';
import { guestySyncService } from './guestySync.service';

import type {
  GuestyListingDB,
  GuestyBookingDB,
  GuestySyncResponse
} from './guesty.types';

export const guestyService = {
  ...guestyListingsService,
  ...guestyBookingsService,
  ...guestySyncService,
};

export type {
  GuestyListingDB,
  GuestyBookingDB,
  GuestySyncResponse
};
