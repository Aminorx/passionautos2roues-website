export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          vehicle_id: string | null
          type: string
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id?: string | null
          type: string
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string | null
          type?: string
          last_message_at?: string | null
          created_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: string | null
          joined_at: string
          last_read_message_id: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role?: string | null
          joined_at?: string
          last_read_message_id?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: string | null
          joined_at?: string
          last_read_message_id?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          from_user_id: string
          to_user_id: string
          vehicle_id: string | null
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          from_user_id: string
          to_user_id: string
          vehicle_id?: string | null
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          from_user_id?: string
          to_user_id?: string
          vehicle_id?: string | null
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          brand: string | null
          model: string | null
          year: number | null
          mileage: number | null
          fuel_type: string | null
          condition: string
          price: number
          location: string
          images: string[] | null
          features: string[] | null
          is_premium: boolean
          premium_type: string | null
          premium_expires_at: string | null
          created_at: string
          updated_at: string
          views: number
          favorites: number
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          brand?: string | null
          model?: string | null
          year?: number | null
          mileage?: number | null
          fuel_type?: string | null
          condition: string
          price: number
          location: string
          images?: string[] | null
          features?: string[] | null
          is_premium?: boolean
          premium_type?: string | null
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
          views?: number
          favorites?: number
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          brand?: string | null
          model?: string | null
          year?: number | null
          mileage?: number | null
          fuel_type?: string | null
          condition?: string
          price?: number
          location?: string
          images?: string[] | null
          features?: string[] | null
          is_premium?: boolean
          premium_type?: string | null
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
          views?: number
          favorites?: number
          status?: string
        }
      }
    }
  }
}