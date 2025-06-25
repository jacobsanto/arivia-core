
import { supabase } from "@/integrations/supabase/client";

export const populateSampleData = async () => {
  try {
    console.log("Starting sample data population...");

    // 1. Add sample properties
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
      },
      {
        name: "Villa Sunset",
        address: "Paros, Greece",
        num_bedrooms: 2,
        num_bathrooms: 2,
        max_guests: 4,
        price_per_night: 320,
        status: "maintenance",
        description: "Cozy villa perfect for couples"
      }
    ];

    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .upsert(sampleProperties, { onConflict: 'name' })
      .select();

    if (propertiesError) throw propertiesError;
    console.log("Properties added:", properties?.length);

    // 2. Add sample bookings
    if (properties && properties.length > 0) {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const sampleBookings = [
        {
          property_id: properties[0].id,
          guest_name: "John Smith",
          guest_email: "john@example.com",
          guest_phone: "+30 123 456 789",
          check_in_date: today.toISOString().split('T')[0],
          check_out_date: nextWeek.toISOString().split('T')[0],
          num_guests: 4,
          total_price: 3150,
          status: "confirmed"
        },
        {
          property_id: properties[1].id,
          guest_name: "Maria Garcia",
          guest_email: "maria@example.com",
          guest_phone: "+34 987 654 321",
          check_in_date: nextWeek.toISOString().split('T')[0],
          check_out_date: nextMonth.toISOString().split('T')[0],
          num_guests: 6,
          total_price: 15640,
          status: "confirmed"
        }
      ];

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .upsert(sampleBookings)
        .select();

      if (bookingsError) throw bookingsError;
      console.log("Bookings added:", bookings?.length);
    }

    // 3. Add sample maintenance tasks
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
        },
        {
          property_id: properties[2].id,
          title: "Plumbing Repair",
          description: "Fix leaking faucet in kitchen",
          priority: "urgent",
          status: "in_progress",
          due_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Kitchen"
        }
      ];

      const { data: maintenanceTasks, error: maintenanceError } = await supabase
        .from('maintenance_tasks')
        .upsert(sampleMaintenanceTasks)
        .select();

      if (maintenanceError) throw maintenanceError;
      console.log("Maintenance tasks added:", maintenanceTasks?.length);
    }

    // 4. Add sample financial reports
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
    const sampleFinancialReports = [
      {
        month: currentMonth,
        property: "Villa Caldera",
        revenue: 4500,
        expenses: 890,
        profit: 3610,
        margin: "80.2%",
        category: "revenue"
      },
      {
        month: currentMonth,
        property: "Villa Azure",
        revenue: 6800,
        expenses: 1240,
        profit: 5560,
        margin: "81.8%",
        category: "revenue"
      },
      {
        month: currentMonth,
        property: "Villa Sunset",
        revenue: 2400,
        expenses: 650,
        profit: 1750,
        margin: "72.9%",
        category: "revenue"
      }
    ];

    const { data: financialReports, error: financialError } = await supabase
      .from('financial_reports')
      .upsert(sampleFinancialReports)
      .select();

    if (financialError) throw financialError;
    console.log("Financial reports added:", financialReports?.length);

    // 5. Add sample occupancy reports
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
      message: "Sample data has been populated successfully!"
    };

  } catch (error) {
    console.error("Error populating sample data:", error);
    return {
      success: false,
      message: `Failed to populate sample data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
