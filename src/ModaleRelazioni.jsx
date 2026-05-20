function ModaleRelazioni({ modaleRelazioni, setModaleRelazioni, apriProfiloUtente }) {
  return (
    <>
      {modaleRelazioni?.visibile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '15px', width: '100%', maxWidth: '400px',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            {/* Intestazione */}
            <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#111', fontSize: '18px' }}>{modaleRelazioni.titolo}</h3>
              <button
                onClick={() => setModaleRelazioni({ visibile: false, titolo: '', utenti: [] })}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#111', padding: '0 5px' }}
              >
                ✕
              </button>
            </div>

            {/* Lista Utenti */}
            <div style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
              {modaleRelazioni.titolo === 'Caricamento...' ? (
                <p style={{ textAlign: 'center', color: '#777' }}>Caricamento in corso...</p>
              ) : modaleRelazioni.utenti.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777' }}>Nessun utente trovato.</p>
              ) : (
                modaleRelazioni.utenti.map(u => {
                  const nome = u.username || u.email?.split('@')[0] || 'Utente';
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setModaleRelazioni({ visibile: false, titolo: '', utenti: [] });
                        apriProfiloUtente(u.id, nome, u.email); // Reindirizza al profilo!
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0', cursor: 'pointer'
                      }}
                    >
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#28A745', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                        {nome.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', color: '#111', fontSize: '16px' }}>@{nome}</strong>
                      </div>
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
