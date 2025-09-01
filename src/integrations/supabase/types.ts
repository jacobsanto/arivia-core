export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          created_at: string
          error_name: string | null
          error_stack: string | null
          id: string
          level: string
          message: string
          metadata: Json | null
          route: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_name?: string | null
          error_stack?: string | null
          id?: string
          level: string
          message: string
          metadata?: Json | null
          route?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_name?: string | null
          error_stack?: string | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          route?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channels: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          topic: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          topic?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          topic?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachments: Json | null
          author_id: string
          channel_id: string | null
          content: string
          conversation_id: string | null
          created_at: string | null
          edited_at: string | null
          id: string
          mentions: string[] | null
          reply_to_id: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          channel_id?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          mentions?: string[] | null
          reply_to_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          channel_id?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          edited_at?: string | null
          id?: string
          mentions?: string[] | null
          reply_to_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
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
      cleaning_actions: {
        Row: {
          action_name: string
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          estimated_duration: number
          id: string
          is_active: boolean
          updated_at: string | null
        }
        Insert: {
          action_name: string
          category?: string
          created_at?: string | null
          description?: string | null
          display_name: string
          estimated_duration?: number
          id?: string
          is_active?: boolean
          updated_at?: string | null
        }
        Update: {
          action_name?: string
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          estimated_duration?: number
          id?: string
          is_active?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      cleaning_rules: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          property_id: string | null
          task_type: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          property_id?: string | null
          task_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          property_id?: string | null
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "cleaning_rules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaning_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_global: boolean
          name: string
          template_data: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_global?: boolean
          name: string
          template_data?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_global?: boolean
          name?: string
          template_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      configuration_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          config_id: string | null
          id: string
          listing_id: string
          template_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          config_id?: string | null
          id?: string
          listing_id: string
          template_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          config_id?: string | null
          id?: string
          listing_id?: string
          template_id?: string | null
        }
        Relationships: []
      }
      damage_reports: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          id: string
          location: string | null
          photos: string[] | null
          property_id: string | null
          repair_notes: string | null
          reported_by: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          photos?: string[] | null
          property_id?: string | null
          repair_notes?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          photos?: string[] | null
          property_id?: string | null
          repair_notes?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      direct_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guesty_listings: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          calendar_last_synced: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          listing_url: string | null
          max_guests: number | null
          property_type: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          calendar_last_synced?: string | null
          created_at?: string
          description?: string | null
          id: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          listing_url?: string | null
          max_guests?: number | null
          property_type?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          calendar_last_synced?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          listing_url?: string | null
          max_guests?: number | null
          property_type?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      housekeeping_checklist_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_duration: number | null
          id: string
          is_active: boolean | null
          items: Json
          name: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          items?: Json
          name: string
          task_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          is_active?: boolean | null
          items?: Json
          name?: string
          task_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          additional_actions: Json | null
          assigned_to: string | null
          booking_id: string | null
          checklist: Json | null
          completed_at: string | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          guest_checkin: string | null
          guest_checkout: string | null
          guest_name: string | null
          id: string
          is_blocked: boolean | null
          listing_id: string | null
          photos: string[] | null
          priority: string | null
          property_id: string | null
          qc_notes: string | null
          qc_reviewed_at: string | null
          qc_reviewed_by: string | null
          qc_status: string | null
          room_number: string | null
          status: string
          tags: string[] | null
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          additional_actions?: Json | null
          assigned_to?: string | null
          booking_id?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          guest_checkin?: string | null
          guest_checkout?: string | null
          guest_name?: string | null
          id?: string
          is_blocked?: boolean | null
          listing_id?: string | null
          photos?: string[] | null
          priority?: string | null
          property_id?: string | null
          qc_notes?: string | null
          qc_reviewed_at?: string | null
          qc_reviewed_by?: string | null
          qc_status?: string | null
          room_number?: string | null
          status?: string
          tags?: string[] | null
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          additional_actions?: Json | null
          assigned_to?: string | null
          booking_id?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          guest_checkin?: string | null
          guest_checkout?: string | null
          guest_name?: string | null
          id?: string
          is_blocked?: boolean | null
          listing_id?: string | null
          photos?: string[] | null
          priority?: string | null
          property_id?: string | null
          qc_notes?: string | null
          qc_reviewed_at?: string | null
          qc_reviewed_by?: string | null
          qc_status?: string | null
          room_number?: string | null
          status?: string
          tags?: string[] | null
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          location: string | null
          min_quantity: number | null
          name: string
          notes: string | null
          quantity: number | null
          sku: string | null
          target_quantity: number | null
          unit: string | null
          unit_cost: number | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          min_quantity?: number | null
          name: string
          notes?: string | null
          quantity?: number | null
          sku?: string | null
          target_quantity?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          min_quantity?: number | null
          name?: string
          notes?: string | null
          quantity?: number | null
          sku?: string | null
          target_quantity?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
          vendor?: string | null
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
      inventory_usage: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          notes: string | null
          property_id: string | null
          quantity_used: number
          reported_by: string | null
          task_id: string | null
          usage_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          property_id?: string | null
          quantity_used: number
          reported_by?: string | null
          task_id?: string | null
          usage_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          property_id?: string | null
          quantity_used?: number
          reported_by?: string | null
          task_id?: string | null
          usage_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_usage_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_usage_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_usage_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "inventory_usage_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tasks: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          id: string
          notes: string | null
          priority: string
          property_id: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          priority?: string
          property_id?: string | null
          status?: string
          task_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          priority?: string
          property_id?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          order_id: string | null
          quantity: number
          total_price: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          order_id?: string | null
          quantity: number
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          order_id?: string | null
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
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
          admin_approved_at: string | null
          admin_approved_by: string | null
          created_at: string | null
          department: string | null
          id: string
          manager_approved_at: string | null
          manager_approved_by: string | null
          notes: string | null
          order_date: string
          priority: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          requestor: string | null
          sent_at: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          created_at?: string | null
          department?: string | null
          id: string
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          notes?: string | null
          order_date: string
          priority?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requestor?: string | null
          sent_at?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          manager_approved_at?: string | null
          manager_approved_by?: string | null
          notes?: string | null
          order_date?: string
          priority?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requestor?: string | null
          sent_at?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_admin_approved_by_fkey"
            columns: ["admin_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_manager_approved_by_fkey"
            columns: ["manager_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_rejected_by_fkey"
            columns: ["rejected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_requestor_fkey"
            columns: ["requestor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
          created_at: string | null
          custom_permissions: Json | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          custom_permissions?: Json | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          custom_permissions?: Json | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          num_bathrooms: number | null
          num_bedrooms: number | null
          property_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          num_bathrooms?: number | null
          num_bedrooms?: number | null
          property_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          num_bathrooms?: number | null
          num_bedrooms?: number | null
          property_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      property_cleaning_configs: {
        Row: {
          config_name: string
          created_at: string | null
          id: string
          is_active: boolean
          listing_id: string
          updated_at: string | null
        }
        Insert: {
          config_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          listing_id: string
          updated_at?: string | null
        }
        Update: {
          config_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          listing_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          granted: boolean
          id: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          granted?: boolean
          id?: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          id?: string
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      room_status_log: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          property_id: string
          room_number: string | null
          task_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          property_id: string
          room_number?: string | null
          task_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          property_id?: string
          room_number?: string | null
          task_id?: string | null
        }
        Relationships: []
      }
      rule_actions: {
        Row: {
          action_data: Json
          action_order: number
          action_type: string
          created_at: string | null
          id: string
          is_active: boolean
          rule_id: string
        }
        Insert: {
          action_data?: Json
          action_order?: number
          action_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          rule_id: string
        }
        Update: {
          action_data?: Json
          action_order?: number
          action_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          rule_id?: string
        }
        Relationships: []
      }
      rule_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean
          property_id: string
          rule_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          property_id: string
          rule_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean
          property_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_rule_assignments_cleaning_rules"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "cleaning_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_conditions: {
        Row: {
          condition_order: number
          condition_type: string
          created_at: string | null
          id: string
          logical_operator: string | null
          operator: string
          rule_id: string
          value: Json
        }
        Insert: {
          condition_order?: number
          condition_type: string
          created_at?: string | null
          id?: string
          logical_operator?: string | null
          operator: string
          rule_id: string
          value?: Json
        }
        Update: {
          condition_order?: number
          condition_type?: string
          created_at?: string | null
          id?: string
          logical_operator?: string | null
          operator?: string
          rule_id?: string
          value?: Json
        }
        Relationships: []
      }
      rule_test_results: {
        Row: {
          created_at: string | null
          id: string
          rule_id: string
          test_booking_data: Json
          test_result: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          rule_id: string
          test_booking_data: Json
          test_result: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          rule_id?: string
          test_booking_data?: Json
          test_result?: Json
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          permission_key: string
          permission_name: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          permission_key: string
          permission_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          permission_key?: string
          permission_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          task_id: string
          task_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          task_id: string
          task_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          task_id?: string
          task_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          checklist_items: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          id: string
          notes: string | null
          priority: string | null
          property_id: string | null
          room_number: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          checklist_items?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          room_number?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          checklist_items?: Json | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          priority?: string | null
          property_id?: string | null
          room_number?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          channel_id: string | null
          conversation_id: string | null
          expires_at: string | null
          id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          conversation_id?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
          conversation_id?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          categories: string[] | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_or_create_direct_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_security_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_users_count: number
          critical_events_count: number
          failed_login_attempts: number
          recent_security_events: Json
          unresolved_events_count: number
        }[]
      }
      get_system_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          authentication: Json
          database: Json
          integrations: Json
          performance: Json
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_security_event: {
        Args: { details?: Json; event_type: string; severity: string }
        Returns: string
      }
      update_room_status: {
        Args: {
          p_new_status: string
          p_notes?: string
          p_property_id: string
          p_room_number: string
          p_task_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "administrator"
        | "property_manager"
        | "housekeeping_staff"
        | "maintenance_staff"
        | "guest"
      notification_type:
        | "task_assigned"
        | "task_completed"
        | "damage_report"
        | "low_stock"
        | "chat_mention"
        | "order_status"
        | "maintenance_request"
        | "system_alert"
        | "integration_status"
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
      app_role: [
        "superadmin",
        "administrator",
        "property_manager",
        "housekeeping_staff",
        "maintenance_staff",
        "guest",
      ],
      notification_type: [
        "task_assigned",
        "task_completed",
        "damage_report",
        "low_stock",
        "chat_mention",
        "order_status",
        "maintenance_request",
        "system_alert",
        "integration_status",
      ],
    },
  },
} as const
