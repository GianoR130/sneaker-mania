import React from 'react';

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
  return (
    <div style={containerStyle}>
      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#111111' }}>Il tuo Feed</h1>
        <p style={{ margin: '5px 0 0 0', color: '#555555' }}>Scopri le ultime tendenze e i post degli utenti.</p>
      </div>

      {posts.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#777777', marginTop: '30px' }}>Nessun post da mostrare. Aggiungine uno!</p>
      ) : (
        posts.map(post => {
          const haMessoMiPiace = post.post_likes.some(like => like.user_id === utente.id);
          const numeroMiPiace = post.post_likes.length;
          const numeroCommenti = post.post_commenti.length;

          const emailAutore = post.profili?.email || "utente@anonimo.it";
          const nomeUtenteCorto = emailAutore.split('@')[0];

          return (
            <div key={post.id} style={{
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              marginBottom: '20px',
              backgroundColor: '#fafafa',
              color: '#111111'
            }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div
                  onClick={() => apriProfiloUtente(post.user_id, nomeUtenteCorto, emailAutore)}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#007BFF', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}
                >
                  {nomeUtenteCorto.charAt(0).toUpperCase()}
                </div>
                <strong
                  onClick={() => apriProfiloUtente(post.user_id, nomeUtenteCorto, emailAutore)}
                  style={{ cursor: 'pointer', color: '#111111' }}
                >
                  {nomeUtenteCorto}
                </strong>

                {(isAdmin || post.user_id === utente.id) && (
                  <button
                    onClick={() => eliminaPost(post.id)}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', padding: '5px', color: '#ff0000', fontWeight: 'bold' }}
                    title="Elimina post"
                  >
                    ✖
                  </button>
                )}
              </div>

              <p style={{ marginTop: 0, marginBottom: post.hashtags ? '5px' : '15px', fontSize: '16px', color: '#111111' }}>
                {post.descrizione}
              </p>

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

              {post.immagine_url && (
                <div style={{ width: '100%', marginBottom: '15px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={post.immagine_url}
                    alt="Post"
                    style={{ maxWidth: '100%', maxHeight: '550px', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '25px', marginTop: '15px', color: '#333333', fontWeight: 'bold' }}>
                <span onClick={() => toggleMiPiace(post.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#333333' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={haMessoMiPiace ? "#e0245e" : "none"} stroke={haMessoMiPiace ? "#e0245e" : "#333333"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s, fill 0.2s', transform: haMessoMiPiace ? 'scale(1.15)' : 'scale(1)' }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  {numeroMiPiace} Mi piace
                </span>

                <span onClick={() => setPostInCommento(postInCommento === post.id ? null : post.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#333333' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  {numeroCommenti} Commenti
                </span>
              </div>

              {postInCommento === post.id && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>

                  {post.post_commenti?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                      {post.post_commenti.map(commento => {
                        const puoEliminare = isAdmin || commento.user_id === utente.id;
                        const emailCommentatore = commento.profili?.email || "utente@anonimo.it";
                        const nomeCommentatore = commento.profili?.username || emailCommentatore.split('@')[0];

                        return (
                          <div key={commento.id} style={{ backgroundColor: '#f4f5f7', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              flex: 1,
                              alignItems: 'flex-start',
                              textAlign: 'left',
                              wordBreak: 'break-word'
                            }}>
                              <strong
                                onClick={() => apriProfiloUtente(commento.user_id, nomeCommentatore, emailCommentatore)}
                                style={{ cursor: 'pointer', color: '#007BFF', fontSize: '13px' }}
                              >
                                {nomeCommentatore}
                              </strong>
                              <span style={{ color: '#111111', lineHeight: '1.4' }}>{commento.testo}</span>
                            </div>

                            {puoEliminare && (
                              <button
                                onClick={() => eliminaCommento(commento.id)}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#ff0000', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', padding: '2px', marginLeft: '10px' }}
                                title="Elimina commento"
                              >
                                ✖
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: '#777777', fontSize: '13px', fontStyle: 'italic', marginBottom: '15px' }}>Nessun commento ancora. Scrivi il primo!</p>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Scrivi un commento..."
                      value={commentoTesto}
                      onChange={(e) => setCommentoTesto(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '20px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', minWidth: 0, color: '#111111', backgroundColor: '#ffffff' }}
                    />
                    <button
                      onClick={() => aggiungiCommento(post.id)}
                      style={{ padding: '8px 16px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}
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
