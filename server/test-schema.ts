import { supabaseAdmin } from './src/config/supabase.js';

async function run() {
  const { data, error } = await supabaseAdmin.rpc('get_waitlist_with_position', { p_id: 'some-id' }).limit(1);
  console.log(error);
  
  // Actually let's just query one row to see all top-level keys
  const { data: row, error: e2 } = await supabaseAdmin.from('slot_waitlist').select('*').limit(1).single();
  console.log(Object.keys(row || {}));
}
run();
