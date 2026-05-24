import React, { useState } from 'react';
import { supabase } from './supabase';

function Impostazioni({ utente, setVistaCorrente, containerStyle }) {
  const [inCaricamento, setInCaricamento] = useState(false);

  const gestisciEliminazione = async () => {
    const conferma = window.confirm(
      "ATTENZIONE: Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione è irreversibile e tutti i tuoi post, commenti e raccolte verranno cancellati."
    );
    
    if (!conferma) return;

    const password = window.prompt("Per motivi di sicurezza, inserisci la tua password attuale per confermare l'eliminazione:");
    
    if (!password) {
      alert("Operazione annullata: password non inserita.");
      return;
    }

    setInCaricamento(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: utente.email,
        password: password,
      });

      if (authError) {
        alert("Password errata. Impossibile procedere con l'eliminazione dell'account.");
        setInCaricamento(false);
        return;
      }

      const { error: rpcError } = await supabase.rpc('elimina_proprio_account');

      if (rpcError) {
        throw rpcError;
      }

      alert("Il tuo account è stato eliminato con successo.");
      
      await supabase.auth.signOut();

    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      alert("Si è verificato un errore durante l'eliminazione dell'account: " + error.message);
    } finally {
      setInCaricamento(false);
    }
  };

  return (
    // Usiamo DIRETTAMENTE containerStyle come unica scheda bianca
    // Ho aggiunto minHeight: '60vh' per dare un po' di spazio vuoto sotto ed estendere la scheda
    <div style={{ ...containerStyle, minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header della Scheda */}
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderBottom: '1px solid #eee', 
        paddingBottom: '15px' 
      }}>
        
        {/* Pulsante Indietro agganciato a sinistra */}
        <button
          onClick={() => setVistaCorrente('profilo')}
          style={{
            position: 'absolute',
            left: '0', 
            padding: '8px 12px',
            background: '#f0f2f5',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#111111',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ← Torna al Profilo
        </button>
        
        <h1 style={{ margin: 0, fontSize: '20px', color: '#111111', textAlign: 'center' }}>
          Impostazioni Account
        </h1>

      </div>

      {/* Contenuto principale centrato all'interno della grande scheda */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '40px', marginBottom: '40px' }}>
        
        <button
          onClick={gestisciEliminazione}
          disabled={inCaricamento}
          style={{
            padding: '12px 30px',
            backgroundColor: inCaricamento ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: inCaricamento ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            transition: 'all 0.2s ease'
          }}
        >
          {inCaricamento ? "Eliminazione in corso..." : "Elimina definitivamente l'account"}
        </button>
      </div>
        
    </div>
  );
}

export default Impostazioni;