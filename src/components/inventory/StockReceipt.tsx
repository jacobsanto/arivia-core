import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MinusCircle, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFormArray } from "@/hooks/useFormArray";

const formSchema = z.object({
  location: z.string().min(1, { message: "Please select a location." }),
  reference: z.string().optional(),
  date: z.string(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string().min(1, { message: "Please select an item." }),
      quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
    })
  ).min(1, { message: "Please add at least one item." }),
});

type FormValues = z.infer<typeof formSchema>;

const StockReceipt = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ itemId: "", quantity: 1 }],
    },
  });
  
  const formHook = useFormArray();

  const onSubmit = (values: FormValues) => {
    console.log(values);
    toast({
      title: "Stock Receipt Processed",
      description: `Items have been added to ${
        values.location === "main" ? "Main Storage" : values.location
      }`,
    });
    methods.reset({
      location: "",
      reference: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      items: [{ itemId: "", quantity: 1 }],
    });
  };

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <FormProvider {...methods}>
            <Form {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={methods.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="main">Main Storage</SelectItem>
                            <SelectItem value="villa_caldera">Villa Caldera</SelectItem>
                            <SelectItem value="villa_oceana">Villa Oceana</SelectItem>
                            <SelectItem value="villa_azure">Villa Azure</SelectItem>
                            <SelectItem value="villa_sunset">Villa Sunset</SelectItem>
                            <SelectItem value="villa_paradiso">Villa Paradiso</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., INV-2023-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Items Received</h3>
                  
                  {React.useMemo(() => {
                    const { fields, append, remove } = formHook.getFieldArray("items");
                    
                    return (
                      <>
                        {fields.map((field, index) => (
                          <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
                            <div className="md:col-span-8">
                              <FormField
                                control={methods.control}
                                name={`items.${index}.itemId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                      Item
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select item" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="towels">Hand Towels</SelectItem>
                                        <SelectItem value="toilet_paper">Toilet Paper</SelectItem>
                                        <SelectItem value="detergent">Laundry Detergent</SelectItem>
                                        <SelectItem value="soap">Bath Soap</SelectItem>
                                        <SelectItem value="shampoo">Shampoo</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <FormField
                                control={methods.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className={index !== 0 ? "sr-only" : undefined}>
                                      Quantity
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                              >
                                <MinusCircle className="h-4 w-4" />
                                <span className="sr-only">Remove item</span>
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => append({ itemId: "", quantity: 1 })}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Another Item
                        </Button>
                      </>
                    );
                  }, [methods.control])}
                </div>

                <FormField
                  control={methods.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes about this receipt..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto">Process Receipt</Button>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockReceipt;
