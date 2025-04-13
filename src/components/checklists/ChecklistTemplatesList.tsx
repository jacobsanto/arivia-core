
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { Plus, Edit, Trash2, Copy, Eye } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const ChecklistTemplatesList: React.FC = () => {
  const { 
    templates, 
    isLoading, 
    setSelectedTemplate, 
    setIsCreateModalOpen, 
    setIsEditModalOpen,
    deleteTemplate 
  } = useChecklistTemplates();
  const { user } = useUser();
  const isSuperAdmin = user?.role === "superadmin";
  const [activeTab, setActiveTab] = React.useState("all");
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  const filteredTemplates = React.useMemo(() => {
    if (activeTab === "all") return templates;
    return templates.filter(template => template.taskType === activeTab);
  }, [templates, activeTab]);

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      await deleteTemplate(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    // Implement preview logic (could open a modal or dialog)
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Checklist Templates</h2>
        {isSuperAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="Housekeeping">Housekeeping</TabsTrigger>
          <TabsTrigger value="Maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No templates found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className={cn(!template.isActive && "opacity-60")}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md">{template.title}</CardTitle>
                      <Badge variant={template.taskType === "Housekeeping" ? "default" : "secondary"}>
                        {template.taskType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {template.items.length} items
                    </p>
                    {!template.isActive && (
                      <Badge variant="outline" className="mt-2">Inactive</Badge>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="icon" onClick={() => handlePreview(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {isSuperAdmin && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(template.id)}
                          className={confirmDelete === template.id ? "bg-red-100" : ""}
                        >
                          <Trash2 className={cn(
                            "h-4 w-4", 
                            confirmDelete === template.id && "text-red-600"
                          )} />
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChecklistTemplatesList;
