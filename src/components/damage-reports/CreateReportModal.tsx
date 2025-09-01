import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CreateDamageReportData } from '@/types/damage-reports.types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Upload, X, Camera } from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDamageReportData) => void;
  isLoading?: boolean;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<Partial<CreateDamageReportData>>({
    title: '',
    description: '',
    propertyId: '',
    location: '',
    priority: 'normal',
    source: 'unknown',
    estimatedCost: 0,
    photos: []
  });
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidForm()) {
      onSubmit(formData as CreateDamageReportData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      propertyId: '',
      location: '',
      priority: 'normal',
      source: 'unknown',
      estimatedCost: 0,
      photos: []
    });
    onClose();
  };

  const isValidForm = () => {
    return formData.title && formData.description && formData.propertyId && 
           formData.location && formData.estimatedCost !== undefined;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      setFormData(prev => ({
        ...prev,
        photos: [...(prev.photos || []), ...newFiles]
      }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index) || []
    }));
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Report Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Brief description of the damage"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Provide detailed information about the damage, how it occurred, and any immediate actions taken"
          rows={4}
          required
        />
      </div>

      {/* Property and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="property">Property *</Label>
          <Select 
            value={formData.propertyId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, propertyId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prop1">Ocean View Villa</SelectItem>
              <SelectItem value="prop2">Sunset Beach House</SelectItem>
              <SelectItem value="prop3">Garden Villa</SelectItem>
              <SelectItem value="prop4">Mountain Retreat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Specific Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Master Bedroom, Pool Area, Kitchen"
            required
          />
        </div>
      </div>

      {/* Priority and Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Damage Source *</Label>
          <Select 
            value={formData.source} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guest">Guest</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="wear_tear">Wear & Tear</SelectItem>
              <SelectItem value="accident">Accident</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estimated Cost */}
      <div className="space-y-2">
        <Label htmlFor="cost">Estimated Repair Cost (€) *</Label>
        <Input
          id="cost"
          type="number"
          min="0"
          step="0.01"
          value={formData.estimatedCost}
          onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
          placeholder="0.00"
          required
        />
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Photos</Label>
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          `}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
        >
          <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag photos here or click to upload
          </p>
          <Button type="button" variant="outline" size="sm" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </label>
          </Button>
        </div>

        {/* Photo Preview */}
        {formData.photos && formData.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {formData.photos.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValidForm() || isLoading}>
          {isLoading ? 'Creating...' : 'Create Report'}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create Damage Report</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Damage Report</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};