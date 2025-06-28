
import { toast } from "sonner";

export const registerUser = async (data: any, superAdminExists: boolean): Promise<boolean> => {
  try {
    // Check if trying to create superadmin when one already exists
    if (data.role === "superadmin" && superAdminExists) {
      toast.error("Super Admin role already exists", {
        description: "Only one Super Admin account can be created.",
      });
      return false;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Store user in localStorage for demo purposes
    const newUser = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: "/placeholder.svg"
    };

    // Update existing users or create new array
    const existingUsers = localStorage.getItem("users");
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    toast.success("Account created successfully", {
      description: "You can now sign in with your credentials",
    });
    
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    toast.error("Registration failed", {
      description: "There was an error creating your account. Please try again.",
    });
    return false;
  }
};
