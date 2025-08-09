
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plug, Mail, Calendar, FileText, FolderOpen } from "lucide-react";

interface IntegrationCardProps {
  provider: string;
  name: string;
  description?: string | null;
  category?: string | null;
  features?: string[] | null;
}

const categoryIcon = (category?: string | null) => {
  switch (category) {
    case "communication":
      return <Mail className="h-4 w-4" />;
    case "calendar":
      return <Calendar className="h-4 w-4" />;
    case "documents":
      return <FileText className="h-4 w-4" />;
    case "files":
      return <FolderOpen className="h-4 w-4" />;
    default:
      return <Plug className="h-4 w-4" />;
  }
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  provider,
  name,
  description,
  category,
  features
}) => {
  const handleConnect = () => {
    // Placeholder until provider-specific OAuth/API setup is wired
    toast.info(`Connection setup for ${name} will open here.`, {
      description: "We’ll add the full auth flow next.",
      duration: 4500,
    });
  };

  return (
    <Card className="h-full hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {categoryIcon(category)}
            <h3 className="font-medium">{name}</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
            {provider}
          </span>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {description}
          </p>
        )}

        {Array.isArray(features) && features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {features.map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <Button onClick={handleConnect} className="w-full">
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationCard;
