
export const createSampleMaintenanceTasks = (properties: any[], today: Date) => {
  if (!properties || properties.length === 0) return [];

  return [
    {
      property_id: properties[0].id,
      title: "Air Conditioning Service",
      description: "Annual AC maintenance and filter replacement",
      priority: "high",
      status: "pending",
      due_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Master Bedroom"
    },
    {
      property_id: properties[1].id,
      title: "Pool Cleaning",
      description: "Weekly pool maintenance and chemical balancing",
      priority: "normal",
      status: "completed",
      due_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Pool Area"
    }
  ];
};
