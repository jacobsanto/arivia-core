
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { GoogleSheetsService, SheetInfo, SheetRelationship } from "@/services/googleSheets/googleSheetsService";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const relationshipSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sourceSpreadsheetId: z.string().min(1, "Source spreadsheet ID is required"),
  sourceRange: z.string().min(1, "Source range is required"),
  targetRange: z.string().min(1, "Target range is required"),
  targetSpreadsheetId: z.string().optional(),
  writeMode: z.enum(["overwrite", "append"]).default("overwrite"),
  keyColumn: z.string().optional(),
  description: z.string().optional(),
});

interface SheetRelationshipManagerProps {
  spreadsheetId: string;
  onRelationshipsChange?: (relationships: SheetRelationship[]) => void;
}

const SheetRelationshipManager: React.FC<SheetRelationshipManagerProps> = ({ 
  spreadsheetId,
  onRelationshipsChange 
}) => {
  const [relationships, setRelationships] = useState<SheetRelationship[]>([]);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<z.infer<typeof relationshipSchema>>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      name: "",
      sourceSpreadsheetId: spreadsheetId,
      sourceRange: "",
      targetRange: "",
      targetSpreadsheetId: spreadsheetId,
      writeMode: "overwrite",
      keyColumn: "",
      description: "",
    },
  });

  useEffect(() => {
    if (spreadsheetId) {
      loadSheets();
      // Load relationships from localStorage if available
      const savedRelationships = localStorage.getItem(`sheet_relationships_${spreadsheetId}`);
      if (savedRelationships) {
        try {
          const parsedRelationships = JSON.parse(savedRelationships);
          setRelationships(parsedRelationships);
          if (onRelationshipsChange) {
            onRelationshipsChange(parsedRelationships);
          }
        } catch (e) {
          console.error("Error parsing saved relationships:", e);
        }
      }
    }
  }, [spreadsheetId]);

  const loadSheets = async () => {
    if (!spreadsheetId) return;
    
    setLoading(true);
    try {
      const sheetsList = await GoogleSheetsService.getSheetsList(spreadsheetId);
      if (sheetsList) {
        setSheets(sheetsList);
      }
    } catch (e) {
      console.error("Error loading sheets:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelationship = (data: z.infer<typeof relationshipSchema>) => {
    const newRelationship: SheetRelationship = {
      ...data,
      // If target spreadsheet is empty, use source
      targetSpreadsheetId: data.targetSpreadsheetId || data.sourceSpreadsheetId
    };

    let updatedRelationships: SheetRelationship[];
    
    if (editingIndex !== null) {
      // Update existing relationship
      updatedRelationships = [...relationships];
      updatedRelationships[editingIndex] = newRelationship;
    } else {
      // Add new relationship
      updatedRelationships = [...relationships, newRelationship];
    }
    
    setRelationships(updatedRelationships);
    
    // Save to localStorage
    localStorage.setItem(
      `sheet_relationships_${spreadsheetId}`, 
      JSON.stringify(updatedRelationships)
    );
    
    if (onRelationshipsChange) {
      onRelationshipsChange(updatedRelationships);
    }
    
    // Reset form
    form.reset({
      name: "",
      sourceSpreadsheetId: spreadsheetId,
      sourceRange: "",
      targetRange: "",
      targetSpreadsheetId: spreadsheetId,
      writeMode: "overwrite",
      keyColumn: "",
      description: "",
    });
    
    setEditingIndex(null);
    setShowAddForm(false);
    
    toast.success(
      editingIndex !== null ? "Relationship updated" : "Relationship added"
    );
  };

  const handleEditRelationship = (index: number) => {
    const relationship = relationships[index];
    form.reset({
      name: relationship.name,
      sourceSpreadsheetId: relationship.sourceSpreadsheetId,
      sourceRange: relationship.sourceRange,
      targetRange: relationship.targetRange,
      targetSpreadsheetId: relationship.targetSpreadsheetId || spreadsheetId,
      writeMode: relationship.writeMode || "overwrite",
      keyColumn: relationship.keyColumn || "",
      description: relationship.description || "",
    });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDeleteRelationship = (index: number) => {
    const updatedRelationships = relationships.filter((_, i) => i !== index);
    setRelationships(updatedRelationships);
    
    // Save to localStorage
    localStorage.setItem(
      `sheet_relationships_${spreadsheetId}`, 
      JSON.stringify(updatedRelationships)
    );
    
    if (onRelationshipsChange) {
      onRelationshipsChange(updatedRelationships);
    }
    
    toast.success("Relationship removed");
  };

  const handleValidateRelationships = async () => {
    if (relationships.length === 0) {
      toast.warning("No relationships to validate");
      return;
    }
    
    setValidating(true);
    try {
      const result = await GoogleSheetsService.validateRelationships(
        spreadsheetId,
        relationships
      );
      
      if (result && result.validationResults) {
        const validCount = result.validationResults.filter(r => r.valid).length;
        const invalidCount = result.validationResults.length - validCount;
        
        if (result.allValid) {
          toast.success(`All ${validCount} relationships are valid`);
        } else {
          toast.warning(`${invalidCount} of ${result.validationResults.length} relationships have issues`, {
            description: "Check the console for details"
          });
        }
      }
    } catch (e) {
      console.error("Error validating relationships:", e);
      toast.error("Failed to validate relationships");
    } finally {
      setValidating(false);
    }
  };

  const handleCancelEdit = () => {
    form.reset();
    setEditingIndex(null);
    setShowAddForm(false);
  };
  
  const handleExportRelationships = () => {
    try {
      const dataStr = JSON.stringify(relationships, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `sheet_relationships_${spreadsheetId.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Relationships exported successfully");
    } catch (e) {
      console.error("Error exporting relationships:", e);
      toast.error("Failed to export relationships");
    }
  };
  
  const handleImportRelationships = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedRelationships = JSON.parse(content) as SheetRelationship[];
        
        if (!Array.isArray(importedRelationships)) {
          throw new Error("Invalid format: expected an array of relationships");
        }
        
        setRelationships(importedRelationships);
        
        // Save to localStorage
        localStorage.setItem(
          `sheet_relationships_${spreadsheetId}`, 
          JSON.stringify(importedRelationships)
        );
        
        if (onRelationshipsChange) {
          onRelationshipsChange(importedRelationships);
        }
        
        toast.success(`Imported ${importedRelationships.length} relationships`);
      } catch (e) {
        console.error("Error importing relationships:", e);
        toast.error("Failed to import relationships: invalid format");
      }
    };
    reader.readAsText(file);
    
    // Reset the input to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sheet Relationships</CardTitle>
        <CardDescription>
          Define how sheets are related and synchronized with each other
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relationships.length > 0 ? (
            <div className="space-y-2">
              {relationships.map((relationship, index) => (
                <Card key={index} className="p-4 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{relationship.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {relationship.sourceRange} → {relationship.targetRange}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mode: {relationship.writeMode || "overwrite"}
                      </p>
                      {relationship.description && (
                        <p className="text-sm mt-2">{relationship.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRelationship(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteRelationship(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No sheet relationships defined</p>
              <p className="text-sm">
                Create relationships to automate data flow between sheets
              </p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <div className="flex gap-2">
              <Button
                variant={showAddForm ? "secondary" : "default"}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? "Cancel" : "Add Relationship"}
              </Button>
              
              {relationships.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleValidateRelationships}
                  disabled={validating}
                >
                  {validating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  )}
                  Validate
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportRelationships} disabled={relationships.length === 0}>
                Export
              </Button>
              <div>
                <input
                  type="file"
                  id="import-relationships"
                  className="hidden"
                  accept=".json"
                  onChange={handleImportRelationships}
                />
                <Button variant="outline" onClick={() => document.getElementById("import-relationships")?.click()}>
                  Import
                </Button>
              </div>
            </div>
          </div>

          {showAddForm && (
            <Card className="mt-4 p-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">
                  {editingIndex !== null ? "Edit Relationship" : "Add New Relationship"}
                </CardTitle>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddRelationship)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Relationship name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sourceRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source Range</FormLabel>
                          <FormControl>
                            <Input placeholder="Sheet1!A1:C10" {...field} />
                          </FormControl>
                          <FormDescription>
                            e.g., Sheet1!A1:C10
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="targetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Range</FormLabel>
                          <FormControl>
                            <Input placeholder="Sheet2!A1:C10" {...field} />
                          </FormControl>
                          <FormDescription>
                            e.g., Sheet2!A1:C10
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="writeMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Write Mode</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overwrite">Overwrite</SelectItem>
                            <SelectItem value="append">Append</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Overwrite replaces data, Append adds to the end
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe this relationship..." 
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      {editingIndex !== null ? "Update" : "Save"}
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SheetRelationshipManager;
