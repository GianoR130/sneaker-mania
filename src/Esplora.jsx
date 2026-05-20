import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const Esplora = ({ queryIniziale, utente, alClickProfilo }) => {
  const [ricerca, setRicerca] = useState(queryIniziale || "");
  const [risultati, setRisultati] = useState([]);
  const [caricamento, setCaricamento] = useState(false);
  const [haCercato, setHaCercato] = useState(false); // <-- Nuovo stato per controllare se la ricerca è terminata

  const cercaPost = async (testo) => {
    const terminePulito = testo.trim();

    if (!terminePulito) {
      setRisultati([]);
      setHaCercato(false);
      return;
    }

    setCaricamento(true);
    setHaCercato(false); // Resetta mentre cerca

    const { data, error } = await supabase
      .from('post')
      .select(`
        *,
        profili ( email, username ),
        post_likes ( user_id ),
        post_commenti ( * )
      `)
      .or(`descrizione.ilike.%${terminePulito}%,hashtags.ilike.%${terminePulito}%`)
      .order('created_at', { ascending: false });

    if (!error) {
      setRisultati(data);
    } else {
      console.error("Errore database:", error);
    }
    
    setCaricamento(false);
    setHaCercato(true); // Imposta a true solo quando ha finito di cercare
  };

  useEffect(() => {
    if (queryIniziale) {
      setRicerca(queryIniziale);
      cercaPost(queryIniziale);
    }
  }, [queryIniziale]);

  // Funzione per cliccare un hashtag direttamente dai risultati di ricerca
  const gestisciClickHashtag = (tag) => {
    setRicerca(tag);
    cercaPost(tag);
  };

  return (
    <div style={{ paddingBottom: '80px', backgroundColor: '#f0f2f5', color: '#111111', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '0 4px', boxSizing: 'border-box' }}>
        
        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#111111', paddingTop: '20px' }}>Esplora</h1>

        {/* --- BARRA DI RICERCA AGGIORNATA --- */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', width: '100%' }}>
          <input
            type="text"
            placeholder="Cerca post o #hashtag..."
            value={ricerca}
            onChange={(e) => {
              setRicerca(e.target.value);
              setHaCercato(false); // Nasconde il messaggio "Nessun risultato" se ricominci a scrivere
            }}
            onKeyDown={(e) => e.key === 'Enter' && cercaPost(ricerca)}
            style={{
              flex: 1,
              padding: '12px 15px',
              borderRadius: '10px',
              border: '1px solid #ddd',
              fontSize: '16px',
              outline: 'none',
              minWidth: 0,
              color: '#111111',
              backgroundColor: '#ffffff'
            }}
          />
          <button
            onClick={() => cercaPost(ricerca)}
            style={{
              border: 'none',
              background: '#007BFF',
              color: 'white',
              padding: '0 15px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Cerca"
          >
            {/* Lente d'ingrandimento SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* --- RISULTATI DELLA RICERCA --- */}
        {caricamento ? (
          <p style={{ textAlign: 'center', color: '#111111' }}>Caricamento...</p>
        ) : risultati.length > 0 ? (
          risultati.map(post => {
            const emailAutore = post.profili?.email || "utente@anonimo.it";
            const nomeUtenteCorto = post.profili?.username || emailAutore.split('@')[0];
            const numeroMiPiace = post.post_likes?.length || 0;
            const numeroCommenti = post.post_commenti?.length || 0;

            return (
              <div key={post.id} style={{
                padding: '20px',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                marginBottom: '20px',
                backgroundColor: '#fafafa',
                color: '#111111'
              }}>

                {/* Intestazione Utente (Stesso stile del Feed) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <div
                    onClick={() => alClickProfilo(post.user_id, nomeUtenteCorto, emailAutore)}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#007BFF', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}
                  >
                    {nomeUtenteCorto.charAt(0).toUpperCase()}
                  </div>
                  <strong
                    onClick={() => alClickProfilo(post.user_id, nomeUtenteCorto, emailAutore)}
                    style={{ cursor: 'pointer', color: '#111111' }}
                  >
                    {nomeUtenteCorto}
                  </strong>
                </div>

                {/* Testo del Post */}
                <p style={{ marginTop: 0, marginBottom: post.hashtags ? '5px' : '15px', fontSize: '16px', color: '#111111' }}>
                  {post.descrizione}
                </p>

                {/* Hashtag cliccabili (che avviano una nuova ricerca) */}
                {post.hashtags && (
                  <p style={{ color: '#007BFF', margin: '0 0 15px 0', fontSize: '15px', fontWeight: '500' }}>
                    {post.hashtags.split(" ").map((tag, index) => (
                      <span
                        key={index}
                        onClick={() => gestisciClickHashtag(tag)}
                        style={{ cursor: 'pointer', marginRight: '5px' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </p>
                )}

                {/* Immagine del Post */}
                {post.immagine_url && (
                  <div style={{ width: '100%', marginBottom: '15px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={post.immagine_url}
                      alt="Post"
                      style={{ maxWidth: '100%', maxHeight: '550px', objectFit: 'contain' }}
                    />
                  </div>
                )}

                {/* Visualizzazione statica di Mi Piace e Commenti per continuità di stile col feed */}
                <div style={{ display: 'flex', gap: '25px', marginTop: '15px', color: '#333333', fontWeight: 'bold' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#333333' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {numeroMiPiace} Mi piace
                  </span>

                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#333333' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    {numeroCommenti} Commenti
                  </span>
                </div>

              </div>
            );
          })
        ) : (
          /* Il messaggio esce SOLO se haCercato è true, ovvero dopo aver cliccato la lente */
          haCercato && ricerca && (
            <p style={{ textAlign: 'center', color: '#777777', marginTop: '30px' }}>
              Nessun post trovato per "{ricerca}"
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Esplora;