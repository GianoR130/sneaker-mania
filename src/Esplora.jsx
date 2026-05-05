import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const Esplora = ({ queryIniziale, utente, alClickProfilo }) => {
  const [ricerca, setRicerca] = useState(queryIniziale || "");
  const [risultati, setRisultati] = useState([]);
  const [caricamento, setCaricamento] = useState(false);

  // Funzione per cercare i post
  const cercaPost = async (testo) => {
    // Rimuoviamo eventuali spazi vuoti all'inizio o alla fine
    const terminePulito = testo.trim();

    if (!terminePulito) {
      setRisultati([]);
      return;
    }

    setCaricamento(true);

    // Cerchiamo nella colonna 'descrizione' (o 'hashtags' se vuoi cercare in entrambi)
    // Usiamo or per cercare il termine sia nel testo del post che nella colonna hashtag
    const { data, error } = await supabase
      .from('post')
      .select(`
        *,
        profili ( email, username ),
        post_likes ( user_id ),
        post_commenti ( * )
      `)
      // La logica 'or' permette di trovare l'hashtag ovunque sia stato salvato
      .or(`descrizione.ilike.%${terminePulito}%,hashtags.ilike.%${terminePulito}%`)
      .order('created_at', { ascending: false });

    if (!error) {
      setRisultati(data);
    } else {
      console.error("Errore database:", error);
    }
    setCaricamento(false);
  };

  // Se arriviamo dalla Home cliccando un hashtag, esegui subito la ricerca
  useEffect(() => {
    if (queryIniziale) {
      setRicerca(queryIniziale);
      cercaPost(queryIniziale);
    }
  }, [queryIniziale]);

  return (
    <div style={{ paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Esplora</h1>

      {/* Barra di Ricerca */}
      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Cerca post o #hashtag..."
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && cercaPost(ricerca)}
          style={{
            width: '60%',
            padding: '12px 15px',
            borderRadius: '10px',
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <button 
          onClick={() => cercaPost(ricerca)}
          style={{
            position: 'absolute', right: '150px', top: '50%', transform: 'translateY(-50%)',
            border: 'none', background: '#007BFF', color: 'white', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer'
          }}
        >
          Vai
        </button>
      </div>

      {/* Risultati */}
      {caricamento ? (
        <p style={{ textAlign: 'center' }}>Caricamento...</p>
      ) : risultati.length > 0 ? (
        risultati.map(post => {
          const nomeUtente = post.profili?.username || post.profili?.email?.split('@')[0] || "Utente";
          return (
            <div key={post.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div 
                  style={{ fontWeight: 'bold', marginBottom: '5px', cursor: 'pointer', color: '#007BFF' }}
                  onClick={() => alClickProfilo(post.user_id, nomeUtente, post.profili?.email)}
                >
                  @{nomeUtente}
                </div>
                
                {/* --- CORRETTO: post.descrizione invece di post.contenuto --- */}
                <p style={{ margin: '5px 0' }}>{post.descrizione}</p>
                
                {/* Mostriamo anche gli hashtag se presenti nei risultati */}
                {post.hashtags && (
                  <p style={{ color: '#007BFF', fontSize: '14px', margin: '5px 0' }}>{post.hashtags}</p>
                )}

                {post.immagine_url && <img src={post.immagine_url} style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }} alt="post" />}
            </div>
          );
        })
      ) : (
        ricerca && <p style={{ textAlign: 'center', color: '#999' }}>Nessun post trovato per "{ricerca}"</p>
      )}
    </div>
  );
};

export default Esplora;