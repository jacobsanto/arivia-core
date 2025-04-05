
import { useFormContext } from "react-hook-form";

// Helper hook to handle dynamic form arrays
export const useFormArray = () => {
  const { control } = useFormContext();

  // Returns an array of fields and methods to manipulate them
  const getFieldArray = (name: string) => {
    // Get the field array from the form context
    const fields = control._formValues[name] || [];
    
    // Function to append a new field
    const append = (value: any) => {
      const currentFields = [...fields];
      currentFields.push(value);
      control._formValues[name] = currentFields;
      control._updateFormState();
    };

    // Function to remove a field by index
    const remove = (index: number) => {
      const currentFields = [...fields];
      currentFields.splice(index, 1);
      control._formValues[name] = currentFields;
      control._updateFormState();
    };

    // Add id property to each field for React keys
    const fieldsWithIds = fields.map((field: any, index: number) => ({
      ...field,
      id: `${name}-${index}`,
    }));

    return {
      fields: fieldsWithIds,
      append,
      remove,
    };
  };

  return {
    getFieldArray,
  };
};
