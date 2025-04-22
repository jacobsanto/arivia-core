
import { Guest } from "./GuestCard";

/**
 * Utility hook to group guests into current, upcoming, and past (last 30 days) categories.
 * @param guests Array of Guest objects
 */
export function useGuestGroups(guests: Guest[]) {
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0,0,0,0);

  const currentGuests = guests.filter(guest =>
    new Date(guest.check_in) <= today && new Date(guest.check_out) >= today
  );
  const upcomingGuests = guests
    .filter(guest => new Date(guest.check_in) > today)
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
  const pastGuests = guests
    .filter(guest =>
      new Date(guest.check_out) < today &&
      new Date(guest.check_out) > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    )
    .sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime());

  return { currentGuests, upcomingGuests, pastGuests };
}
