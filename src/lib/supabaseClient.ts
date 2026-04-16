import { createClient } from "@supabase/supabase-js";
const PROJECT_URL: string = "https://iiffmxgbjldpvtiamzhi.supabase.co";
const DATABASE_KEY: string = "sb_publishable_wttyycHKTunjw4P8de1W4A_FS0eGcuF";
export const supabaseClient = createClient(PROJECT_URL, DATABASE_KEY);

