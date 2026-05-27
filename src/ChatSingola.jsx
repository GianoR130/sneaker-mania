import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabase';

// 1. Abbiamo aggiunto 'apriProfiloUtente' tra le props ricevute
function ChatSingola({ conversazione, utente, setVistaCorrente, apriProfiloUtente, listaScarpe, setScarpaSelezionata }) {
  const [messaggi, setMessaggi] = useState([]);
  const [testoMessaggio, setTestoMessaggio] = useState('');
  const [isHovered, setIsHovered] = useState(false); // Stato locale per l'effetto hover sul nome
  const fineMessaggiRef = useRef(null);
  const primoScrollRef = useRef(true);

  useEffect(() => {
    if (!conversazione?.id) {
      setMessaggi([]);
      return;
    }

    const caricaStorico = async () => {
      const { data, error } = await supabase
        .from('messaggi')
        .select('*')
        .eq('conversazione_id', conversazione.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessaggi(data);
      }
    };

    caricaStorico();

    const channel = supabase
      .channel(`chat-${conversazione.id}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messaggi',
          filter: `conversazione_id=eq.${conversazione.id}`
        },
        (payload) => {
          setMessaggi((prev) => {
            const messaggioGiaPresente = prev.some(msg => msg.id === payload.new.id);
            if (messaggioGiaPresente) {
              return prev;
            }
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversazione?.id]);

  const inviaMessaggio = async (e) => {
    e.preventDefault();
    if (!testoMessaggio.trim() || !conversazione?.id || !utente?.id) return;

    const testoDaInviare = testoMessaggio.trim();
    setTestoMessaggio('');

    const { data, error } = await supabase.from('messaggi').insert([
      {
        conversazione_id: conversazione.id,
        mittente_id: utente.id,
        testo: testoDaInviare
      }
    ]).select(); 

    if (error) {
      console.error("Errore nell'invio del messaggio:", error);
      setTestoMessaggio(testoDaInviare);
      return;
    }

    if (data && data.length > 0) {
      setMessaggi((prevMessaggi) => {
        if (prevMessaggi.some(msg => msg.id === data[0].id)) {
           return prevMessaggi;
        }
        return [...prevMessaggi, data[0]];
      });
    }
  };

  const otherUserName = conversazione?.targetUsername || 'Utente';
  
  // Recuperiamo l'ID dell'altro utente all'interno della conversazione
  const targetUserId = conversazione?.user1_id === utente?.id ? conversazione?.user2_id : conversazione?.user1_id;
  const targetEmail = conversazione?.targetEmail || '';

  const gestisciClickNome = () => {
    // Se la prop è stata passata correttamente e abbiamo l'ID dell'altro utente, reindirizziamo
    if (apriProfiloUtente && targetUserId) {
      apriProfiloUtente(targetUserId, otherUserName, targetEmail);
    }
  };

  useEffect(() => {
    if (!messaggi || messaggi.length === 0) return;
    fineMessaggiRef.current?.scrollIntoView({ behavior: primoScrollRef.current ? 'auto' : 'smooth' });
    if (primoScrollRef.current) primoScrollRef.current = false;
  }, [messaggi]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', maxWidth: '900px', width: '100%', margin: '0 auto', padding: '20px', borderRadius: '12px', backgroundColor: '#ffffff', color: '#111111', boxShadow: '0 2px 15px rgba(0,0,0,0.08)', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setVistaCorrente('attivita')}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#f0f2f5',
            color: '#111111',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Indietro
        </button>
        
        {/* Intestazione centrale col nome utente cliccabile */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#777777' }}>Chat con</p>
          <h2 
            onClick={gestisciClickNome}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
              margin: '5px 0 0 0', 
              fontSize: '22px', 
              color: '#111111',
              cursor: 'pointer', // Rende evidente che è un link
              textDecoration: isHovered ? 'underline' : 'none', // Sottolinea al passaggio del mouse
              transition: 'all 0.2s ease'
            }}
          >
            @{otherUserName}
          </h2>
        </div>
        <div style={{ width: '80px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, padding: '20px', backgroundColor: '#f0f2f5', borderRadius: '18px', overflowY: 'auto' }}>
        {messaggi.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999999', padding: '40px 20px' }}>
            <p style={{ margin: 0, fontSize: '16px' }}>Inizia la conversazione qui.</p>
          </div>
        ) : (
          messaggi.map((msg) => {
            const isMine = msg.mittente_id === utente?.id;
            const isShare = msg.testo?.startsWith('[CONDIVIDI_SCARPA:');
            const scarpaIdMatch = isShare ? msg.testo.match(/\[CONDIVIDI_SCARPA:(\d+)\]/) : null;
            const scarpaId = scarpaIdMatch ? Number(scarpaIdMatch[1]) : null;
            const scarpaCondivisa = scarpaId != null
              ? listaScarpe?.find((scarpa) => Number(scarpa.id) === scarpaId || scarpa.id === scarpaId)
              : null;

            if (isShare && scarpaCondivisa) {
              return (
                <button
                  key={msg.id}
                  onClick={() => {
                    setVistaCorrente('catalogo');
                    if (setScarpaSelezionata) setScarpaSelezionata(scarpaCondivisa.id);
                  }}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    width: '220px',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <div style={{
                    borderRadius: '18px',
                    overflow: 'hidden',
                    backgroundColor: '#f8f9fa',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                    border: '1px solid #e6e8eb',
                    color: '#111111',
                    padding: '10px'
                  }}>
                    <div style={{ width: '100%', maxHeight: '140px', height: '140px', backgroundColor: '#e9ecef', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      {scarpaCondivisa.immagine ? (
                        <img src={scarpaCondivisa.immagine} alt={scarpaCondivisa.modello} style={{ width: '100%', height: '280px', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d', fontSize: '28px' }}>👟</div>
                      )}
                    </div>
                    <div style={{ padding: '8px 0 0 0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '6px 0 2px 0', color: '#111111' }}>{scarpaCondivisa.modello}</div>
                      <div style={{ fontSize: '12px', color: '#555555', lineHeight: '1.3' }}>{scarpaCondivisa.brand} · {scarpaCondivisa.genere || 'Unisex'}</div>
                      <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold', color: '#007BFF' }}>€{scarpaCondivisa.prezzo || 'N/D'}</div>
                    </div>
                  </div>
                </button>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: isMine ? '#007BFF' : '#ffffff',
                  color: isMine ? '#ffffff' : '#111111',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: isMine ? 'none' : '1px solid #e6e8eb'
                }}
              >
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5', wordBreak: 'break-word' }}>{msg.testo}</p>
              </div>
            );
          })
        )}
        <div ref={fineMessaggiRef} />
      </div>

      <form onSubmit={inviaMessaggio} style={{ display: 'flex', gap: '10px', marginTop: '20px', alignItems: 'center', flexShrink: 0 }}>
        <input
          value={testoMessaggio}
          onChange={(e) => setTestoMessaggio(e.target.value)}
          placeholder="Scrivi un messaggio..."
          style={{
            flex: 1,
            padding: '14px 16px',
            borderRadius: '18px',
            border: '1px solid #e6e8eb',
            outline: 'none',
            fontSize: '15px',
            color: '#111111',
            backgroundColor: '#ffffff'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '14px 20px',
            borderRadius: '18px',
            border: 'none',
            backgroundColor: '#007BFF',
            color: '#ffffff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Invia
        </button>
      </form>
    </div>
  );
}

export default ChatSingola;