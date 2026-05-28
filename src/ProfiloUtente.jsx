import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

function ProfiloUtente({
  utente,
  mioProfilo,
  mieRelazioni,
  raccolte,
  apriListaRelazioni,
  eliminaRaccolta,
  togglePrivacyRaccolta,
  setVistaCorrente,
  containerStyle
}) {
  const [postUtente, setPostUtente] = useState([]);
  const [tabAttiva, setTabAttiva] = useState('post');

  const idUtenteProfilo = mioProfilo?.id || utente?.id;

  useEffect(() => {
    if (!idUtenteProfilo) return;

    const caricaPostUtente = async () => {
      try {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .eq('user_id', idUtenteProfilo)
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
  }, [idUtenteProfilo]);

  const handleApriPost = (postId) => {
    try {
      localStorage.setItem('postAperto', String(postId));
    } catch (err) {
      console.error('Errore set localStorage postAperto', err);
    }
    setVistaCorrente('social');
  };

  const postConFoto = postUtente.filter(p => p.immagine_url && p.immagine_url.trim() !== '');

  // Nascondiamo l'email mostrando solo lo username o la prima parte dell'email tagliata
  const visualizzaNome = mioProfilo?.username || mioProfilo?.email?.split('@')[0] || utente?.email?.split('@')[0] || "Utente";

  return (
    <div style={{ ...containerStyle, position: 'relative' }}>

      {/* ⚙️ Icona Impostazioni con margini bilanciati dai bordi */}
      <button
        onClick={() => setVistaCorrente('impostazioni')}
        style={{
          position: 'absolute',
          top: '20px',    /* Margine dall'alto */
          right: '20px',  /* Margine da destra */
          background: 'none',
          border: 'none',
          fontSize: '26px',
          cursor: 'pointer',
          padding: '5px',
          lineHeight: '1',
          zIndex: 10
        }}
        title="Impostazioni Account"
      >
        ⚙️
      </button>

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
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        ← Torna al Feed
      </button>

      <h1 style={{ margin: 0, fontSize: '24px', borderBottom: '1px solid #eee', paddingBottom: '15px', color: '#111111' }}>
        Il Tuo Profilo
      </h1>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '15px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007BFF', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', fontWeight: 'bold', margin: '0 auto 15px auto' }}>
          {visualizzaNome.charAt(0).toUpperCase()}
        </div>

        {/* Mostra solo il nome utente protetto, nascondendo l'email completa */}
        <h2 style={{ margin: '0 0 5px 0', color: '#111111' }}>
          @{visualizzaNome}
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', margin: '20px 0', padding: '15px 0', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
          <div
            onClick={() => utente?.id && apriListaRelazioni(utente.id, 'follower')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          >
            <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#111111' }}>{mieRelazioni?.followers || 0}</span>
            <span style={{ fontSize: '13px', color: '#777777' }}>Follower</span>
          </div>

          <div
            onClick={() => utente?.id && apriListaRelazioni(utente.id, 'seguiti')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          >
            <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#111111' }}>{mieRelazioni?.following || 0}</span>
            <span style={{ fontSize: '13px', color: '#777777' }}>Seguiti</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        
        {/* SELETTORE TAB AGGIORNATO: ORA SPECULARE ED ESTESO COME NEI PROFILI ALTRUI */}
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

        {/* CONTENUTO DELLE SEZIONI */}
        {tabAttiva === 'post' ? (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {postConFoto.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777777', padding: '40px 20px', margin: 0, backgroundColor: 'white', borderRadius: '12px' }}>
                Nessuna foto pubblicata.
              </p>
            ) : (
              /* GRIGLIA INTELLIGENTE CON FRAME ANTI-TAGLIO */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
                {postConFoto.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleApriPost(p.id)}
                    style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      backgroundColor: '#f8fafc', // Frame di sfondo chiaro per le foto fuori proporzione
                      borderRadius: '12px',
                      border: '1px solid #edf2f7',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px' // Evita il contatto aspro con il perimetro del quadrato
                    }}
                  >
                    <img 
                      src={p.immagine_url} 
                      alt="Post" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain', // Mostra l'immagine nella sua interezza senza ritagliarla
                        display: 'block' 
                      }} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', borderBottom: '2px solid #111111', paddingBottom: '10px', marginBottom: '20px', color: '#111111' }}>
              Le Tue Raccolte
            </h2>

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

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => togglePrivacyRaccolta(r.id, r.is_public)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: r.is_public ? '#e2e3e5' : '#fff3cd',
                            color: r.is_public ? '#383d41' : '#856404',
                            border: '1px solid',
                            borderColor: r.is_public ? '#d6d8db' : '#ffeeba',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          {r.is_public ? '🌍 Pubblica' : '🔒 Privata'}
                        </button>
                        <button
                          onClick={() => eliminaRaccolta(r.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            border: '1px solid #f5c6cb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          Elimina
                        </button>
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
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', color: '#999999' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📂</span>
                <p>Non hai ancora creato nessuna raccolta.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default ProfiloUtente;