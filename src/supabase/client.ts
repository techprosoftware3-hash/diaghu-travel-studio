/**
 * Supabase Client Configuration
 * 
 * This file provides a singleton Supabase client for database operations.
 * Set your environment variables in a .env file:
 * 
 * VITE_SUPABASE_URL=your-supabase-project-url
 * VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not found in environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          full_name: string;
          phone: string | null;
          role: 'admin' | 'staff' | 'client';
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          full_name: string;
          phone?: string | null;
          role?: 'admin' | 'staff' | 'client';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          full_name?: string;
          phone?: string | null;
          role?: 'admin' | 'staff' | 'client';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
      };
      pre_consultations: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          whatsapp: string;
          destination_country: string | null;
          service_type: 'tourist_visa' | 'schengen_visa' | 'family_reunion' | 'profile_analysis' | 'other' | null;
          message: string | null;
          status: string;
          payment_proof_url: string | null;
          scheduled_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          whatsapp: string;
          destination_country?: string | null;
          service_type?: 'tourist_visa' | 'schengen_visa' | 'family_reunion' | 'profile_analysis' | 'other' | null;
          message?: string | null;
          status?: string;
          payment_proof_url?: string | null;
          scheduled_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string;
          whatsapp?: string;
          destination_country?: string | null;
          service_type?: 'tourist_visa' | 'schengen_visa' | 'family_reunion' | 'profile_analysis' | 'other' | null;
          message?: string | null;
          status?: string;
          payment_proof_url?: string | null;
          scheduled_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          contact: string;
          country: string | null;
          service_type: string;
          preferred_date: string | null;
          message: string | null;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          contact: string;
          country?: string | null;
          service_type: string;
          preferred_date?: string | null;
          message?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          contact?: string;
          country?: string | null;
          service_type?: string;
          preferred_date?: string | null;
          message?: string | null;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      destinations: {
        Row: {
          id: string;
          code: string;
          name_fr: string;
          name_es: string;
          name_ht: string;
          description_fr: string | null;
          description_es: string | null;
          description_ht: string | null;
          countries_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name_fr: string;
          name_es: string;
          name_ht: string;
          description_fr?: string | null;
          description_es?: string | null;
          description_ht?: string | null;
          countries_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name_fr?: string;
          name_es?: string;
          name_ht?: string;
          description_fr?: string | null;
          description_es?: string | null;
          description_ht?: string | null;
          countries_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          code: string;
          title_fr: string;
          title_es: string;
          title_ht: string;
          body_fr: string;
          body_es: string;
          body_ht: string;
          description_fr: string | null;
          description_es: string | null;
          description_ht: string | null;
          details_fr: string | null;
          details_es: string | null;
          details_ht: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title_fr: string;
          title_es: string;
          title_ht: string;
          body_fr: string;
          body_es: string;
          body_ht: string;
          description_fr?: string | null;
          description_es?: string | null;
          description_ht?: string | null;
          details_fr?: string | null;
          details_es?: string | null;
          details_ht?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title_fr?: string;
          title_es?: string;
          title_ht?: string;
          body_fr?: string;
          body_es?: string;
          body_ht?: string;
          description_fr?: string | null;
          description_es?: string | null;
          description_ht?: string | null;
          details_fr?: string | null;
          details_es?: string | null;
          details_ht?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
