import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

interface PropertyNotesTabProps {
  propertyId: string;
  notes: string;
}

export const PropertyNotesTab: React.FC<PropertyNotesTabProps> = ({ propertyId, notes }) => {
  const [editedNotes, setEditedNotes] = useState(notes);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            placeholder="Add important notes about this property (gate codes, special instructions, etc.)"
            rows={8}
          />
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};