export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in_date: string
          check_out_date: string
          created_at: string
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          num_guests: number
          property_id: string
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          created_at?: string
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          num_guests: number
          property_id: string
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          created_at?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          num_guests?: number
          property_id?: string
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channels: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_property_specific: boolean | null
          name: string
          property_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_property_specific?: boolean | null
          name: string
          property_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_property_specific?: boolean | null
          name?: string
          property_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          reactions: Json | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          reactions?: Json | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          reactions?: Json | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          items: Json
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          items?: Json
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          items?: Json
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      damage_report_media: {
        Row: {
          created_at: string
          id: string
          media_type: string
          report_id: string
          uploaded_by: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          report_id: string
          uploaded_by: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          report_id?: string
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_report_media_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "damage_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_reports: {
        Row: {
          assigned_to: string | null
          compensation_amount: number | null
          compensation_notes: string | null
          conclusion: string | null
          created_at: string
          damage_date: string
          description: string
          estimated_cost: number | null
          final_cost: number | null
          id: string
          property_id: string
          reported_by: string
          resolution_date: string | null
          status: Database["public"]["Enums"]["damage_report_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          compensation_amount?: number | null
          compensation_notes?: string | null
          conclusion?: string | null
          created_at?: string
          damage_date: string
          description: string
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          property_id: string
          reported_by: string
          resolution_date?: string | null
          status?: Database["public"]["Enums"]["damage_report_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          compensation_amount?: number | null
          compensation_notes?: string | null
          conclusion?: string | null
          created_at?: string
          damage_date?: string
          description?: string
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          property_id?: string
          reported_by?: string
          resolution_date?: string | null
          status?: Database["public"]["Enums"]["damage_report_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      financial_reports: {
        Row: {
          category: string
          created_at: string | null
          expenses: number
          id: string
          margin: string
          month: string
          profit: number
          property: string
          revenue: number
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          expenses: number
          id?: string
          margin: string
          month: string
          profit: number
          property: string
          revenue: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          expenses?: number
          id?: string
          margin?: string
          month?: string
          profit?: number
          property?: string
          revenue?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      guesty_bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string | null
          guest_name: string | null
          id: string
          last_synced: string | null
          listing_id: string
          raw_data: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string | null
          guest_name?: string | null
          id: string
          last_synced?: string | null
          listing_id: string
          raw_data?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string | null
          guest_name?: string | null
          id?: string
          last_synced?: string | null
          listing_id?: string
          raw_data?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guesty_bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "guesty_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      guesty_listings: {
        Row: {
          address: Json | null
          created_at: string | null
          id: string
          last_synced: string | null
          property_type: string | null
          raw_data: Json | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          id: string
          last_synced?: string | null
          property_type?: string | null
          raw_data?: Json | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          id?: string
          last_synced?: string | null
          property_type?: string | null
          raw_data?: Json | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          priority: string
          property_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          priority?: string
          property_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          priority?: string
          property_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          item_code: string | null
          min_quantity: number
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          item_code?: string | null
          min_quantity?: number
          name: string
          unit: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item_code?: string | null
          min_quantity?: number
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          created_at: string
          id: string
          item_id: string
          last_updated_by: string | null
          location_id: string | null
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          last_updated_by?: string | null
          location_id?: string | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          last_updated_by?: string | null
          location_id?: string | null
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_usage: {
        Row: {
          category: string
          created_at: string | null
          date: string | null
          id: string
          item: string
          property: string
          quantity: number
          reported_by: string
        }
        Insert: {
          category: string
          created_at?: string | null
          date?: string | null
          id?: string
          item: string
          property: string
          quantity: number
          reported_by: string
        }
        Update: {
          category?: string
          created_at?: string | null
          date?: string | null
          id?: string
          item?: string
          property?: string
          quantity?: number
          reported_by?: string
        }
        Relationships: []
      }
      maintenance_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          location: string | null
          priority: string
          property_id: string
          required_tools: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          location?: string | null
          priority?: string
          property_id: string
          required_tools?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          location?: string | null
          priority?: string
          property_id?: string
          required_tools?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      occupancy_reports: {
        Row: {
          average_stay: number | null
          bookings: number
          created_at: string | null
          id: string
          month: string
          occupancy_rate: number
          property: string
          revenue: number
          updated_at: string | null
        }
        Insert: {
          average_stay?: number | null
          bookings: number
          created_at?: string | null
          id?: string
          month: string
          occupancy_rate: number
          property: string
          revenue: number
          updated_at?: string | null
        }
        Update: {
          average_stay?: number | null
          bookings?: number
          created_at?: string | null
          id?: string
          month?: string
          occupancy_rate?: number
          property?: string
          revenue?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          order_id: string
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          order_id: string
          quantity: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          order_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string
          id: string
          status: string
          total_price: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by: string
          id?: string
          status?: string
          total_price?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string
          id?: string
          status?: string
          total_price?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          custom_permissions: Json | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          secondary_roles: string[] | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          custom_permissions?: Json | null
          email: string
          id: string
          name: string
          phone?: string | null
          role: string
          secondary_roles?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          custom_permissions?: Json | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          secondary_roles?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          max_guests: number
          name: string
          num_bathrooms: number
          num_bedrooms: number
          price_per_night: number
          status: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          max_guests: number
          name: string
          num_bathrooms: number
          num_bedrooms: number
          price_per_night: number
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          max_guests?: number
          name?: string
          num_bathrooms?: number
          num_bedrooms?: number
          price_per_night?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          created_by: string
          date_range: Json | null
          filters: Json | null
          frequency: string | null
          id: string
          last_run: string | null
          name: string
          next_scheduled: string | null
          recipients: string[] | null
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          date_range?: Json | null
          filters?: Json | null
          frequency?: string | null
          id?: string
          last_run?: string | null
          name: string
          next_scheduled?: string | null
          recipients?: string[] | null
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date_range?: Json | null
          filters?: Json | null
          frequency?: string | null
          id?: string
          last_run?: string | null
          name?: string
          next_scheduled?: string | null
          recipients?: string[] | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          id: string
          settings: Json
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          settings: Json
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          categories: string[] | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      damage_report_status:
        | "pending"
        | "investigating"
        | "resolved"
        | "compensation_required"
        | "compensation_paid"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      damage_report_status: [
        "pending",
        "investigating",
        "resolved",
        "compensation_required",
        "compensation_paid",
        "closed",
      ],
    },
  },
} as const
