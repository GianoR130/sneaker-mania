import React from 'react';

function ModaleRelazioni({ modaleRelazioni, setModaleRelazioni, apriProfiloUtente }) {
  return (
    <>
      {modaleRelazioni?.visibile && (
        <div style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)', 
          backdropFilter: 'blur(8px)', // Sfocatura premium dello sfondo
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            width: '100%', 
            maxWidth: '400px',
            maxHeight: '75vh', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            
            {/* Intestazione Modale */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid #f1f5f9', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h3 style={{ 
                margin: 0, 
                color: '#111111', 
                fontSize: '17px', 
                fontWeight: '700',
                letterSpacing: '-0.3px'
              }}>
                {modaleRelazioni.titolo}
              </h3>
              
              {/* Pulsante Chiusura Minimalista */}
              <button
                onClick={() => setModaleRelazioni({ visibile: false, titolo: '', utenti: [] })}
                style={{ 
                  background: '#f1f5f9', 
                  border: 'none', 
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer', 
                  color: '#666666', 
                  padding: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                  e.currentTarget.style.color = '#111111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#666666';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Lista Utenti */}
            <div style={{ padding: '8px 16px', overflowY: 'auto', flex: 1 }}>
              {modaleRelazioni.titolo === 'Caricamento...' ? (
                <p style={{ textAlign: 'center', color: '#777777', fontSize: '14px', padding: '20px 0' }}>
                  Caricamento in corso...
                </p>
              ) : modaleRelazioni.utenti.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#777777' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>👥</span>
                  <p style={{ margin: 0, fontSize: '14px' }}>Nessun utente trovato.</p>
                </div>
              ) : (
                modaleRelazioni.utenti.map(u => {
                  const nome = u.username || u.email?.split('@')[0] || 'Utente';
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setModaleRelazioni({ visibile: false, titolo: '', utenti: [] });
                        apriProfiloUtente(u.id, nome, u.email);
                      }}
                      style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '10px 8px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        marginBottom: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Avatar Circolare Dark/Minimal Premium */}
                      <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '50%', 
                        backgroundColor: '#111111', 
                        color: '#ffffff', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        fontWeight: '600', 
                        fontSize: '15px',
                        flexShrink: 0
                      }}>
                        {nome.charAt(0).toUpperCase()}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <strong style={{ 
                          display: 'block', 
                          color: '#111111', 
                          fontSize: '15px', 
                          fontWeight: '600',
                          letterSpacing: '-0.2px'
                        }}>
                          @{nome}
                        </strong>
                      </div>
                      
                      {/* Freccina discreta ad indicare la cliccabilità */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModaleRelazioni;