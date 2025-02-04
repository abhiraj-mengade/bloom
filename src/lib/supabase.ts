import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Friend = {
  id: string;
  name: string;
  address: string;
  contact: string;
  interests: string;
  user_id: string;
};

export type Event = {
  id: string;
  name: string;
  date: string;
  user_id: string;
  friend_id: string;
  friend?: {
    name: string;
  };
};

export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  is_public: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  phone: string;
  wishlist: WishlistItem[];
  is_friend: boolean;
}
