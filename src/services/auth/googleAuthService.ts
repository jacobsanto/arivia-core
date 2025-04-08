
import { jwtDecode } from "jwt-decode";
import { User } from "@/types/auth";
import { saveAuthData } from "./authService";
import { toast } from "sonner";
import { addUserNotification } from "@/services/notifications/notificationService";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google's unique identifier
}

export const handleGoogleLogin = async (credential: string): Promise<User> => {
  try {
    // Decode the JWT token from Google
    const decodedToken = jwtDecode<GoogleUser>(credential);
    console.log("Decoded Google token:", decodedToken);
    
    // Check if user exists in local storage (for demo purposes)
    const customUsers = localStorage.getItem("users");
    let users = customUsers ? JSON.parse(customUsers) : [];
    
    // Check if this Google user has logged in before
    let foundUser = users.find((u: any) => u.email === decodedToken.email);
    
    if (!foundUser) {
      // Create a new user with guest role and pending approval
      const newUser: User = {
        id: `google-${decodedToken.sub}`,
        email: decodedToken.email,
        name: decodedToken.name,
        role: "guest", // Default role for new Google users
        avatar: decodedToken.picture || "/placeholder.svg",
        googleId: decodedToken.sub,
        pendingApproval: true,
        createdAt: Date.now()
      };
      
      // Add to local storage users
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      foundUser = newUser;
      
      // Create notification for admins about new user
      addUserNotification({
        id: `new-user-${newUser.id}`,
        type: "new_user",
        title: "New User Registration",
        message: `${newUser.name} (${newUser.email}) has registered with Google and needs role approval.`,
        createdAt: Date.now(),
        userId: newUser.id,
        read: false
      });
      
      toast.success("Account created successfully", {
        description: "Your account is pending approval from an administrator. Some features may be limited until approved.",
      });
    } else if (!foundUser.googleId) {
      // Link Google ID to existing account
      foundUser.googleId = decodedToken.sub;
      foundUser.avatar = decodedToken.picture || foundUser.avatar;
      localStorage.setItem("users", JSON.stringify(users));
      
      toast.success("Accounts linked", {
        description: "Your Google account has been linked to your existing account",
      });
    }
    
    // Generate auth token (24 hour expiry)
    const authToken = `google-${Math.random().toString(36).substring(2)}`;
    
    // Save authentication data
    saveAuthData(authToken, foundUser);
    
    return foundUser;
  } catch (error) {
    console.error("Google authentication error:", error);
    toast.error("Google authentication failed");
    throw new Error("Failed to authenticate with Google");
  }
};
