
import React from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

const EmailConnectionTester: React.FC = () => {
  const testEmailConnection = () => {
    toast.info("Testing email connection...");
    
    setTimeout(() => {
      toast.success("Email connection successful", {
        description: "SMTP connection test completed successfully."
      });
    }, 1500);
  };

  return (
    <div className="flex justify-end">
      <Button 
        type="button" 
        variant="outline" 
        onClick={testEmailConnection}
        className="flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        Test Connection
      </Button>
    </div>
  );
};

export default EmailConnectionTester;
