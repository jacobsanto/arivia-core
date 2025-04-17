
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from '@/components/reports/DateRangeSelector';
import { useAutosave } from './useAutosave';
import { startOfDay, endOfDay, addDays } from 'date-fns';

interface DashboardPreferences {
  selectedProperty: string;
  dateRange: {
    from: string | null;
    to: string | null;
  };
  defaultView?: string;
  favoriteMetrics?: string[];
}

export const useDashboardPreferences = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<DashboardPreferences>({
    selectedProperty: "all",
    dateRange: {
      from: startOfDay(new Date()).toISOString(),
      to: endOfDay(addDays(new Date(), 7)).toISOString()
    }
  });
  
  // Get user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        loadPreferences(data.user.id);
      }
    };
    
    getUserId();
  }, []);
  
  // Load saved preferences
  const loadPreferences = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', uid)
        .eq('setting_key', 'dashboard_preferences')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Cast the JSON data to the correct type
        const savedPrefs = data.setting_value as unknown as DashboardPreferences;
        setPreferences(savedPrefs);
      }
    } catch (error) {
      console.error('Error loading dashboard preferences:', error);
    }
  };
  
  // Save preferences function
  const savePreferences = async (prefs: DashboardPreferences) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          setting_key: 'dashboard_preferences',
          setting_value: prefs as any // Cast to any to satisfy Supabase JSON type
        }, {
          onConflict: 'user_id,setting_key'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error saving dashboard preferences:', error);
      throw error;
    }
  };
  
  // Set up autosave
  const { isSaving, lastSaved } = useAutosave(preferences, {
    entityType: 'dashboard_preferences',
    saveFunction: savePreferences,
    debounceDuration: 1500,
    detectChanges: true
  });
  
  // Update property selection
  const updateSelectedProperty = (property: string) => {
    setPreferences(prev => ({
      ...prev,
      selectedProperty: property
    }));
  };
  
  // Update date range
  const updateDateRange = (range: DateRange) => {
    setPreferences(prev => ({
      ...prev,
      dateRange: {
        from: range.from ? range.from.toISOString() : null,
        to: range.to ? range.to.toISOString() : null
      }
    }));
  };
  
  // Update default view
  const updateDefaultView = (view: string) => {
    setPreferences(prev => ({
      ...prev,
      defaultView: view
    }));
  };
  
  // Add/remove favorite metric
  const toggleFavoriteMetric = (metricId: string) => {
    setPreferences(prev => {
      const favorites = prev.favoriteMetrics || [];
      const isCurrentlyFavorite = favorites.includes(metricId);
      
      return {
        ...prev,
        favoriteMetrics: isCurrentlyFavorite 
          ? favorites.filter(id => id !== metricId)
          : [...favorites, metricId]
      };
    });
  };
  
  return {
    preferences,
    isSaving,
    lastSaved,
    updateSelectedProperty,
    updateDateRange,
    updateDefaultView,
    toggleFavoriteMetric
  };
};
