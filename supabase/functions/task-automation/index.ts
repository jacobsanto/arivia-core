import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutomationRequest {
  ruleId: string;
  manual?: boolean;
  data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ruleId, manual, data }: AutomationRequest = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing automation rule: ${ruleId}, manual: ${manual}`);

    let result = {};

    switch (ruleId) {
      case 'auto-cleaning-assignment':
        result = await autoAssignCleaningTasks(supabase);
        break;
      
      case 'priority-escalation':
        result = await escalateOverdueTasks(supabase);
        break;
      
      case 'smart-clustering':
        result = await clusterTasksByLocation(supabase);
        break;
      
      case 'predictive-maintenance':
        result = await generatePredictiveMaintenance(supabase);
        break;
      
      case 'checkout-prep':
        result = await createCheckoutTasks(supabase, data);
        break;
      
      case 'staff-workload-balancing':
        result = await balanceStaffWorkload(supabase);
        break;
      
      case 'batch-optimization':
        result = await runBatchOptimization(supabase);
        break;
      
      default:
        throw new Error(`Unknown automation rule: ${ruleId}`);
    }

    console.log(`Automation rule ${ruleId} completed:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in task-automation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function autoAssignCleaningTasks(supabase: any) {
  // Get unassigned housekeeping tasks
  const { data: unassignedTasks } = await supabase
    .from('housekeeping_tasks')
    .select('*')
    .is('assigned_to', null)
    .eq('status', 'pending');

  if (!unassignedTasks?.length) {
    return { message: 'No unassigned tasks found', tasksAssigned: 0 };
  }

  // Get available housekeeping staff
  const { data: staff } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'housekeeping_staff');

  if (!staff?.length) {
    return { message: 'No housekeeping staff available', tasksAssigned: 0 };
  }

  let tasksAssigned = 0;

  // Simple round-robin assignment
  for (let i = 0; i < unassignedTasks.length; i++) {
    const task = unassignedTasks[i];
    const assignedStaff = staff[i % staff.length];

    const { error } = await supabase
      .from('housekeeping_tasks')
      .update({ assigned_to: assignedStaff.id })
      .eq('id', task.id);

    if (!error) {
      tasksAssigned++;
      console.log(`Assigned task ${task.id} to ${assignedStaff.name}`);
    }
  }

  return {
    message: `Successfully assigned ${tasksAssigned} tasks`,
    tasksAssigned,
    totalUnassigned: unassignedTasks.length
  };
}

