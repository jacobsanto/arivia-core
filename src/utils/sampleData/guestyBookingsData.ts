
export const createSampleGuestyBookings = (listings: any[], today: Date, nextWeek: Date, nextMonth: Date) => {
  if (!listings || listings.length === 0) return [];

  return [
    {
      id: "booking-001-caldera",
      listing_id: listings[0].id,
      guest_name: "John Smith",
      check_in: today.toISOString().split('T')[0],
      check_out: nextWeek.toISOString().split('T')[0],
      status: "confirmed",
      raw_data: {
        guest: {
          fullName: "John Smith",
          email: "john@example.com",
          phone: "+30 123 456 789"
        },
        guestsCount: 4,
        money: {
          totalPrice: 3150,
          netAmount: 3150,
          currency: "EUR"
        }
      }
    },
    {
      id: "booking-002-azure",
      listing_id: listings[1].id,
      guest_name: "Maria Garcia",
      check_in: nextWeek.toISOString().split('T')[0],
      check_out: nextMonth.toISOString().split('T')[0],
      status: "confirmed",
      raw_data: {
        guest: {
          fullName: "Maria Garcia",
          email: "maria@example.com",
          phone: "+34 987 654 321"
        },
        guestsCount: 6,
        money: {
          totalPrice: 15640,
          netAmount: 15640,
          currency: "EUR"
        }
      }
    }
  ];
};
