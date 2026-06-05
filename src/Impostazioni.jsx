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
    <div style={{ 
      ...containerStyle, 
      minHeight: '65vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      padding: '24px',
      border: '1px solid rgba(0,0,0,0.02)'
    }}>
      
      {/* Header della Scheda */}
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderBottom: '1px solid #f1f5f9', 
        paddingBottom: '20px',
        marginBottom: '20px'
      }}>
        
        {/* Pulsante Indietro minimalista a pillola agganciato a sinistra */}
        <button
          onClick={() => setVistaCorrente('profilo')}
          style={{
            position: 'absolute',
            left: '0', 
            padding: '8px 16px',
            background: '#ffffff',
            border: '1px solid #e6e8eb',
            borderRadius: '20px',
            cursor: 'pointer',
            color: '#111111',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#111111';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#e6e8eb';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Profilo
        </button>
        
        <h1 style={{ margin: 0, fontSize: '20px', color: '#111111', textAlign: 'center', fontWeight: 'bold', letterSpacing: '-0.3px' }}>
          Impostazioni Account
        </h1>

      </div>

      {/* Contenuto principale centrato all'interno della grande scheda */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: '40px', 
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        
        <div style={{ marginBottom: '24px', maxWidth: '360px' }}>
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>🔒</span>
          <h2 style={{ fontSize: '16px', color: '#111111', margin: '0 0 8px 0', fontWeight: '600' }}>Zona di Sicurezza</h2>
          <p style={{ fontSize: '14px', color: '#666666', margin: 0, lineHeight: '1.4' }}>
            L'eliminazione dell'account rimuoverà in modo permanente tutti i tuoi dati, post, preferiti e interazioni all'interno dell'applicazione.
          </p>
        </div>

        {/* Pulsante Distruttivo Premium a Pillola */}
        <button
          onClick={gestisciEliminazione}
          disabled={inCaricamento}
          style={{
            padding: '14px 32px',
            backgroundColor: inCaricamento ? '#e6e8eb' : '#dc3545',
            color: inCaricamento ? '#aaaaaa' : '#ffffff',
            border: 'none',
            borderRadius: '25px',
            fontWeight: '600',
            cursor: inCaricamento ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            transition: 'all 0.2s ease',
            boxShadow: inCaricamento ? 'none' : '0 4px 12px rgba(220, 53, 69, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!inCaricamento) {
              e.currentTarget.style.backgroundColor = '#c82333';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (!inCaricamento) {
              e.currentTarget.style.backgroundColor = '#dc3545';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {inCaricamento ? "Eliminazione in corso..." : "Elimina definitivamente l'account"}
        </button>
      </div>
        
    </div>
  );
}

export default Impostazioni;