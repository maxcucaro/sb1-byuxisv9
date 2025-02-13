import { supabase } from './utils/supabaseClient.js';

// Recupera la prima richiesta di registrazione
const { data: requests, error: requestError } = await supabase
  .from('registration_requests')
  .select('*')
  .eq('stato', 'PENDING')
  .limit(1);

if (requestError) {
  console.error('Errore recupero richieste:', requestError);
  process.exit(1);
}

if (!requests?.length) {
  console.error('Nessuna richiesta di registrazione trovata');
  process.exit(1);
}

// Password temporanea per il primo accesso
const tempPassword = 'EventTrack2024!';

try {
  // Approva la richiesta
  const { error: approveError } = await supabase
    .rpc('approve_registration', {
      p_request_id: requests[0].id,
      p_temp_password: tempPassword  
    });

  if (approveError) throw approveError;

  console.log('Richiesta approvata con successo!');
  console.log('Email:', requests[0].email);
  console.log('Password temporanea:', tempPassword);
  console.log('\nUtilizza queste credenziali per effettuare il primo accesso.');
  console.log('Al primo accesso verrà richiesto di cambiare la password.');

} catch (error) {
  console.error('Errore durante l\'approvazione:', error);
  process.exit(1);
}