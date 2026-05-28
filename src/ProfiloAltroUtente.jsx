import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

function ProfiloAltroUtente({
  profiloSelezionato,
  seguitiInfo,
  raccolte,
  utente,
  toggleSegui,
  apriListaRelazioni,
  setVistaCorrente,
  avviaChat,
  containerStyle
}) {
  const [postUtente, setPostUtente] = useState([]);
  const [tabAttiva, setTabAttiva] = useState('post'); // Stato per gestire i Tab ('post' o 'raccolte')
  const idUtenteVisualizzato = profiloSelezionato?.id;

  useEffect(() => {
    if (!idUtenteVisualizzato) {
      setPostUtente([]);
      return;
    }

    const caricaPostUtente = async () => {
      try {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .eq('user_id', idUtenteVisualizzato)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Errore caricamento post utente:', error);
          setPostUtente([]);
        } else {
          setPostUtente(data || []);
        }
      } catch (err) {
        console.error('Eccezione caricamento post utente:', err);
        setPostUtente([]);
      }
    };

    caricaPostUtente();
  }, [idUtenteVisualizzato]);

  // Gestione apertura del post tramite localStorage per coerenza con il profilo personale
  const handleApriPost = (postId) => {
    try {
      localStorage.setItem('postAperto', String(postId));
    } catch (err) {
      console.error('Errore set localStorage postAperto', err);
    }
    setVistaCorrente('social');
  };

  // Filtriamo mantenendo esclusivamente i post che contengono immagini valide
  const postConFoto = postUtente.filter(p => p.immagine_url && p.immagine_url.trim() !== '');

  // Generiamo il nome visualizzato prendendo lo username o la prima parte dell'email tagliata
  const visualizzaNome = profiloSelezionato?.username || profiloSelezionato?.email?.split('@')[0] || "Utente";

  return (
    <div style={{ ...containerStyle }}>

      {/* HEADER DELLA PAGINA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={() => setVistaCorrente('social')}
          style={{
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
          ← Torna al Feed
        </button>
        {seguitiInfo?.isFriend && (
          <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            Ora avete amici
          </span>
        )}
      </div>

      {/* CARD PROFILO UTENTE */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '15px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007BFF', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', fontWeight: 'bold', margin: '0 auto 15px auto' }}>
          {visualizzaNome.charAt(0).toUpperCase()}
        </div>
        
        <h2 style={{ margin: '0 0 5px 0', color: '#111111', fontSize: '22px' }}>
          @{visualizzaNome}
        </h2>

        {/* STATISTICHE FOLLOWER / SEGUITI */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', margin: '20px 0', padding: '15px 0', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
          <div
            onClick={() => profiloSelezionato?.id && apriListaRelazioni(profiloSelezionato.id, 'follower')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          >
            <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#111111' }}>{seguitiInfo?.followers || 0}</span>
            <span style={{ fontSize: '13px', color: '#777777' }}>Follower</span>
          </div>

          <div
            onClick={() => profiloSelezionato?.id && apriListaRelazioni(profiloSelezionato.id, 'seguiti')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          >
            <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#111111' }}>{seguitiInfo?.following || 0}</span>
            <span style={{ fontSize: '13px', color: '#777777' }}>Seguiti</span>
          </div>
        </div>

        {/* PULSANTI DI INTERAZIONE */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
          <button
            onClick={() => toggleSegui(profiloSelezionato.id)}
            style={{
              padding: '10px 30px',
              borderRadius: '25px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: seguitiInfo?.isFollowing ? '#e9ecef' : '#111111',
              color: seguitiInfo?.isFollowing ? '#111111' : '#ffffff',
              transition: 'all 0.2s ease'
            }}
          >
            {seguitiInfo?.isFollowing ? 'Smetti di seguire' : seguitiInfo?.miSegue ? 'Segui anche tu' : 'Segui'}
          </button>

          <button
            onClick={() => avviaChat(profiloSelezionato.id, profiloSelezionato.username, profiloSelezionato.email)}
            style={{
              padding: '10px 30px',
              borderRadius: '25px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: '#007BFF',
              color: '#ffffff',
              transition: 'all 0.2s ease'
            }}
          >
            Messaggia
          </button>
        </div>
      </div>

      {/* SELETTORE TAB IN STILE PROFILO PERSONALE (TIKTOK STYLE) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginTop: '30px', marginBottom: '20px' }}>
        <button
          onClick={() => setTabAttiva('post')}
          style={{
            flex: 1,
            padding: '12px',
            background: 'none',
            border: 'none',
            borderBottom: tabAttiva === 'post' ? '3px solid #111111' : '3px solid transparent',
            fontWeight: tabAttiva === 'post' ? 'bold' : 'normal',
            color: tabAttiva === 'post' ? '#111111' : '#777777',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.15s ease'
          }}
        >
          Post
        </button>
        <button
          onClick={() => setTabAttiva('raccolte')}
          style={{
            flex: 1,
            padding: '12px',
            background: 'none',
            border: 'none',
            borderBottom: tabAttiva === 'raccolte' ? '3px solid #111111' : '3px solid transparent',
            fontWeight: tabAttiva === 'raccolte' ? 'bold' : 'normal',
            color: tabAttiva === 'raccolte' ? '#111111' : '#777777',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.15s ease'
          }}
        >
          Raccolte
        </button>
      </div>

      {/* CONTENUTO SEZIONE: POST */}
      {tabAttiva === 'post' && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {postConFoto.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#777777', padding: '40px 20px', margin: 0, backgroundColor: 'white', borderRadius: '12px' }}>
              Nessuna foto pubblicata.
            </p>
          ) : (
            /* GRIGLIA INTELLIGENTE CON FUNZIONE DI APERTURA AL CLICK */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
              {postConFoto.map(post => (
                <div
                  key={post.id}
                  onClick={() => handleApriPost(post.id)}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    backgroundColor: '#f8fafc', // Sfondo frame neutro
                    borderRadius: '12px',
                    border: '1px solid #edf2f7',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px' // Padding interno di sicurezza anti-taglio
                  }}
                >
                  <img
                    src={post.immagine_url}
                    alt="Post"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain', // Mantiene le proporzioni reali e non taglia l'immagine
                      display: 'block' 
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENUTO SEZIONE: RACCOLTE */}
      {tabAttiva === 'raccolte' && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {raccolte.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {raccolte.map(r => (
                <div key={r.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative', color: '#111111' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '30px' }}>📁</span>
                      <div>
                        <strong style={{ fontSize: '20px', color: '#111111' }}>{r.nome_raccolta}</strong>
                        <span style={{ display: 'block', fontSize: '14px', color: '#777777' }}>{r.scarpe?.length || 0} scarpe salvate</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {r.scarpe && r.scarpe.length > 0 ? (
                      r.scarpe.map((s, idx) => (
                        <div key={s.id || idx} style={{ textAlign: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fafafa' }}>
                          <div style={{ width: '100%', height: '210px', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s.immagine ? (
                              <img src={s.immagine} alt={s.modello} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                            ) : (
                              <span style={{ fontSize: '40px' }}>👟</span>
                            )}
                          </div>
                          <div style={{ marginTop: '5px', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#111111', marginBottom: '4px' }}>{s.brand}</div>
                            <div style={{ fontSize: '13px', color: '#555555', lineHeight: '1.4' }}>{s.modello}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '14px', color: '#aaaaaa', gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>
                        Questa raccolta è vuota.
                      </p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '12px' }}>
              <span style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>🔒</span>
              <p style={{ color: '#777777', fontStyle: 'italic', margin: 0 }}>
                Questo utente non ha ancora raccolte pubbliche.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfiloAltroUtente;