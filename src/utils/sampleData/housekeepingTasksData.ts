
export const createSampleHousekeepingTasks = (listings: any[], today: Date) => {
  if (!listings || listings.length === 0) return [];

  return [
    {
      listing_id: listings[0].id,
      booking_id: "booking-001-caldera",
      task_type: "Standard Cleaning",
      due_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "pending",
      assigned_to: "housekeeping@arivia.com"
    },
    {
      listing_id: listings[1].id,
      booking_id: "booking-002-azure",
      task_type: "Deep Cleaning",
      due_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "in-progress",
      assigned_to: "maria@arivia.com"
    },
    {
      listing_id: listings[2].id,
      booking_id: "maintenance-booking-003",
      task_type: "Maintenance Cleaning",
      due_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "done",
      assigned_to: "cleaning@arivia.com"
    }
  ];
};
