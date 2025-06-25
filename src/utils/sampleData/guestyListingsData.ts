
export const createSampleGuestyListings = () => {
  return [
    {
      id: "villa-caldera-oia-001",
      title: "Villa Caldera",
      address: { full: "Oia, Santorini, Greece", city: "Oia", country: "Greece" },
      status: "active",
      property_type: "villa",
      sync_status: "active",
      is_deleted: false,
      raw_data: {
        bedrooms: 3,
        bathrooms: 2,
        accommodates: 6,
        basePrice: 450,
        description: "Luxury villa with stunning caldera views"
      }
    },
    {
      id: "villa-azure-mykonos-002",
      title: "Villa Azure",
      address: { full: "Mykonos, Greece", city: "Mykonos", country: "Greece" },
      status: "active",
      property_type: "villa",
      sync_status: "active",
      is_deleted: false,
      raw_data: {
        bedrooms: 4,
        bathrooms: 3,
        accommodates: 8,
        basePrice: 680,
        description: "Modern villa with private pool and sea view"
      }
    },
    {
      id: "villa-sunset-paros-003",
      title: "Villa Sunset",
      address: { full: "Paros, Greece", city: "Paros", country: "Greece" },
      status: "maintenance",
      property_type: "villa",
      sync_status: "active",
      is_deleted: false,
      raw_data: {
        bedrooms: 2,
        bathrooms: 2,
        accommodates: 4,
        basePrice: 320,
        description: "Cozy villa perfect for couples"
      }
    }
  ];
};
