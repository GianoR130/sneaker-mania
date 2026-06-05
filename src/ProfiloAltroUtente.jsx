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
  const [tabAttiva, setTabAttiva] = useState('post'); // 'post' o 'raccolte'
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

  const handleApriPost = (postId) => {
    try {
      localStorage.setItem('postAperto', String(postId));
    } catch (err) {
      console.error('Errore set localStorage postAperto', err);
    }
    setVistaCorrente('social');
  };

  const postConFoto = postUtente.filter(p => p.immagine_url && p.immagine_url.trim() !== '');
  const visualizzaNome = profiloSelezionato?.username || profiloSelezionato?.email?.split('@')[0] || "Utente";

  return (
    <div style={{ ...containerStyle }}>

      {/* HEADER DELLA PAGINA */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #f1f5f9', 
        paddingBottom: '16px', 
        flexWrap: 'wrap', 
        gap: '10px' 
      }}>
        <button
          onClick={() => setVistaCorrente('social')}
          style={{
            padding: '8px 14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px', // Pillola premium
            cursor: 'pointer',
            color: '#111111',
            fontWeight: '600',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          ← Torna al Feed
        </button>
        
        {seguitiInfo?.isFriend && (
          <span style={{ 
            backgroundColor: '#ecfdf5', 
            color: '#059669', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: '700',
            letterSpacing: '-0.1px',
            border: '1px solid #d1fae5'
          }}>
            Amici reciproci ⚡
          </span>
        )}
      </div>

      {/* CARD PROFILO UTENTE */}
      <div style={{ 
        marginTop: '24px', 
        padding: '28px 24px', 
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        {/* Avatar Circolare */}
        <div style={{ 
          width: '84px', 
          height: '84px', 
          borderRadius: '50%', 
          backgroundColor: '#111111', // Dark premium contrast
          color: '#ffffff', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          fontSize: '32px', 
          fontWeight: '700', 
          margin: '0 auto 16px auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          {visualizzaNome.charAt(0).toUpperCase()}
        </div>
        
        <h2 style={{ margin: '0 0 6px 0', color: '#111111', fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          @{visualizzaNome}
        </h2>

        {/* STATISTICHE FOLLOWER / SEGUITI */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '48px', 
          margin: '24px 0', 
          padding: '16px 0', 
          borderTop: '1px solid #f1f5f9', 
          borderBottom: '1px solid #f1f5f9' 
        }}>
          <div
            onClick={() => profiloSelezionato?.id && apriListaRelazioni(profiloSelezionato.id, 'follower')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <span style={{ display: 'block', fontSize: '22px', fontWeight: '700', color: '#111111' }}>{seguitiInfo?.followers || 0}</span>
            <span style={{ fontSize: '13px', color: '#666666', fontWeight: '500' }}>Follower</span>
          </div>

          <div
            onClick={() => profiloSelezionato?.id && apriListaRelazioni(profiloSelezionato.id, 'seguiti')}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <span style={{ display: 'block', fontSize: '22px', fontWeight: '700', color: '#111111' }}>{seguitiInfo?.following || 0}</span>
            <span style={{ fontSize: '13px', color: '#666666', fontWeight: '500' }}>Seguiti</span>
          </div>
        </div>

        {/* PULSANTI DI INTERAZIONE (Pillole Stile TikTok) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
          <button
            onClick={() => toggleSegui(profiloSelezionato.id)}
            style={{
              padding: '12px 28px',
              borderRadius: '25px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: seguitiInfo?.isFollowing ? '#f1f5f9' : '#111111',
              color: seguitiInfo?.isFollowing ? '#111111' : '#ffffff',
              transition: 'all 0.2s ease',
              boxShadow: seguitiInfo?.isFollowing ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => {
              if (!seguitiInfo?.isFollowing) {
                e.currentTarget.style.backgroundColor = '#222222';
                e.currentTarget.style.transform = 'translateY(-1px)';
              } else {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!seguitiInfo?.isFollowing) {
                e.currentTarget.style.backgroundColor = '#111111';
                e.currentTarget.style.transform = 'translateY(0)';
              } else {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
              }
            }}
          >
            {seguitiInfo?.isFollowing ? 'Smetti di seguire' : seguitiInfo?.miSegue ? 'Segui anche tu' : 'Segui'}
          </button>

          <button
            onClick={() => avviaChat(profiloSelezionato.id, profiloSelezionato.username, profiloSelezionato.email)}
            style={{
              padding: '12px 28px',
              borderRadius: '25px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: '#007BFF', // Brand Blue d'azione
              color: '#ffffff',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,123,255,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0069d9';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,123,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007BFF';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,123,255,0.2)';
            }}
          >
            Messaggia
          </button>
        </div>
      </div>

      {/* SELETTORE TAB IN STILE TIKTOK */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginTop: '24px', marginBottom: '20px' }}>
        <button
          onClick={() => setTabAttiva('post')}
          style={{
            flex: 1,
            padding: '14px',
            background: 'none',
            border: 'none',
            borderBottom: tabAttActive === 'post' ? '2px solid #111111' : '2px solid transparent',
            fontWeight: tabAttiva === 'post' ? '700' : '500',
            color: tabAttiva === 'post' ? '#111111' : '#777777',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'all 0.15s ease'
          }}
        >
          Post ({postConFoto.length})
        </button>
        <button
          onClick={() => setTabAttiva('raccolte')}
          style={{
            flex: 1,
            padding: '14px',
            background: 'none',
            border: 'none',
            borderBottom: tabAttiva === 'raccolte' ? '2px solid #111111' : '2px solid transparent',
            fontWeight: tabAttiva === 'raccolte' ? '700' : '500',
            color: tabAttiva === 'raccolte' ? '#111111' : '#777777',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'all 0.15s ease'
          }}
        >
          Raccolte ({raccolte.length})
        </button>
      </div>

      {/* CONTENUTO SEZIONE: POST */}
      {tabAttiva === 'post' && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {postConFoto.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666666', padding: '48px 20px', margin: 0, backgroundColor: '#ffffff', borderRadius: '12px', fontSize: '14px' }}>
              Nessuna foto pubblicata da questo utente.
            </p>
          ) : (
            /* GRIGLIA QUADRATA COMPATTA */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', width: '100%' }}>
              {postConFoto.map(post => (
                <div
                  key={post.id}
                  onClick={() => handleApriPost(post.id)}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img
                    src={post.immagine_url}
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
      )}

      {/* CONTENUTO SEZIONE: RACCOLTE */}
      {tabAttiva === 'raccolte' && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {raccolte.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {raccolte.map(r => (
                <div key={r.id} style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)', 
                  color: '#111111' 
                }}>

                  {/* Intestazione cartella */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '26px' }}>📁</span>
                      <div>
                        <strong style={{ fontSize: '18px', color: '#111111', fontWeight: '700', letterSpacing: '-0.3px' }}>{r.nome_raccolta}</strong>
                        <span style={{ display: 'block', fontSize: '13px', color: '#666666', marginTop: '2px' }}>{r.scarpe?.length || 0} scarpe salvate</span>
                      </div>
                    </div>
                  </div>

                  {/* Orizzontale o griglia interna scarpe */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                    {r.scarpe && r.scarpe.length > 0 ? (
                      r.scarpe.map((s, idx) => (
                        <div key={s.id || idx} style={{ 
                          textAlign: 'center', 
                          padding: '10px', 
                          border: '1px solid #f1f5f9', 
                          borderRadius: '12px', 
                          backgroundColor: '#f8fafc' 
                        }}>
                          <div style={{ width: '100%', height: '140px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {s.immagine ? (
                              <img src={s.immagine} alt={s.modello} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                            ) : (
                              <span style={{ fontSize: '32px' }}>👟</span>
                            )}
                          </div>
                          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.brand}</div>
                            <div style={{ fontSize: '12px', color: '#666666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.modello}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: '13px', color: '#aaaaaa', gridColumn: '1/-1', textAlign: 'center', padding: '16px', margin: 0 }}>
                        Questa raccolta è vuota.
                      </p>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', backgroundColor: '#ffffff', borderRadius: '12px' }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🔒</span>
              <p style={{ color: '#666666', fontStyle: 'italic', margin: 0, fontSize: '14px' }}>
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