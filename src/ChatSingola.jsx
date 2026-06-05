import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './supabase';

function ChatSingola({ conversazione, utente, setVistaCorrente, apriProfiloUtente, listaScarpe, setScarpaSelezionata }) {
  const [messaggi, setMessaggi] = useState([]);
  const [testoMessaggio, setTestoMessaggio] = useState('');
  const [isHovered, setIsHovered] = useState(false); // Stato per hover sul nome utente
  const [isBackHovered, setIsBackHovered] = useState(false); // Stato per hover sul tasto indietro
  const [isSendHovered, setIsSendHovered] = useState(false); // Stato per hover sul tasto invia
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
  const targetUserId = conversazione?.user1_id === utente?.id ? conversazione?.user2_id : conversazione?.user1_id;
  const targetEmail = conversazione?.targetEmail || '';

  const gestisciClickNome = () => {
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
    <div style={{ 
      height: 'calc(100vh - 80px)', 
      display: 'flex', 
      flexDirection: 'column', 
      maxWidth: '900px', 
      width: '100%', 
      margin: '0 auto', 
      padding: '20px', 
      borderRadius: '15px', 
      backgroundColor: '#ffffff', 
      color: '#111111', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
      fontFamily: 'sans-serif', 
      overflow: 'hidden' 
    }}>
      
      {/* HEADER DELLA CHAT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setVistaCorrente('attivita')}
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
          style={{
            padding: '8px 16px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: isBackHovered ? '#e4e6eb' : '#f0f2f5',
            color: '#111111',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s ease'
          }}
        >
          ← Indietro
        </button>
        
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
              cursor: 'pointer',
              textDecoration: isHovered ? 'underline' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            @{otherUserName}
          </h2>
        </div>
        <div style={{ width: '80px' }} />
      </div>

      {/* AREA MESSAGGI */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        flex: 1, 
        padding: '20px', 
        backgroundColor: '#f0f2f5', 
        borderRadius: '15px', 
        overflowY: 'auto' 
      }}>
        {messaggi.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#777777', padding: '40px 20px' }}>
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

            // Renderizzazione Card Scarpa Condivisa
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
                    width: '240px',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    border: '1px solid #e6e8eb',
                    color: '#111111',
                    padding: '12px'
                  }}>
                    <div style={{ 
                      width: '100%', 
                      maxHeight: '140px', 
                      height: '140px', 
                      backgroundColor: '#f0f2f5', 
                      borderRadius: '10px',
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      overflow: 'hidden' 
                    }}>
                      {scarpaCondivisa.immagine ? (
                        <img src={scarpaCondivisa.immagine} alt={scarpaCondivisa.modello} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ color: '#6c757d', fontSize: '32px' }}>👟</div>
                      )}
                    </div>
                    <div style={{ padding: '8px 0 0 0' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0 2px 0', color: '#111111' }}>{scarpaCondivisa.modello}</div>
                      <div style={{ fontSize: '12px', color: '#666666', lineHeight: '1.3' }}>{scarpaCondivisa.brand} · {scarpaCondivisa.genere || 'Unisex'}</div>
                      <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 'bold', color: '#007BFF' }}>€{scarpaCondivisa.prezzo || 'N/D'}</div>
                    </div>
                  </div>
                </button>
              );
            }

            // Renderizzazione Messaggio di Testo Standard
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  backgroundColor: isMine ? '#007BFF' : '#ffffff',
                  color: isMine ? '#ffffff' : '#111111',
                  borderRadius: '18px',
                  padding: '12px 16px',
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

      {/* FORM DI INVIO MESSAGGIO */}
      <form onSubmit={inviaMessaggio} style={{ display: 'flex', gap: '10px', marginTop: '20px', alignItems: 'center', flexShrink: 0 }}>
        <input
          value={testoMessaggio}
          onChange={(e) => setTestoMessaggio(e.target.value)}
          placeholder="Scrivi un messaggio..."
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '25px',
            border: '1px solid #e6e8eb',
            outline: 'none',
            fontSize: '15px',
            color: '#111111',
            backgroundColor: '#ffffff',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
          }}
        />
        <button
          type="submit"
          onMouseEnter={() => setIsSendHovered(true)}
          onMouseLeave={() => setIsSendHovered(false)}
          style={{
            padding: '14px 24px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: isSendHovered ? '#0056b3' : '#007BFF',
            color: '#ffffff',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0,123,255,0.2)'
          }}
        >
          Invia
        </button>
      </form>
    </div>
  );
}

export default ChatSingola;