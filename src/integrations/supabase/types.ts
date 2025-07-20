export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      cleaning_service_definitions: {
        Row: {
          checklist: Json | null
          created_at: string | null
          description: string
          estimated_duration: number | null
          id: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          checklist?: Json | null
          created_at?: string | null
          description: string
          estimated_duration?: number | null
          id?: string
          task_type: string
          updated_at?: string | null
        }
        Update: {
          checklist?: Json | null
          created_at?: string | null
          description?: string
          estimated_duration?: number | null
          id?: string
          task_type?: string
          updated_at?: string | null
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
          amount_paid: number | null
          booking_id: string | null
          category: string
          channel_fee: number | null
          check_in: string | null
          check_out: string | null
          created_at: string | null
          currency: string | null
          expenses: number
          id: string
          listing_id: string | null
          margin: string
          month: string
          profit: number
          property: string
          revenue: number
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          booking_id?: string | null
          category?: string
          channel_fee?: number | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          currency?: string | null
          expenses: number
          id?: string
          listing_id?: string | null
          margin: string
          month: string
          profit: number
          property: string
          revenue: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          booking_id?: string | null
          category?: string
          channel_fee?: number | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          currency?: string | null
          expenses?: number
          id?: string
          listing_id?: string | null
          margin?: string
          month?: string
          profit?: number
          property?: string
          revenue?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_reports_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "guesty_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      guesty_api_usage: {
        Row: {
          endpoint: string
          id: string
          rate_limit: number
          remaining: number
          reset: string
          timestamp: string
        }
        Insert: {
          endpoint: string
          id?: string
          rate_limit: number
          remaining: number
          reset: string
          timestamp?: string
        }
        Update: {
          endpoint?: string
          id?: string
          rate_limit?: number
          remaining?: number
          reset?: string
          timestamp?: string
        }
        Relationships: []
      }
      guesty_bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string | null
          guest_email: string | null
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
          guest_email?: string | null
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
          guest_email?: string | null
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
          first_synced_at: string | null
          highres_url: string | null
          id: string
          is_deleted: boolean | null
          last_synced: string | null
          property_type: string | null
          raw_data: Json | null
          status: string | null
          sync_status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          first_synced_at?: string | null
          highres_url?: string | null
          id: string
          is_deleted?: boolean | null
          last_synced?: string | null
          property_type?: string | null
          raw_data?: Json | null
          status?: string | null
          sync_status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          first_synced_at?: string | null
          highres_url?: string | null
          id?: string
          is_deleted?: boolean | null
          last_synced?: string | null
          property_type?: string | null
          raw_data?: Json | null
          status?: string | null
          sync_status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          assigned_to: string | null
          booking_id: string
          created_at: string
          due_date: string
          id: string
          listing_id: string
          status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id: string
          created_at?: string
          due_date: string
          id?: string
          listing_id: string
          status?: string
          task_type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string
          created_at?: string
          due_date?: string
          id?: string
          listing_id?: string
          status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "guesty_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "guesty_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_health: {
        Row: {
          endpoint_stats: Json | null
          is_rate_limited: boolean | null
          last_bookings_synced: string | null
          last_error: string | null
          last_successful_endpoint: string | null
          last_synced: string | null
          provider: string
          rate_limit_reset: string | null
          remaining_requests: number | null
          request_count: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          endpoint_stats?: Json | null
          is_rate_limited?: boolean | null
          last_bookings_synced?: string | null
          last_error?: string | null
          last_successful_endpoint?: string | null
          last_synced?: string | null
          provider: string
          rate_limit_reset?: string | null
          remaining_requests?: number | null
          request_count?: number | null
          status: string
          updated_at?: string | null
        }
        Update: {
          endpoint_stats?: Json | null
          is_rate_limited?: boolean | null
          last_bookings_synced?: string | null
          last_error?: string | null
          last_successful_endpoint?: string | null
          last_synced?: string | null
          provider?: string
          rate_limit_reset?: string | null
          remaining_requests?: number | null
          request_count?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_tokens: {
        Row: {
          access_token: string
          expires_at: string
          provider: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          expires_at: string
          provider: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          expires_at?: string
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
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
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
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
      query_performance_log: {
        Row: {
          created_at: string | null
          execution_time_ms: number
          id: string
          metadata: Json | null
          query_type: string
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          execution_time_ms: number
          id?: string
          metadata?: Json | null
          query_type: string
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          execution_time_ms?: number
          id?: string
          metadata?: Json | null
          query_type?: string
          table_name?: string | null
          user_id?: string | null
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
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
          tenant_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          bookings_created: number | null
          bookings_deleted: number | null
          bookings_updated: number | null
          created_at: string | null
          end_time: string | null
          entities_synced: number | null
          error_message: string | null
          id: string
          items_count: number | null
          listings_created: number | null
          listings_deleted: number | null
          listings_updated: number | null
          message: string | null
          next_retry_time: string | null
          provider: string
          retry_count: number | null
          start_time: string | null
          status: string | null
          sync_duration: number | null
          sync_duration_ms: number | null
          sync_type: string | null
          webhook_data: Json | null
          webhook_event_type: string | null
        }
        Insert: {
          bookings_created?: number | null
          bookings_deleted?: number | null
          bookings_updated?: number | null
          created_at?: string | null
          end_time?: string | null
          entities_synced?: number | null
          error_message?: string | null
          id?: string
          items_count?: number | null
          listings_created?: number | null
          listings_deleted?: number | null
          listings_updated?: number | null
          message?: string | null
          next_retry_time?: string | null
          provider: string
          retry_count?: number | null
          start_time?: string | null
          status?: string | null
          sync_duration?: number | null
          sync_duration_ms?: number | null
          sync_type?: string | null
          webhook_data?: Json | null
          webhook_event_type?: string | null
        }
        Update: {
          bookings_created?: number | null
          bookings_deleted?: number | null
          bookings_updated?: number | null
          created_at?: string | null
          end_time?: string | null
          entities_synced?: number | null
          error_message?: string | null
          id?: string
          items_count?: number | null
          listings_created?: number | null
          listings_deleted?: number | null
          listings_updated?: number | null
          message?: string | null
          next_retry_time?: string | null
          provider?: string
          retry_count?: number | null
          start_time?: string | null
          status?: string | null
          sync_duration?: number | null
          sync_duration_ms?: number | null
          sync_type?: string | null
          webhook_data?: Json | null
          webhook_event_type?: string | null
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
      task_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          task_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          task_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          task_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          assigned_role: string
          checklist: Json | null
          created_at: string
          created_by: string
          description: string | null
          estimated_duration: number | null
          id: string
          is_active: boolean
          name: string
          priority: Database["public"]["Enums"]["task_priority"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_role: string
          checklist?: Json | null
          created_at?: string
          created_by: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean
          name: string
          priority?: Database["public"]["Enums"]["task_priority"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_role?: string
          checklist?: Json | null
          created_at?: string
          created_by?: string
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean
          name?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_role: string | null
          assigned_to: string | null
          booking_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["task_priority"]
          property_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_role?: string | null
          assigned_to?: string | null
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"]
          property_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_role?: string | null
          assigned_to?: string | null
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"]
          property_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_branding: {
        Row: {
          accent_color: string | null
          background_color: string | null
          brand_name: string
          created_at: string
          custom_css: string | null
          custom_properties: Json | null
          favicon_url: string | null
          font_family: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          tenant_id: string
          text_color: string | null
          theme_mode: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          brand_name: string
          created_at?: string
          custom_css?: string | null
          custom_properties?: Json | null
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          tenant_id: string
          text_color?: string | null
          theme_mode?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          brand_name?: string
          created_at?: string
          custom_css?: string | null
          custom_properties?: Json | null
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          tenant_id?: string
          text_color?: string | null
          theme_mode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
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
      webhook_health: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          last_received: string | null
          last_successful: string | null
          provider: string
          reconnect_attempts: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_received?: string | null
          last_successful?: string | null
          provider: string
          reconnect_attempts?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_received?: string | null
          last_successful?: string | null
          provider?: string
          reconnect_attempts?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      integration_health_summary: {
        Row: {
          health_status: string | null
          is_rate_limited: boolean | null
          last_synced: string | null
          provider: string | null
          remaining_requests: number | null
          request_count: number | null
          status: string | null
        }
        Insert: {
          health_status?: never
          is_rate_limited?: boolean | null
          last_synced?: string | null
          provider?: string | null
          remaining_requests?: number | null
          request_count?: number | null
          status?: string | null
        }
        Update: {
          health_status?: never
          is_rate_limited?: boolean | null
          last_synced?: string | null
          provider?: string | null
          remaining_requests?: number | null
          request_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
      performance_summary: {
        Row: {
          avg_execution_time: number | null
          hour: string | null
          max_execution_time: number | null
          p95_execution_time: number | null
          query_count: number | null
          query_type: string | null
          table_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_housekeeping_tasks_for_booking: {
        Args: {
          booking_record: Database["public"]["Tables"]["guesty_bookings"]["Row"]
        }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_system_health: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      refresh_performance_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_demo_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scheduled_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      damage_report_status:
        | "pending"
        | "investigating"
        | "resolved"
        | "compensation_required"
        | "compensation_paid"
        | "closed"
      housekeeping_task_status: "pending" | "in-progress" | "done"
      housekeeping_task_type:
        | "Standard Cleaning"
        | "Full Cleaning"
        | "Linen & Towel Change"
        | "Custom Cleaning Schedule"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "open" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      housekeeping_task_status: ["pending", "in-progress", "done"],
      housekeeping_task_type: [
        "Standard Cleaning",
        "Full Cleaning",
        "Linen & Towel Change",
        "Custom Cleaning Schedule",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["open", "in_progress", "completed", "cancelled"],
    },
  },
} as const
