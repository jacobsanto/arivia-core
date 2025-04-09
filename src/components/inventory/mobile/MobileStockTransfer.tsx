
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowRight, Plus, Minus } from "lucide-react";

interface MobileStockTransferProps {
  onComplete: () => void;
}

const MobileStockTransfer = ({ onComplete }: MobileStockTransferProps) => {
  const [items, setItems] = React.useState([{ id: 1, itemId: "", quantity: 1 }]);

  const addItem = () => {
    setItems([...items, { id: items.length + 1, itemId: "", quantity: 1 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="fromLocation">From Location</Label>
          <Select>
            <SelectTrigger id="fromLocation">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main Storage</SelectItem>
              <SelectItem value="villa1">Villa Caldera</SelectItem>
              <SelectItem value="villa2">Villa Azure</SelectItem>
              <SelectItem value="villa3">Villa Sunset</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="toLocation">To Location</Label>
          <Select>
            <SelectTrigger id="toLocation">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main Storage</SelectItem>
              <SelectItem value="villa1">Villa Caldera</SelectItem>
              <SelectItem value="villa2">Villa Azure</SelectItem>
              <SelectItem value="villa3">Villa Sunset</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Items to Transfer</Label>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-end gap-2">
              <div className="flex-1">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item1">Bath Towels</SelectItem>
                    <SelectItem value="item2">Toilet Paper</SelectItem>
                    <SelectItem value="item3">Hand Soap</SelectItem>
                    <SelectItem value="item4">Dishwasher Tablets</SelectItem>
                    <SelectItem value="item5">Coffee Pods</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20">
                <Input type="number" min="1" value={item.quantity} onChange={() => {}} />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeItem(item.id)}
                className="shrink-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full mt-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Optional notes" className="resize-none" rows={3} />
      </div>

      <div className="pt-4 flex gap-2 sticky bottom-0 bg-background pb-2">
        <Button variant="outline" className="flex-1" onClick={onComplete}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={onComplete}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Transfer Stock
        </Button>
      </div>
    </div>
  );
};

export default MobileStockTransfer;
