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
  friend_id: string;
  user_id: string;
};
