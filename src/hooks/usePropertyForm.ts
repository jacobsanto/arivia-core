import { useState, useCallback } from 'react';
import { throttle } from 'lodash';
import { useToast } from "@/components/ui/use-toast";

export type PropertyFormData = {
  id?: string;
  name: string;
  address: string;
  type: string;
  status: string;
  description: string;
  location: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  imageUrl: string;
};

export const usePropertyForm = (initialProperty?: PropertyFormData) => {
  const [name, setName] = useState(initialProperty?.name || '');
  const [address, setAddress] = useState(initialProperty?.address || '');
  const [type, setType] = useState(initialProperty?.type || '');
  const [status, setStatus] = useState(initialProperty?.status || '');
  const [description, setDescription] = useState(initialProperty?.description || '');
  const [location, setLocation] = useState(initialProperty?.location || '');
  const [maxGuests, setMaxGuests] = useState(initialProperty?.max_guests || 0);
  const [bedrooms, setBedrooms] = useState(initialProperty?.bedrooms || 0);
  const [bathrooms, setBathrooms] = useState(initialProperty?.bathrooms || 0);
  const [price, setPrice] = useState(initialProperty?.price || 0);
  const [imageUrl, setImageUrl] = useState(initialProperty?.imageUrl || '');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const saveDraft = useCallback(
    throttle((formData: PropertyFormData) => {
      const storageKey = `property_draft_${formData.id || 'new'}`;
      localStorage.setItem(storageKey, JSON.stringify(formData));
      setLastSaved(new Date());
      console.log('Property draft saved:', formData);
    }, 2000),
    []
  );

  const handleDraftSave = useCallback(
    (data: Partial<PropertyFormData>) => {
      const draftData = {
        name: data.name || initialProperty?.name || '',
        address: data.address || initialProperty?.address || '',
        type: data.type || initialProperty?.type || '',
        status: data.status || initialProperty?.status || '',
        description: data.description || initialProperty?.description || '',
        location: data.location || initialProperty?.location || '',
        max_guests: data.max_guests || initialProperty?.max_guests || 0,
        bedrooms: data.bedrooms || initialProperty?.bedrooms || 0,
        bathrooms: data.bathrooms || initialProperty?.bathrooms || 0,
        price: data.price || initialProperty?.price || 0,
        imageUrl: data.imageUrl || initialProperty?.imageUrl || '',
        id: data.id || initialProperty?.id
      };
      
      saveDraft(draftData as PropertyFormData);
    },
    [initialProperty, saveDraft]
  );

  const handleChange = (field: string, value: any) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'type':
        setType(value);
        break;
      case 'status':
        setStatus(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'max_guests':
        setMaxGuests(Number(value));
        break;
      case 'bedrooms':
        setBedrooms(Number(value));
        break;
      case 'bathrooms':
        setBathrooms(Number(value));
        break;
      case 'price':
        setPrice(Number(value));
        break;
      case 'imageUrl':
        setImageUrl(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (data: PropertyFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Property saved",
        description: "Your property has been saved successfully.",
        variant: "default",
      });
      console.log('Property saved:', data);
    } catch (error) {
      toast({
        title: "Error saving property",
        description: "Failed to save property. Please try again.",
        variant: "destructive",
      });
      console.error('Error saving property:', error);
    }
  };

  return {
    name,
    address,
    type,
    status,
    description,
    location,
    maxGuests,
    bedrooms,
    bathrooms,
    price,
    imageUrl,
    lastSaved,
    setName,
    setAddress,
    setType,
    setStatus,
    setDescription,
    setLocation,
    setMaxGuests,
    setBedrooms,
    setBathrooms,
    setPrice,
    setImageUrl,
    handleChange,
    handleSubmit,
    handleDraftSave
  };
};
