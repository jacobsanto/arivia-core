
import React, { useState } from "react";
import { CheckSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChecklistTemplates } from "@/hooks/useNewChecklistTemplates";
import { ChecklistTemplate, CHECKLIST_CATEGORIES } from "@/types/checklistTypes";
import { transformToOldFormat } from "@/utils/checklistCompatibility";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskTemplateSelectorProps {
  selectedTemplate: ChecklistTemplate | null;
  onSelectTemplate: (template: ChecklistTemplate) => void;
}

const TaskTemplateSelector = ({
  selectedTemplate,
  onSelectTemplate
}: TaskTemplateSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Housekeeping");
  
  const { templates: newTemplates, loading } = useChecklistTemplates();
  
  // Transform new format to old format for compatibility
  const templates = newTemplates.map(transformToOldFormat);

  // Filter templates by search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Checklist Template</label>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          <CheckSquare className="h-4 w-4 mr-2" />
          {selectedTemplate ? "Change Template" : "Select Template"}
        </Button>
      </div>
      
      {selectedTemplate ? (
        <div className="bg-muted/50 p-3 rounded-md">
          <div className="flex justify-between mb-1">
            <div className="font-medium">{selectedTemplate.name}</div>
            <div className="text-sm text-muted-foreground">{selectedTemplate.category}</div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{selectedTemplate.description}</p>
          <div className="text-sm">
            <span className="font-medium">{selectedTemplate.items.length} items</span> in checklist
          </div>
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-4 text-center text-muted-foreground text-sm">
          No template selected. Default checklist will be used.
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Checklist Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CHECKLIST_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading templates...</p>
                  </div>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No matching templates found
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => {
                      onSelectTemplate(template);
                      setIsDialogOpen(false);
                    }}
                  >
                    <div className="flex justify-between mb-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {template.category}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {template.items.length} items • Created by {template.createdBy}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTemplateSelector;
