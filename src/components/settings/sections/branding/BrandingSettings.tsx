import React, { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Camera, Upload } from "lucide-react";
import { BrandingSettingsFormValues } from "@/types/systemSettings.types";

interface BrandingSettingsProps {
  form: any;
}

const BrandingSettings: React.FC<BrandingSettingsProps> = ({ form }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        form.setValue("companyLogoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Customize the application to match your corporate identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="primaryBrandColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Brand Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color" 
                      value={field.value} 
                      onChange={field.onChange}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input 
                      type="text" 
                      value={field.value} 
                      onChange={field.onChange}
                      placeholder="#0EA5E9"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Changes button colors, headers, and active elements globally
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondaryBrandColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Brand Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color" 
                      value={field.value} 
                      onChange={field.onChange}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input 
                      type="text" 
                      value={field.value} 
                      onChange={field.onChange}
                      placeholder="#6366F1"
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Used for accents and secondary UI elements
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companyLogoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Upload Logo
                    </Button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    {(logoPreview || field.value) && (
                      <div className="flex items-center gap-2">
                        <img
                          src={logoPreview || field.value}
                          alt="Logo preview"
                          className="h-12 w-auto max-w-24 object-contain border rounded"
                        />
                        <span className="text-sm text-muted-foreground">Preview</span>
                      </div>
                    )}
                  </div>
                  <Input
                    placeholder="Or paste logo URL"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Replaces the default logo in sidebar, login page, and exported reports
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default BrandingSettings;