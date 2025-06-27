
import React from "react";
import LoginForm from "./LoginForm";

const MobileLogin = () => {
  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img 
          src="/lovable-uploads/c71ac675-b13f-4479-a62a-758f193152c2.png" 
          alt="Arivia Logo" 
          className="h-20 w-auto object-contain"
        />
      </div>

      {/* Form container */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-1">Internal Access</h2>
        <p className="text-gray-500 mb-6">Login with your staff credentials</p>
        <LoginForm isMobile={true} />
      </div>
    </div>
  );
};

export default MobileLogin;
