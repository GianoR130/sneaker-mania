import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const Esplora = ({ queryIniziale, utente, alClickProfilo }) => {
  const [ricerca, setRicerca] = useState(queryIniziale || "");
  const [risultati, setRisultati] = useState([]);
  const [caricamento, setCaricamento] = useState(false);

  const cercaPost = async (testo) => {
    const terminePulito = testo.trim();

    if (!terminePulito) {
      setRisultati([]);
      return;
    }

    setCaricamento(true);

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
  };

  useEffect(() => {
    if (queryIniziale) {
      setRicerca(queryIniziale);
      cercaPost(queryIniziale);
    }
  }, [queryIniziale]);

  return (
    // Explicit bg + color so dark mode never bleeds in
    <div style={{
      paddingBottom: '80px',
      backgroundColor: '#f0f2f5',
      color: '#111111',
      minHeight: '100vh',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        margin: '0 auto',
        padding: '0 4px',
        boxSizing: 'border-box',
      }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#111111' }}>Esplora</h1>

      {/* Barra di Ricerca */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', width: '100%' }}>
        <input
          type="text"
          placeholder="Cerca post o #hashtag..."
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
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
            padding: '12px 18px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            flexShrink: 0
          }}
        >
          Vai
        </button>
      </div>

      {/* Risultati */}
      {caricamento ? (
        <p style={{ textAlign: 'center', color: '#111111' }}>Caricamento...</p>
      ) : risultati.length > 0 ? (
        risultati.map(post => {
          const nomeUtente = post.profili?.username || post.profili?.email?.split('@')[0] || "Utente";
          return (
            <div key={post.id} style={{
              backgroundColor: '#ffffff',
              color: '#111111',
              padding: '15px',
              borderRadius: '15px',
              marginBottom: '15px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <div
                style={{ fontWeight: 'bold', marginBottom: '5px', cursor: 'pointer', color: '#007BFF' }}
                onClick={() => alClickProfilo(post.user_id, nomeUtente, post.profili?.email)}
              >
                @{nomeUtente}
              </div>

              <p style={{ margin: '5px 0', color: '#111111' }}>{post.descrizione}</p>

              {post.hashtags && (
                <p style={{ color: '#007BFF', fontSize: '14px', margin: '5px 0' }}>{post.hashtags}</p>
              )}

              {post.immagine_url && (
                <img
                  src={post.immagine_url}
                  style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }}
                  alt="post"
                />
              )}
            </div>
          );
        })
      ) : (
        ricerca && (
          <p style={{ textAlign: 'center', color: '#777777' }}>
            Nessun post trovato per "{ricerca}"
          </p>
        )
      )}
      </div> {/* end inner wrapper */}
    </div>
  );
};

export default Esplora;
