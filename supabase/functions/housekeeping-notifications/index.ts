
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting housekeeping notifications check...');

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Get yesterday's date (for overdue tasks)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Find tasks due today
    const { data: todayTasks, error: todayError } = await supabase
      .from('housekeeping_tasks')
      .select('*')
      .eq('due_date', todayStr)
      .neq('status', 'done');

    if (todayError) throw todayError;

    // Find overdue tasks
    const { data: overdueTasks, error: overdueError } = await supabase
      .from('housekeeping_tasks')
      .select('*')
      .lt('due_date', todayStr)
      .neq('status', 'done');

    if (overdueError) throw overdueError;

    console.log(`Found ${todayTasks?.length || 0} tasks due today and ${overdueTasks?.length || 0} overdue tasks`);

    // Process notifications
    let notificationsSent = 0;

    // In a real implementation, we would send actual notifications via email or in-app notifications
    // For each task due today, send a notification
    for (const task of todayTasks || []) {
      // In a real implementation, send email or push notification
      console.log(`Notification for task due today: ${task.task_type} at ${task.listing_id}, due ${task.due_date}`);
      notificationsSent++;
    }

    // For each overdue task, send a notification
    for (const task of overdueTasks || []) {
      // In a real implementation, send email or push notification
      console.log(`Notification for OVERDUE task: ${task.task_type} at ${task.listing_id}, due ${task.due_date}`);
      notificationsSent++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Housekeeping notifications processed',
        todayTasksCount: todayTasks?.length || 0,
        overdueTasksCount: overdueTasks?.length || 0,
        notificationsSent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing housekeeping notifications:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
