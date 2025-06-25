import { supabase } from "@/integrations/supabase/client";

export const populateSampleData = async () => {
  try {
    console.log("Starting sample data population...");

    // Define date variables that will be used throughout the function
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Add sample Guesty listings (primary property source)
    const sampleListings = [
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

    const { data: listings, error: listingsError } = await supabase
      .from('guesty_listings')
      .upsert(sampleListings, { onConflict: 'id' })
      .select();

    if (listingsError) throw listingsError;
    console.log("Guesty listings added:", listings?.length);

    // 2. Add sample bookings with consistent listing_id references
    if (listings && listings.length > 0) {
      const sampleBookings = [
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

      const { data: bookings, error: bookingsError } = await supabase
        .from('guesty_bookings')
        .upsert(sampleBookings, { onConflict: 'id' })
        .select();

      if (bookingsError) throw bookingsError;
      console.log("Bookings added:", bookings?.length);
    }

    // 3. Add sample housekeeping tasks with consistent listing_id references
    if (listings && listings.length > 0) {
      const sampleHousekeepingTasks = [
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
          task_type: "Maintenance Cleaning",
          due_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "done",
          assigned_to: "cleaning@arivia.com"
        }
      ];

      const { data: housekeepingTasks, error: housekeepingError } = await supabase
        .from('housekeeping_tasks')
        .upsert(sampleHousekeepingTasks)
        .select();

      if (housekeepingError) throw housekeepingError;
      console.log("Housekeeping tasks added:", housekeepingTasks?.length);
    }

    // 4. Add sample properties (for backwards compatibility)
    const sampleProperties = [
      {
        name: "Villa Caldera",
        address: "Oia, Santorini, Greece",
        num_bedrooms: 3,
        num_bathrooms: 2,
        max_guests: 6,
        price_per_night: 450,
        status: "active",
        description: "Luxury villa with stunning caldera views"
      },
      {
        name: "Villa Azure",
        address: "Mykonos, Greece",
        num_bedrooms: 4,
        num_bathrooms: 3,
        max_guests: 8,
        price_per_night: 680,
        status: "active",
        description: "Modern villa with private pool and sea view"
      }
    ];

    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .upsert(sampleProperties, { onConflict: 'name' })
      .select();

    if (propertiesError) throw propertiesError;
    console.log("Local properties added:", properties?.length);

    // 5. Add sample maintenance tasks with consistent property_id references
    if (properties && properties.length > 0) {
      const sampleMaintenanceTasks = [
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

      const { data: maintenanceTasks, error: maintenanceError } = await supabase
        .from('maintenance_tasks')
        .upsert(sampleMaintenanceTasks)
        .select();

      if (maintenanceError) throw maintenanceError;
      console.log("Maintenance tasks added:", maintenanceTasks?.length);
    }

    // 6. Add sample financial reports with consistent property references
    const currentMonth = new Date().toISOString().substring(0, 7);
    const sampleFinancialReports = [
      {
        month: currentMonth,
        property: "Villa Caldera",
        listing_id: "villa-caldera-oia-001",
        revenue: 4500,
        expenses: 890,
        profit: 3610,
        margin: "80.2%",
        category: "revenue"
      },
      {
        month: currentMonth,
        property: "Villa Azure",
        listing_id: "villa-azure-mykonos-002",
        revenue: 6800,
        expenses: 1240,
        profit: 5560,
        margin: "81.8%",
        category: "revenue"
      }
    ];

    const { data: financialReports, error: financialError } = await supabase
      .from('financial_reports')
      .upsert(sampleFinancialReports)
      .select();

    if (financialError) throw financialError;
    console.log("Financial reports added:", financialReports?.length);

    // 7. Add sample occupancy reports
    const sampleOccupancyReports = [
      {
        month: currentMonth,
        property: "Villa Caldera",
        bookings: 12,
        occupancy_rate: 75,
        revenue: 4500,
        average_stay: 4.2
      },
      {
        month: currentMonth,
        property: "Villa Azure",
        bookings: 8,
        occupancy_rate: 68,
        revenue: 6800,
        average_stay: 6.1
      },
      {
        month: currentMonth,
        property: "Villa Sunset",
        bookings: 15,
        occupancy_rate: 82,
        revenue: 2400,
        average_stay: 3.8
      }
    ];

    const { data: occupancyReports, error: occupancyError } = await supabase
      .from('occupancy_reports')
      .upsert(sampleOccupancyReports)
      .select();

    if (occupancyError) throw occupancyError;
    console.log("Occupancy reports added:", occupancyReports?.length);

    console.log("Sample data population completed successfully!");
    return {
      success: true,
      message: "Sample data has been populated successfully with consistent property references!"
    };

  } catch (error) {
    console.error("Error populating sample data:", error);
    return {
      success: false,
      message: `Failed to populate sample data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
