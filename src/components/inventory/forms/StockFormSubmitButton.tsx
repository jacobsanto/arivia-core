
import React from "react";
import { Button } from "@/components/ui/button";

interface StockFormSubmitButtonProps {
  label: string;
}

const StockFormSubmitButton: React.FC<StockFormSubmitButtonProps> = ({ label }) => {
  return (
    <Button type="submit" className="w-full md:w-auto">
      {label}
    </Button>
  );
};

export default StockFormSubmitButton;