async function escalateOverdueTasks(supabase: any) {
  const today = new Date();
  const twoHoursAgo = new Date(today.getTime() - 2 * 60 * 60 * 1000);

  // Find overdue tasks
  const { data: overdueTasks } = await supabase
    .from('housekeeping_tasks')
    .select('*, profiles:assigned_to(name, email)')
    .lt('due_date', twoHoursAgo.toISOString())
    .neq('status', 'completed');

  if (!overdueTasks?.length) {
    return { message: 'No overdue tasks found', tasksEscalated: 0 };
  }

  // In a real implementation, this would send notifications
  console.log(`Found ${overdueTasks.length} overdue tasks for escalation`);

  // Log escalation (in a real app, you'd send emails/notifications)
  for (const task of overdueTasks) {
    console.log(`Escalating task ${task.id}: ${task.task_type} at ${task.listing_id}`);
    
    // Update task with escalation flag
    await supabase
      .from('housekeeping_tasks')
      .update({ 
        status: 'escalated',
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);
  }

  return {
    message: `Escalated ${overdueTasks.length} overdue tasks`,
    tasksEscalated: overdueTasks.length,
    overdueTasks: overdueTasks.map(t => ({ id: t.id, type: t.task_type, listing: t.listing_id }))
  };
}

async function clusterTasksByLocation(supabase: any) {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get upcoming tasks
  const { data: tasks } = await supabase
    .from('housekeeping_tasks')
    .select('*')
    .gte('due_date', today.toISOString())
    .lte('due_date', nextWeek.toISOString())
    .eq('status', 'pending');

  if (!tasks?.length) {
    return { message: 'No upcoming tasks to cluster', tasksClustered: 0 };
  }

  // Group tasks by listing_id
  const tasksByLocation = tasks.reduce((acc: any, task: any) => {
    if (!acc[task.listing_id]) {
      acc[task.listing_id] = [];
    }
    acc[task.listing_id].push(task);
    return acc;
  }, {});

  let tasksClustered = 0;

  // Process locations with multiple tasks
  for (const [listingId, locationTasks] of Object.entries(tasksByLocation)) {
    const tasksArray = locationTasks as any[];
    
    if (tasksArray.length > 1) {
      // Assign all tasks at this location to the same staff member
      const firstAssignedStaff = tasksArray.find(t => t.assigned_to)?.assigned_to;
      
      if (firstAssignedStaff) {
        for (const task of tasksArray) {
          if (!task.assigned_to) {
            await supabase
              .from('housekeeping_tasks')
              .update({ assigned_to: firstAssignedStaff })
              .eq('id', task.id);
            
            tasksClustered++;
          }
        }
      }
      
      console.log(`Clustered ${tasksArray.length} tasks at location ${listingId}`);
    }
  }

  return {
    message: `Clustered tasks at ${Object.keys(tasksByLocation).length} locations`,
    tasksClustered,
    locationsProcessed: Object.keys(tasksByLocation).length
  };
}

async function generatePredictiveMaintenance(supabase: any) {
  // Get properties with high booking frequency
  const { data: bookings } = await supabase
    .from('guesty_bookings')
    .select('listing_id')
    .eq('status', 'confirmed')
    .gte('check_in', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (!bookings?.length) {
    return { message: 'No recent bookings found for analysis', tasksCreated: 0 };
  }

  // Count bookings per property
  const bookingCounts = bookings.reduce((acc: any, booking: any) => {
    acc[booking.listing_id] = (acc[booking.listing_id] || 0) + 1;
    return acc;
  }, {});

  let tasksCreated = 0;

  // Create maintenance tasks for high-usage properties
  for (const [listingId, count] of Object.entries(bookingCounts)) {
    if ((count as number) >= 10) { // High usage threshold
      // Check if maintenance task already exists
      const { data: existingTask } = await supabase
        .from('maintenance_tasks')
        .select('id')
        .eq('property_id', listingId)
        .eq('status', 'pending')
        .eq('title', 'Predictive Maintenance Check');

      if (!existingTask?.length) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days

        const { error } = await supabase
          .from('maintenance_tasks')
          .insert({
            property_id: listingId,
            title: 'Predictive Maintenance Check',
            description: `High usage detected (${count} bookings in 30 days). Preventive maintenance recommended.`,
            due_date: dueDate.toISOString(),
            priority: 'normal',
            status: 'pending'
          });

        if (!error) {
          tasksCreated++;
          console.log(`Created predictive maintenance task for property ${listingId}`);
        }
      }
    }
  }

  return {
    message: `Created ${tasksCreated} predictive maintenance tasks`,
    tasksCreated,
    propertiesAnalyzed: Object.keys(bookingCounts).length
  };
}

async function createCheckoutTasks(supabase: any, data?: any) {
  // This would typically be triggered by a checkout webhook
  const bookingId = data?.bookingId;
  
  if (!bookingId) {
    return { message: 'No booking ID provided for checkout tasks', tasksCreated: 0 };
  }

  // Get booking details
  const { data: booking } = await supabase
    .from('guesty_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    return { message: 'Booking not found', tasksCreated: 0 };
  }

  const checkoutDate = new Date(booking.check_out);
  const inspectionTime = new Date(checkoutDate.getTime() + 30 * 60 * 1000); // 30 minutes after checkout

  // Create post-checkout inspection task
  const { error: inspectionError } = await supabase
    .from('housekeeping_tasks')
    .insert({
      listing_id: booking.listing_id,
      booking_id: booking.id,
      task_type: 'Post-Checkout Inspection',
      description: 'Inspect property condition after guest checkout',
      due_date: inspectionTime.toISOString(),
      status: 'pending'
    });

  let tasksCreated = 0;
  if (!inspectionError) tasksCreated++;

  // Create cleaning task
  const cleaningTime = new Date(checkoutDate.getTime() + 60 * 60 * 1000); // 1 hour after checkout
  
  const { error: cleaningError } = await supabase
    .from('housekeeping_tasks')
    .insert({
      listing_id: booking.listing_id,
      booking_id: booking.id,
      task_type: 'Post-Checkout Cleaning',
      description: 'Deep clean property for next guest',
      due_date: cleaningTime.toISOString(),
      status: 'pending'
    });

  if (!cleaningError) tasksCreated++;

  return {
    message: `Created ${tasksCreated} checkout tasks for booking ${bookingId}`,
    tasksCreated,
    bookingId
  };
}

async function balanceStaffWorkload(supabase: any) {
  // Get current task assignments
  const { data: tasks } = await supabase
    .from('housekeeping_tasks')
    .select('assigned_to')
    .eq('status', 'pending')
    .not('assigned_to', 'is', null);

  if (!tasks?.length) {
    return { message: 'No assigned tasks to balance', tasksReassigned: 0 };
  }

  // Count tasks per staff member
  const workloadCounts = tasks.reduce((acc: any, task: any) => {
    acc[task.assigned_to] = (acc[task.assigned_to] || 0) + 1;
    return acc;
  }, {});

  const workloads = Object.entries(workloadCounts).map(([staffId, count]) => ({
    staffId,
    count: count as number
  }));

  if (workloads.length < 2) {
    return { message: 'Need at least 2 staff members for balancing', tasksReassigned: 0 };
  }

  // Sort by workload
  workloads.sort((a, b) => b.count - a.count);
  
  const maxWorkload = workloads[0].count;
  const minWorkload = workloads[workloads.length - 1].count;
  
  // Check if rebalancing is needed
  if (maxWorkload - minWorkload <= 2) {
    return { message: 'Workload is already balanced', tasksReassigned: 0 };
  }

  // Move tasks from overloaded to underloaded staff
  const overloadedStaff = workloads[0].staffId;
  const underloadedStaff = workloads[workloads.length - 1].staffId;
  const tasksToMove = Math.floor((maxWorkload - minWorkload) / 2);

  // Get tasks from overloaded staff
  const { data: tasksToReassign } = await supabase
    .from('housekeeping_tasks')
    .select('id')
    .eq('assigned_to', overloadedStaff)
    .eq('status', 'pending')
    .limit(tasksToMove);

  let tasksReassigned = 0;

  if (tasksToReassign?.length) {
    for (const task of tasksToReassign) {
      const { error } = await supabase
        .from('housekeeping_tasks')
        .update({ assigned_to: underloadedStaff })
        .eq('id', task.id);

      if (!error) {
        tasksReassigned++;
      }
    }
  }

  return {
    message: `Rebalanced workload: moved ${tasksReassigned} tasks`,
    tasksReassigned,
    fromStaff: overloadedStaff,
    toStaff: underloadedStaff
  };
}

async function runBatchOptimization(supabase: any) {
  console.log('Running batch optimization...');
  
  const results = await Promise.all([
    autoAssignCleaningTasks(supabase),
    clusterTasksByLocation(supabase),
    balanceStaffWorkload(supabase)
  ]);

  const totalTasksProcessed = results.reduce((sum, result) => {
    return sum + (result.tasksAssigned || result.tasksClustered || result.tasksReassigned || 0);
  }, 0);

  return {
    message: `Batch optimization completed: ${totalTasksProcessed} tasks processed`,
    totalTasksProcessed,
    results
  };
}
