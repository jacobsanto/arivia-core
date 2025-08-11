
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import ItemFormDetails from "./forms/ItemFormDetails";
import StockFormNotes from "./forms/StockFormNotes";
import StockFormSubmitButton from "./forms/StockFormSubmitButton";
import { useInventory } from "@/contexts/InventoryContext";
import ItemFormVendors from "./forms/ItemFormVendors";
import { inventoryService } from "@/services/inventory.service";

const formSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  itemCode: z.string().optional(),
  category: z.string().min(1, { message: "Please select a category." }),
  unit: z.string().min(1, { message: "Please select a unit." }),
  minLevel: z.coerce.number().min(0, { message: "Minimum level must be 0 or higher." }),
  initialStock: z.coerce.number().min(0, { message: "Initial stock must be 0 or higher." }),
  vendorIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddItem = () => {
  // Use the shared inventory context
  const { categories, categoryObjects, units, loading } = useInventory();

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      itemCode: "",
      category: "",
      unit: "",
      minLevel: 10,
      initialStock: 0,
      vendorIds: [],
      notes: "",
    },
  });

  // Track the selected category
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Update the selected category when it changes in the form
  React.useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === 'category' && value.category) {
        setSelectedCategory(value.category as string);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  async function onSubmit(values: FormValues) {
    try {
      const categoryObject = categoryObjects.find(cat => cat.name === values.category);
      if (!categoryObject) {
        throw new Error('Category not found');
      }

      await inventoryService.createItem({
        name: values.name,
        sku: values.itemCode || '',
        unit: values.unit || '',
        min_quantity: values.minLevel,
        quantity: values.initialStock,
        notes: values.notes,
        vendor: ''
      });

      toast({
        title: "Item Added Successfully",
        description: `${values.name} has been added to inventory.`,
      });
      methods.reset();
      setSelectedCategory("");
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item to inventory",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading inventory categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <FormProvider {...methods}>
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
                <ItemFormDetails 
                  categories={categories} 
                  units={units}
                  setCategoryValue={setSelectedCategory}
                />
                <ItemFormVendors selectedCategory={selectedCategory} />
                <StockFormNotes />
                <StockFormSubmitButton label="Add Item" />
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddItem;
