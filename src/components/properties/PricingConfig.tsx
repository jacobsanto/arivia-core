
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Save,
  EditIcon,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define SeasonalRate type to avoid type issues
interface SeasonalRate {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  priceModifier: number;
  minStay: number;
}

// Sample seasonal rates
const sampleSeasonalRates: SeasonalRate[] = [
  {
    id: 1,
    name: "Peak Season",
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    priceModifier: 1.5,
    minStay: 7,
  },
  {
    id: 2,
    name: "Holiday Season",
    startDate: "2025-12-15",
    endDate: "2026-01-05",
    priceModifier: 1.75,
    minStay: 5,
  },
  {
    id: 3,
    name: "Low Season",
    startDate: "2025-11-01",
    endDate: "2025-12-14",
    priceModifier: 0.8,
    minStay: 3,
  },
];

interface PricingConfigProps {
  property: any;
  onBack: () => void;
}

const PricingConfig = ({ property, onBack }: PricingConfigProps) => {
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>(sampleSeasonalRates);
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [basePrice, setBasePrice] = useState(property.price);
  
  const handleAddNewRate = () => {
    setIsAddingRate(true);
    setEditingRateId(null);
  };
  
  const handleEditRate = (rateId: number) => {
    setIsAddingRate(true);
    setEditingRateId(rateId);
  };
  
  const handleDeleteRate = (rateId: number) => {
    setSeasonalRates(prevRates => prevRates.filter(rate => rate.id !== rateId));
    toast.success("Seasonal rate deleted");
  };
  
  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasePrice(Number(e.target.value));
  };
  
  const handleSavePricing = () => {
    // In a real app, we would save the updated pricing data
    toast.success(`Base price for ${property.name} updated to €${basePrice}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{property.name}</h2>
          <p className="text-muted-foreground">Pricing Configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Base Pricing</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="basePrice" className="text-sm font-medium">Base Price per Night</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                  <Input
                    id="basePrice"
                    type="number"
                    min="1"
                    className="pl-8"
                    value={basePrice}
                    onChange={handleBasePriceChange}
                  />
                </div>
                <p className="text-sm text-muted-foreground">This is the standard nightly rate</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Cleaning Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                  <Input
                    type="number"
                    min="0"
                    className="pl-8"
                    defaultValue="75"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Security Deposit</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                  <Input
                    type="number"
                    min="0"
                    className="pl-8"
                    defaultValue="500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSavePricing}>
              <Save className="mr-2 h-4 w-4" />
              Save Base Pricing
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Seasonal Rates</CardTitle>
            <Button size="sm" onClick={handleAddNewRate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Season
            </Button>
          </CardHeader>
          <CardContent>
            {!isAddingRate ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Season Name</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Price Modifier</TableHead>
                    <TableHead>Min Stay</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasonalRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.name}</TableCell>
                      <TableCell>{rate.startDate} to {rate.endDate}</TableCell>
                      <TableCell>{rate.priceModifier}x (€{Math.round(basePrice * rate.priceModifier)})</TableCell>
                      <TableCell>{rate.minStay} nights</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditRate(rate.id)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteRate(rate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <SeasonalRateForm 
                onSubmit={(data) => {
                  if (editingRateId) {
                    // Update existing rate
                    setSeasonalRates(rates => 
                      rates.map(rate => 
                        rate.id === editingRateId 
                          ? { 
                              ...data, 
                              id: rate.id,
                              startDate: format(data.startDate, 'yyyy-MM-dd'),
                              endDate: format(data.endDate, 'yyyy-MM-dd')
                            } 
                          : rate
                      )
                    );
                    toast.success(`${data.name} season updated`);
                  } else {
                    // Add new rate
                    const newRate: SeasonalRate = {
                      ...data,
                      id: Date.now(),
                      startDate: format(data.startDate, 'yyyy-MM-dd'),
                      endDate: format(data.endDate, 'yyyy-MM-dd')
                    };
                    setSeasonalRates(rates => [...rates, newRate]);
                    toast.success(`${data.name} season added`);
                  }
                  setIsAddingRate(false);
                  setEditingRateId(null);
                }}
                onCancel={() => {
                  setIsAddingRate(false);
                  setEditingRateId(null);
                }}
                initialData={editingRateId 
                  ? seasonalRates.find(rate => rate.id === editingRateId) 
                  : undefined
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const seasonalRateSchema = z.object({
  name: z.string().min(2, "Season name is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }).refine(date => date > new Date(), {
    message: "End date must be in the future",
  }),
  priceModifier: z.coerce.number().min(0.1, "Price modifier must be at least 0.1"),
  minStay: z.coerce.number().int().min(1, "Minimum stay must be at least 1 night"),
});

type SeasonalRateValues = z.infer<typeof seasonalRateSchema>;

interface SeasonalRateFormProps {
  initialData?: SeasonalRate;
  onSubmit: (data: SeasonalRateValues) => void;
  onCancel: () => void;
}

const SeasonalRateForm = ({ initialData, onSubmit, onCancel }: SeasonalRateFormProps) => {
  const form = useForm<SeasonalRateValues>({
    resolver: zodResolver(seasonalRateSchema),
    defaultValues: {
      name: initialData?.name || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
      endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      priceModifier: initialData?.priceModifier || 1.0,
      minStay: initialData?.minStay || 1,
    },
  });

  const handleSubmit = (data: SeasonalRateValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Season Name</FormLabel>
                <FormControl>
                  <Input placeholder="Peak Season" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a start date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick an end date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date <= form.watch("startDate")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="priceModifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Modifier</FormLabel>
                <FormControl>
                  <Input type="number" min="0.1" step="0.05" {...field} />
                </FormControl>
                <FormDescription>
                  Multiply base price by this value (e.g. 1.5 = +50%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minStay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stay (nights)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{initialData ? 'Update' : 'Add'} Season</Button>
        </div>
      </form>
    </Form>
  );
};

export default PricingConfig;
