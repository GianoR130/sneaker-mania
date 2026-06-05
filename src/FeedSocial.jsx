import React, { useState } from 'react';

function FeedSocial({
  posts,
  utente,
  isAdmin,
  postInCommento,
  setPostInCommento,
  commentoTesto,
  setCommentoTesto,
  toggleMiPiace,
  eliminaPost,
  aggiungiCommento,
  eliminaCommento,
  apriProfiloUtente,
  gestisciClickHashtag,
  containerStyle
}) {
  // Stati locali per i filtri e l'ordinamento
  const [criterioOrdine, setCriterioOrdine] = useState('recenti');
  const [criterioFiltro, setCriterioFiltro] = useState('tutto');

  // Stile condiviso per i dropdown allineato al DNA Visivo Premium
  const stileSelect = {
    padding: '10px 16px',
    borderRadius: '20px',
    border: '1px solid #e6e8eb',
    backgroundColor: '#ffffff',
    color: '#111111',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    transition: 'all 0.2s ease',
    WebkitAppearance: 'none', // Rimuove freccia nativa su alcuni browser per look pulito
    MozAppearance: 'none',
    appearance: 'none'
  };

  // 1. FILTRIAMO i post in base al tipo di contenuto
  const postsFiltrati = posts.filter(post => {
    if (criterioFiltro === 'immagini') {
      return !!post.immagine_url; 
    }
    if (criterioFiltro === 'testo') {
      return !post.immagine_url; 
    }
    return true; // 'tutto'
  });

  // 2. ORDINIAMO i post filtrati in base al criterio selezionato
  const postsOrdinati = [...postsFiltrati].sort((a, b) => {
    if (criterioOrdine === 'popolari') {
      return (b.post_likes?.length || 0) - (a.post_likes?.length || 0);
    }
    if (criterioOrdine === 'commentati') {
      return (b.post_commenti?.length || 0) - (a.post_commenti?.length || 0);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div style={{ ...containerStyle, paddingBottom: '100px' }}>
      
      {/* --- HEADER DELLA PAGINA --- */}
      <div style={{ borderBottom: '1px solid #e6e8eb', paddingBottom: '20px', marginBottom: '24px' }}>
        
        {/* Titolo e Sottotitolo perfettamente centrati */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#111111', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
            Il tuo Feed
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#666666', fontSize: '15px' }}>
            Scopri le ultime tendenze e i post degli utenti.
          </p>
          <div
            onClick={() => gestisciClickHashtag('')}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              cursor: 'pointer',
              padding: '6px',
              color: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6e8eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Cerca"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        {/* Riga dei filtri: Contenuto a sinistra, Ordinamento a destra */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Dropdown Filtro (A SINISTRA) */}
          <div style={{ position: 'relative' }}>
            <select
              value={criterioFiltro}
              onChange={(e) => setCriterioFiltro(e.target.value)}
              style={stileSelect}
              onFocus={(e) => e.target.style.borderColor = '#111111'}
              onBlur={(e) => e.target.style.borderColor = '#e6e8eb'}
            >
              <option value="tutto">📱 Tutto</option>
              <option value="immagini">🖼️ Solo immagini</option>
              <option value="testo">📝 Solo testo</option>
            </select>
          </div>

          {/* Dropdown Ordinamento (A DESTRA) */}
          <div style={{ position: 'relative' }}>
            <select
              value={criterioOrdine}
              onChange={(e) => setCriterioOrdine(e.target.value)}
              style={stileSelect}
              onFocus={(e) => e.target.style.borderColor = '#111111'}
              onBlur={(e) => e.target.style.borderColor = '#e6e8eb'}
            >
              <option value="recenti">📅 Recenti</option>
              <option value="popolari">🔥 Popolari</option>
              <option value="commentati">💬 Più commentati</option>
            </select>
          </div>

        </div>
      </div>
      {/* --- FINE HEADER --- */}

      {/* Lista dei post */}
      {postsOrdinati.length === 0 ? (
        <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', marginTop: '20px' }}>
          <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>📭</span>
          <p style={{ color: '#666666', fontSize: '15px', margin: 0 }}>
            {criterioFiltro !== 'tutto' 
              ? "Nessun post corrisponde al filtro selezionato." 
              : "Nessun post da mostrare. Aggiungine uno!"}
          </p>
        </div>
      ) : (
        postsOrdinati.map(post => {
          const haMessoMiPiace = post.post_likes?.some(like => like.user_id === utente.id) || false;
          const numeroMiPiace = post.post_likes?.length || 0;
          const numeroCommenti = post.post_commenti?.length || 0;

          const emailAutore = post.profili?.email || "utente@anonimo.it";
          const nomeUtenteCorto = post.profili?.username || emailAutore.split('@')[0];

          return (
            <div key={post.id} style={{
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '24px',
              backgroundColor: '#ffffff',
              color: '#111111',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.02)'
            }}>

              {/* Intestazione Utente */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  onClick={() => apriProfiloUtente(post.user_id, nomeUtenteCorto, emailAutore)}
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
                  onClick={() => apriProfiloUtente(post.user_id, nomeUtenteCorto, emailAutore)}
                  style={{ cursor: 'pointer', color: '#111111', fontSize: '15px', fontWeight: '600' }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  @{nomeUtenteCorto}
                </strong>

                {(isAdmin || post.user_id === utente.id) && (
                  <button
                    onClick={() => eliminaPost(post.id)}
                    style={{ 
                      marginLeft: 'auto', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '18px', 
                      padding: '6px', 
                      color: '#dc3545', 
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Elimina post"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Testo del Post */}
              <p style={{ marginTop: 0, marginBottom: post.hashtags ? '8px' : '16px', fontSize: '15px', color: '#111111', lineHeight: '1.5' }}>
                {post.descrizione}
              </p>

              {/* Hashtag Cliccabili */}
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
                    alt="Contenuto post"
                    style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              )}

              {/* Bottoni di Interazione (Like e Commenti) */}
              <div style={{ display: 'flex', gap: '24px', marginTop: '16px', color: '#666666', fontSize: '14px', fontWeight: '500', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <span 
                  onClick={() => toggleMiPiace(post.id)} 
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s ease' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={haMessoMiPiace ? "#e0245e" : "none"} stroke={haMessoMiPiace ? "#e0245e" : "#666666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s, fill 0.2s', transform: haMessoMiPiace ? 'scale(1.15)' : 'scale(1)' }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span style={{ color: haMessoMiPiace ? '#e0245e' : '#666666', fontWeight: haMessoMiPiace ? '600' : '500' }}>
                    {numeroMiPiace} Like
                  </span>
                </span>

                <span 
                  onClick={() => setPostInCommento(postInCommento === post.id ? null : post.id)} 
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <span style={{ color: postInCommento === post.id ? '#111111' : '#666666', fontWeight: postInCommento === post.id ? '600' : '500' }}>
                    {numeroCommenti} {numeroCommenti === 1 ? 'Commento' : 'Commenti'}
                  </span>
                </span>
              </div>

              {/* Sezione Espansa dei Commenti */}
              {postInCommento === post.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>

                  {post.post_commenti?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                      {post.post_commenti.map(commento => {
                        const puoEliminare = isAdmin || commento.user_id === utente.id;
                        const emailCommentatore = commento.profili?.email || "utente@anonimo.it";
                        const nomeCommentatore = commento.profili?.username || emailCommentatore.split('@')[0];

                        return (
                          <div key={commento.id} style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #f1f5f9' }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '3px',
                              flex: 1,
                              alignItems: 'flex-start',
                              textAlign: 'left',
                              wordBreak: 'break-word'
                            }}>
                              <strong
                                onClick={() => apriProfiloUtente(commento.user_id, nomeCommentatore, emailCommentatore)}
                                style={{ cursor: 'pointer', color: '#111111', fontSize: '13px', fontWeight: '600' }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                              >
                                @{nomeCommentatore}
                              </strong>
                              <span style={{ color: '#333333', lineHeight: '1.45' }}>{commento.testo}</span>
                            </div>

                            {puoEliminare && (
                              <button
                                onClick={() => eliminaCommento(commento.id)}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#dc3545', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', padding: '2px 6px', marginLeft: '10px', borderRadius: '4px' }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#fff5f5'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                title="Elimina commento"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: '#777777', fontSize: '13px', fontStyle: 'italic', marginBottom: '16px', textAlign: 'left', paddingLeft: '4px' }}>
                      Nessun commento ancora. Scrivi il primo!
                    </p>
                  )}

                  {/* Input Inserimento Nuovo Commento a Pillola */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Scrivi un commento..."
                      value={commentoTesto}
                      onChange={(e) => setCommentoTesto(e.target.value)}
                      style={{ 
                        flex: 1, 
                        padding: '12px 16px', 
                        borderRadius: '25px', 
                        border: '1px solid #e6e8eb', 
                        fontSize: '14px', 
                        outline: 'none', 
                        minWidth: 0, 
                        color: '#111111', 
                        backgroundColor: '#ffffff',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#111111'}
                      onBlur={(e) => e.target.style.borderColor = '#e6e8eb'}
                    />
                    <button
                      onClick={() => {
                        aggiungiCommento(post.id);
                      }}
                      disabled={!commentoTesto.trim()}
                      style={{ 
                        padding: '12px 20px', 
                        backgroundColor: commentoTesto.trim() ? '#007BFF' : '#b3d7ff', 
                        color: '#ffffff', 
                        border: 'none', 
                        borderRadius: '25px', 
                        cursor: commentoTesto.trim() ? 'pointer' : 'not-allowed', 
                        fontWeight: '600', 
                        fontSize: '14px', 
                        flexShrink: 0,
                        transition: 'background-color 0.2s ease',
                        boxShadow: commentoTesto.trim() ? '0 2px 8px rgba(0,123,255,0.15)' : 'none'
                      }}
                    >
                      Invia
                    </button>
                  </div>

                </div>
              )}

            </div>
          );
        })
      )}
    </div>
  );
}

export default FeedSocial;