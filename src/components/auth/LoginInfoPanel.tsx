
import React from "react";
import { Lock, Home, Users } from "lucide-react";

export const LoginInfoPanel: React.FC = () => {
  return (
    <div className="hidden lg:block lg:w-[45%] bg-primary text-white p-12 flex flex-col justify-center">
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Vacation Rental Management System
        </h1>
        <p className="text-lg mb-12">
          Streamline your property management operations with our comprehensive platform. 
          Manage properties, bookings, guests, and more from a single intuitive dashboard.
        </p>
        
        <div className="space-y-6">
          <FeatureItem 
            icon={<Lock className="w-6 h-6" />} 
            title="Secure Access" 
            description="Role-based permissions ensure data security" 
          />
          
          <FeatureItem 
            icon={<Home className="w-6 h-6" />} 
            title="Property Management" 
            description="Easily manage all your vacation properties" 
          />
          
          <FeatureItem 
            icon={<Users className="w-6 h-6" />} 
            title="Guest Management" 
            description="Keep track of all your guests in one place" 
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => {
  return (
    <div className="flex items-center">
      <div className="bg-white/20 p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-white/80">{description}</p>
      </div>
    </div>
  );
};
