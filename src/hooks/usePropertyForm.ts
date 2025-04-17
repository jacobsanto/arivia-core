
import { useState, useEffect } from 'react';
import { PropertyFormValues } from '@/components/properties/property-form/schema';
import { propertyService } from '@/services/property/property.service';
import { useAutosave } from './useAutosave';
import { toastService } from '@/services/toast';

export const usePropertyForm = (propertyId?: string, initialData?: Partial<PropertyFormValues>) => {
  const [formData, setFormData] = useState<Partial<PropertyFormValues>>(initialData || {});
  const [isLoading, setIsLoading] = useState(!!propertyId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load property data if editing existing property
  useEffect(() => {
    const loadPropertyData = async () => {
      if (!propertyId) return;
      
      setIsLoading(true);
      try {
        const properties = await propertyService.fetchProperties();
        const property = properties.find(p => p.id === propertyId);
        
        if (property) {
          setFormData({
            name: property.name,
            address: property.address,
            location: property.location,
            type: property.type,
            status: property.status,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            price: property.price_per_night,
            max_guests: property.max_guests,
            imageUrl: property.imageUrl,
            description: property.description
          });
        }
      } catch (error) {
        console.error('Error loading property:', error);
        toastService.error('Failed to load property data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPropertyData();
  }, [propertyId]);
  
  // Autosave function
  const savePropertyDraft = async (data: Partial<PropertyFormValues>) => {
    if (!propertyId) {
      // For new properties, save to local storage
      localStorage.setItem('property_draft', JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      return data;
    } else {
      // For existing properties, update in database
      await propertyService.updateProperty(propertyId, data);
      return data;
    }
  };
  
  // Set up autosave
  const { isSaving, lastSaved, hasUnsavedChanges } = useAutosave(formData, {
    entityType: 'property',
    saveFunction: savePropertyDraft,
    debounceDuration: 2000,
    notifyOnSave: false,
    detectChanges: true
  });
  
  // Update form data
  const updateFormData = (fieldName: keyof PropertyFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Submit form
  const handleSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (propertyId) {
        // Update existing property
        await propertyService.updateProperty(propertyId, data);
        toastService.success('Property updated successfully');
      } else {
        // Create new property
        await propertyService.addProperty(data);
        toastService.success('Property created successfully');
        // Clear draft
        localStorage.removeItem('property_draft');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving property:', error);
      toastService.error('Failed to save property');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check for existing draft on mount
  useEffect(() => {
    if (!propertyId && !initialData) {
      const savedDraft = localStorage.getItem('property_draft');
      
      if (savedDraft) {
        try {
          const { data, timestamp } = JSON.parse(savedDraft);
          const draftDate = new Date(timestamp);
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          
          // Only use drafts less than 24 hours old
          if (draftDate > oneDayAgo) {
            setFormData(data);
            toastService.info('Draft restored', {
              description: 'Continuing from your previous session'
            });
          } else {
            // Clear old drafts
            localStorage.removeItem('property_draft');
          }
        } catch (error) {
          console.error('Error parsing property draft:', error);
        }
      }
    }
  }, [propertyId, initialData]);
  
  return {
    formData,
    isLoading,
    isSubmitting,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    updateFormData,
    handleSubmit
  };
};
