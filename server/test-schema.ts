import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
  const { data: row } = await supabaseAdmin.from('patient_reports').select('*').limit(1).single();
  console.log(Object.keys(row || {}));
}
run();
