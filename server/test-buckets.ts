import { supabaseAdmin } from './src/config/supabase.js';
async function run() {
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  console.log(data?.map(b => b.name));
}
run();
