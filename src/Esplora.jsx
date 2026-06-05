import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const Esplora = ({ queryIniziale, utente, alClickProfilo }) => {
  const [ricerca, setRicerca] = useState(queryIniziale || "");
  const [risultati, setRisultati] = useState([]);
  const [caricamento, setCaricamento] = useState(false);
  const [haCercato, setHaCercato] = useState(false);

  // Stati per gestire l'effetto Hover globale
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const cercaPost = async (testo) => {
    const terminePulito = testo.trim();

    if (!terminePulito) {
      setRisultati([]);
      setHaCercato(false);
      return;
    }

    setCaricamento(true);
    setHaCercato(false);

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
    setHaCercato(true);
  };

  useEffect(() => {
    if (queryIniziale) {
      setRicerca(queryIniziale);
      cercaPost(queryIniziale);
    }
  }, [queryIniziale]);

  const gestisciClickHashtag = (tag) => {
    setRicerca(tag);
    cercaPost(tag);
  };

  return (
    <div style={{ paddingBottom: '100px', backgroundColor: '#f0f2f5', color: '#111111', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>
        
        <h1 style={{ fontSize: '26px', marginBottom: '24px', color: '#111111', paddingTop: '24px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
          Esplora
        </h1>

        {/* --- BARRA DI RICERCA A PILLOLA --- */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', width: '100%' }}>
          <input
            type="text"
            placeholder="Cerca post o #hashtag..."
            value={ricerca}
            onChange={(e) => {
              setRicerca(e.target.value);
              setHaCercato(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && cercaPost(ricerca)}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '25px',
              border: '1px solid #e6e8eb',
              fontSize: '15px',
              outline: 'none',
              minWidth: 0,
              color: '#111111',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#111111'}
            onBlur={(e) => e.target.style.borderColor = '#e6e8eb'}
          />
          <button
            onClick={() => cercaPost(ricerca)}
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            style={{
              border: 'none',
              background: isBtnHovered ? '#333333' : '#111111',
              color: 'white',
              padding: '0 22px',
              borderRadius: '25px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            title="Cerca"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* --- RISULTATI DELLA RICERCA --- */}
        {caricamento ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <p style={{ color: '#666666', fontSize: '15px', fontWeight: '500' }}>Caricamento in corso...</p>
          </div>
        ) : risultati.length > 0 ? (
          risultati.map(post => {
            const emailAutore = post.profili?.email || "utente@anonimo.it";
            const nomeUtenteCorto = post.profili?.username || emailAutore.split('@')[0];
            const numeroMiPiace = post.post_likes?.length || 0;
            const numeroCommenti = post.post_commenti?.length || 0;

            return (
              <div key={post.id} style={{
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '20px',
                backgroundColor: '#ffffff',
                color: '#111111',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.02)'
              }}>

                {/* Intestazione Utente */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    onClick={() => alClickProfilo(post.user_id, nomeUtenteCorto, emailAutore)}
                    style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: '50%', 
                      backgroundColor: '#111111', 
                      color: 'white', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      fontWeight: 'bold', 
                      cursor: 'pointer', 
                      flexShrink: 0,
                      fontSize: '15px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {nomeUtenteCorto.charAt(0).toUpperCase()}
                  </div>
                  <strong
                    onClick={() => alClickProfilo(post.user_id, nomeUtenteCorto, emailAutore)}
                    style={{ cursor: 'pointer', color: '#111111', fontSize: '15px', fontWeight: '600' }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    @{nomeUtenteCorto}
                  </strong>
                </div>

                {/* Testo del Post */}
                <p style={{ marginTop: 0, marginBottom: post.hashtags ? '8px' : '16px', fontSize: '15px', color: '#111111', lineHeight: '1.5' }}>
                  {post.descrizione}
                </p>

                {/* Hashtag cliccabili */}
                {post.hashtags && (
                  <p style={{ color: '#007BFF', margin: '0 0 16px 0', fontSize: '14px', fontWeight: '500', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {post.hashtags.split(" ").map((tag, index) => (
                      <span
                        key={index}
                        onClick={() => gestisciClickHashtag(tag)}
                        style={{ cursor: 'pointer', backgroundColor: '#e6f2ff', padding: '4px 10px', borderRadius: '12px', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = '#cce4ff'; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = '#e6f2ff'; }}
                      >
                        {tag}
                      </span>
                    ))}
                  </p>
                )}

                {/* Immagine del Post */}
                {post.immagine_url && (
                  <div style={{ width: '100%', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                    <img
                      src={post.immagine_url}
                      alt="Post dell'utente"
                      style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                )}

                {/* Footer Statistiche (Mi Piace e Commenti) */}
                <div style={{ display: 'flex', gap: '24px', marginTop: '16px', color: '#666666', fontSize: '14px', fontWeight: '500', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {numeroMiPiace} {numeroMiPiace === 1 ? 'Like' : 'Like'}
                  </span>

                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    {numeroCommenti} {numeroCommenti === 1 ? 'Commento' : 'Commenti'}
                  </span>
                </div>

              </div>
            );
          })
        ) : (
          haCercato && ricerca && (
            <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginTop: '24px' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>🔍</span>
              <p style={{ color: '#666666', fontSize: '15px', margin: 0 }}>
                Nessun post trovato per <strong>"{ricerca}"</strong>
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Esplora;