
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { RevenueBreakdown } from "../components/RevenueBreakdown";

interface BookingsTabProps {
  weekOverWeekData: any;
}

const BookingsTab: React.FC<BookingsTabProps> = ({ weekOverWeekData }) => {
  return (
    <TabsContent value="bookings" className="space-y-5 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueBreakdown totalRevenue={weekOverWeekData.revenue.current} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Villa Caldera</p>
                  <p className="text-sm text-muted-foreground">4 guests</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  4 nights
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs mt-2">
                <Calendar className="h-3 w-3" />
                <span>Apr 15 - Apr 19, 2025</span>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Villa Azure</p>
                  <p className="text-sm text-muted-foreground">2 guests</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  7 nights
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs mt-2">
                <Calendar className="h-3 w-3" />
                <span>Apr 18 - Apr 25, 2025</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default BookingsTab;
