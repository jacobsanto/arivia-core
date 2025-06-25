import { supabase } from "@/integrations/supabase/client";
import {
  createSampleGuestyListings,
  createSampleGuestyBookings,
  createSampleHousekeepingTasks,
  createSampleLocalProperties,
  createSampleMaintenanceTasks,
  createSampleFinancialReports,
  createSampleOccupancyReports
} from "./sampleData";

export const populateSampleData = async () => {
  try {
    console.log("Starting sample data population...");

    // Define date variables that will be used throughout the function
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Add sample Guesty listings (primary property source)
    const sampleListings = createSampleGuestyListings();

    const { data: listings, error: listingsError } = await supabase
      .from('guesty_listings')
      .upsert(sampleListings, { onConflict: 'id' })
      .select();

    if (listingsError) throw listingsError;
    console.log("Guesty listings added:", listings?.length);

    // 2. Add sample bookings with consistent listing_id references
    if (listings && listings.length > 0) {
      const sampleBookings = createSampleGuestyBookings(listings, today, nextWeek, nextMonth);

      const { data: bookings, error: bookingsError } = await supabase
        .from('guesty_bookings')
        .upsert(sampleBookings, { onConflict: 'id' })
        .select();

      if (bookingsError) throw bookingsError;
      console.log("Bookings added:", bookings?.length);
    }

    // 3. Add sample housekeeping tasks with consistent listing_id references and required booking_id
    if (listings && listings.length > 0) {
      const sampleHousekeepingTasks = createSampleHousekeepingTasks(listings, today);

      const { data: housekeepingTasks, error: housekeepingError } = await supabase
        .from('housekeeping_tasks')
        .upsert(sampleHousekeepingTasks)
        .select();

      if (housekeepingError) throw housekeepingError;
      console.log("Housekeeping tasks added:", housekeepingTasks?.length);
    }

    // 4. Add sample properties (for backwards compatibility)
    const sampleProperties = createSampleLocalProperties();

    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .upsert(sampleProperties, { onConflict: 'name' })
      .select();

    if (propertiesError) throw propertiesError;
    console.log("Local properties added:", properties?.length);

    // 5. Add sample maintenance tasks with consistent property_id references
    if (properties && properties.length > 0) {
      const sampleMaintenanceTasks = createSampleMaintenanceTasks(properties, today);

      const { data: maintenanceTasks, error: maintenanceError } = await supabase
        .from('maintenance_tasks')
        .upsert(sampleMaintenanceTasks)
        .select();

      if (maintenanceError) throw maintenanceError;
      console.log("Maintenance tasks added:", maintenanceTasks?.length);
    }

    // 6. Add sample financial reports with consistent property references
    const sampleFinancialReports = createSampleFinancialReports();

    const { data: financialReports, error: financialError } = await supabase
      .from('financial_reports')
      .upsert(sampleFinancialReports)
      .select();

    if (financialError) throw financialError;
    console.log("Financial reports added:", financialReports?.length);

    // 7. Add sample occupancy reports
    const sampleOccupancyReports = createSampleOccupancyReports();

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
