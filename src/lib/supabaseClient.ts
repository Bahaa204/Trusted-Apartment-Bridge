import { createClient } from "@supabase/supabase-js";
const PROJECT_URL: string = import.meta.env.VITE_PROJECT_URL;
const DATABASE_KEY: string = import.meta.env.VITE_DATABASE_KEY;
console.log("URL:", import.meta.env)
export const supabaseClient = createClient(PROJECT_URL, DATABASE_KEY);

