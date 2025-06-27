
import { supabase } from '@/lib/supabase/client';

export class ApiClient {
  static async get(table: string, filters?: Record<string, any>) {
    let query = supabase.from(table).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    return query;
  }

  static async post(table: string, data: Record<string, any>) {
    return supabase.from(table).insert(data);
  }

  static async put(table: string, id: string, data: Record<string, any>) {
    return supabase.from(table).update(data).eq('id', id);
  }

  static async delete(table: string, id: string) {
    return supabase.from(table).delete().eq('id', id);
  }
}
