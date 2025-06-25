
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { populateSampleData } from '@/utils/sampleDataPopulator';
import { toast } from 'sonner';

export const SampleDataButton: React.FC = () => {
  const [isPopulating, setIsPopulating] = useState(false);

  const handlePopulateSampleData = async () => {
    setIsPopulating(true);
    try {
      const result = await populateSampleData();
      if (result.success) {
        toast.success('Sample Data Added', {
          description: result.message
        });
      } else {
        toast.error('Failed to Add Sample Data', {
          description: result.message
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'An unexpected error occurred while adding sample data'
      });
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <Button 
      onClick={handlePopulateSampleData} 
      disabled={isPopulating}
      variant="outline"
      size="sm"
    >
      {isPopulating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Adding Sample Data...
        </>
      ) : (
        <>
          <Database className="h-4 w-4 mr-2" />
          Add Sample Data
        </>
      )}
    </Button>
  );
};
