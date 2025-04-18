
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StockFormSubmitButtonProps {
  label: string;
  isLoading?: boolean;
}

const StockFormSubmitButton: React.FC<StockFormSubmitButtonProps> = ({ 
  label, 
  isLoading = false 
}) => {
  return (
    <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
      <span className="flex items-center">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <span>{label}</span>
      </span>
    </Button>
  );
};

export default StockFormSubmitButton;
