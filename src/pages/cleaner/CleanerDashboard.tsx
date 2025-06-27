
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { CheckSquare, Clock, MapPin } from "lucide-react";

const CleanerDashboard: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Housekeeping Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              3 completed, 3 pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Task</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10:30 AM</div>
            <p className="text-xs text-muted-foreground">
              Standard cleaning - Villa A
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Villa B</div>
            <p className="text-xs text-muted-foreground">
              Deep cleaning in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Villa A - Standard Clean</p>
                  <p className="text-xs text-muted-foreground">8:00 AM - Completed</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Villa B - Deep Clean</p>
                  <p className="text-xs text-muted-foreground">9:30 AM - In Progress</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Villa C - Standard Clean</p>
                  <p className="text-xs text-muted-foreground">10:30 AM - Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplies Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Towels</span>
                <span className="text-sm font-medium text-green-600">Adequate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cleaning Products</span>
                <span className="text-sm font-medium text-yellow-600">Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bed Linens</span>
                <span className="text-sm font-medium text-green-600">Adequate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vacuum Bags</span>
                <span className="text-sm font-medium text-red-600">Critical</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CleanerDashboard;
