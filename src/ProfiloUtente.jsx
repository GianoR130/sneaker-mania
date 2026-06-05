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
    <div style={{ ...containerStyle, position: 'relative', paddingBottom: '80px' }}>

      {/* ⚙️ Icona Impostazioni - Angoli morbidi ed effetto premium */}
      <button
        onClick={() => setVistaCorrente('impostazioni')}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#ffffff',
          border: 'none',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          fontSize: '22px',
          cursor: 'pointer',
          padding: '0',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'all 0.2s ease'
        }}
        title="Impostazioni Account"
      >
        ⚙️
      </button>

      {/* Bottone Torna al Feed - Pill Style */}
      <button
        onClick={() => setVistaCorrente('social')}
        style={{
          padding: '8px 16px',
          background: '#ffffff',
          border: '1px solid #eaeaea',
          borderRadius: '25px',
          cursor: 'pointer',
          color: '#111111',
          fontWeight: 'bold',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease'
        }}
      >
        ← Torna al Feed
      </button>

      <h1 style={{ margin: '0 0 25px 0', fontSize: '24px', fontWeight: 'bold', color: '#111111' }}>
        Il Tuo Profilo
      </h1>

      {/* Scheda Profilo Principale */}
      <div style={{ padding: '30px 20px', backgroundColor: '#ffffff', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        {/* Avatar Circolare con Iniziale Maiuscola - Verde #28A745 (Stato Profilo Personale) */}
        <div style={{ 
          width: '90px', 
          height: '90px', 
          borderRadius: '50%', 
          backgroundColor: '#28A745', 
          color: '#ffffff', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          fontSize: '36px', 
          fontWeight: 'bold', 
          margin: '0 auto 15px auto',
          boxShadow: '0 4px 10px rgba(40, 167, 69, 0.2)'
        }}>
          {visualizzaNome.charAt(0).toUpperCase()}
        </div>

        <h2 style={{ margin: '0 0 20px 0', color: '#111111', fontSize: '22px', fontWeight: 'bold' }}>
          @{visualizzaNome}
        </h2>

        {/* Contatori Follower / Seguiti */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', padding: '15px 0', borderTop: '1px solid #f0f2f5' }}>
          <div
            onClick={() => utente?.id && apriListaRelazioni(utente.id, 'follower')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          >
            <span style={{ display: 'block', fontSize: '22px', fontWeight: 'bold', color: '#111111' }}>{mieRelazioni?.followers || 0}</span>
            <span style={{ fontSize: '13px', color: '#777777', fontWeight: '500' }}>Follower</span>
          </div>

          <div
            onClick={() => utente?.id && apriListaRelazioni(utente.id, 'seguiti')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          >
            <span style={{ display: 'block', fontSize: '22px', fontWeight: 'bold', color: '#111111' }}>{mieRelazioni?.following || 0}</span>
            <span style={{ fontSize: '13px', color: '#777777', fontWeight: '500' }}>Seguiti</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        
        {/* Selettore Tab Premium - Speculare ed esteso */}
        <div style={{ display: 'flex', borderBottom: '2px solid #eaeaea', marginBottom: '20px' }}>
          <button
            onClick={() => setTabAttiva('post')}
            style={{
              flex: 1,
              padding: '14px',
              background: 'none',
              border: 'none',
              borderBottom: tabAttiva === 'post' ? '3px solid #111111' : '3px solid transparent',
              fontWeight: tabAttiva === 'post' ? 'bold' : 'normal',
              color: tabAttiva === 'post' ? '#111111' : '#777777',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
          >
            Post
          </button>
          <button
            onClick={() => setTabAttiva('raccolte')}
            style={{
              flex: 1,
              padding: '14px',
              background: 'none',
              border: 'none',
              borderBottom: tabAttiva === 'raccolte' ? '3px solid #111111' : '3px solid transparent',
              fontWeight: tabAttiva === 'raccolte' ? 'bold' : 'normal',
              color: tabAttiva === 'raccolte' ? '#111111' : '#777777',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              marginBottom: '-2px'
            }}
          >
            Raccolte
          </button>
        </div>

        {/* CONTENUTO DELLE SEZIONI */}
        {tabAttiva === 'post' ? (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {postConFoto.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777777', padding: '40px 20px', margin: 0, backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                Nessuna foto pubblicata.
              </p>
            ) : (
              /* Griglia Post Immagini */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' }}>
                {postConFoto.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleApriPost(p.id)}
                    style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid #edf2f7',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <img 
                      src={p.immagine_url} 
                      alt="Post" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
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
            {raccolte.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {raccolte.map(r => (
                  <div key={r.id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', position: 'relative', color: '#111111' }}>

                    {/* Intestazione della singola raccolta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '30px' }}>📁</span>
                        <div>
                          <strong style={{ fontSize: '18px', color: '#111111', display: 'block' }}>{r.nome_raccolta}</strong>
                          <span style={{ fontSize: '13px', color: '#777777' }}>{r.scarpe?.length || 0} scarpe salvate</span>
                        </div>
                      </div>

                      {/* Pulsanti di Azione della Raccolta */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => togglePrivacyRaccolta(r.id, r.is_public)}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: r.is_public ? '#f0f2f5' : '#fff3cd',
                            color: r.is_public ? '#111111' : '#856404',
                            border: 'none',
                            borderRadius: '25px', // Pill Style
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {r.is_public ? '🌍 Pubblica' : '🔒 Privata'}
                        </button>
                        <button
                          onClick={() => eliminaRaccolta(r.id)}
                          style={{
                            padding: '6px 14px',
                            backgroundColor: '#dc3545', // Rosso del DNA Visivo per le eliminazioni
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '25px', // Pill Style
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Elimina
                        </button>
                      </div>
                    </div>

                    {/* Griglia interna dei prodotti salvati nella Raccolta */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
                      {r.scarpe && r.scarpe.length > 0 ? (
                        r.scarpe.map((s, idx) => (
                          <div key={s.id || idx} style={{ textAlign: 'center', padding: '12px', border: '1px solid #f0f2f5', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '100%', height: '140px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {s.immagine ? (
                                <img src={s.immagine} alt={s.modello} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                              ) : (
                                <span style={{ fontSize: '40px' }}>👟</span>
                              )}
                            </div>
                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111111', marginBottom: '2px', textTransform: 'uppercase' }}>{s.brand}</div>
                              <div style={{ fontSize: '12px', color: '#666666', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.modello}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '14px', color: '#777777', gridColumn: '1/-1', textAlign: 'center', padding: '20px', margin: 0 }}>
                          Questa raccolta è vuota.
                        </p>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              /* Raccolte Vuote */
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '15px', color: '#777777', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📂</span>
                <p style={{ margin: 0, fontWeight: '500' }}>Non hai ancora creato nessuna raccolta.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default ProfiloUtente;