import { supabase } from './src/supabaseClient';

async function test() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase.from('tickets').select('*');
  if (error) {
    console.error("Error reading tickets:", error.message);
  } else {
    console.log("Tickets:", data);
  }

  const { data: authData, error: authError } = await supabase.from('login_attempts').select('*');
  if (authError) {
    console.error("Error reading login_attempts:", authError.message);
  } else {
    console.log("Login attempts:", authData);
  }
}

test();
