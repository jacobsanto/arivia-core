
export async function createSyncLog(supabase: any, logData: any) {
  try {
    const { data, error } = await supabase
      .from('sync_logs')
      .insert(logData)
      .select()
      .single();
      
    if (error) {
      console.error('Failed to create sync log:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception creating sync log:', err);
    return null;
  }
}

export async function updateSyncLog(supabase: any, id: string, updates: any) {
  try {
    const { error } = await supabase
      .from('sync_logs')
      .update(updates)
      .eq('id', id);
      
    if (error) {
      console.error('Failed to update sync log:', error);
    }
  } catch (err) {
    console.error('Exception updating sync log:', err);
  }
}
