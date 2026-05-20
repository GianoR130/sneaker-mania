import React from 'react';
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
  return (
    <div style={{ ...containerStyle }}>

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

      <h1 style={{ margin: 0, fontSize: '24px', borderBottom: '1px solid #eee', paddingBottom: '15px', color: '#111111' }}>Il Tuo Profilo</h1>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '15px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#28A745', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', fontWeight: 'bold', margin: '0 auto 15px auto' }}>
          {(utente?.email || mioProfilo?.username || "U").charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: '0 0 5px 0', color: '#111111' }}>
          @{mioProfilo?.username || utente?.email?.split('@')[0] || "Utente"}
        </h2>
        <p style={{ color: '#555555', margin: '0 0 20px 0', fontSize: '15px' }}>
          {utente?.email}
        </p>

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

        <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ marginTop: '40px' }}>
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

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={() => togglePrivacyRaccolta(r)}
                      style={{
                        backgroundColor: r.pubblica ? '#e3f2fd' : '#f5f5f5',
                        color: r.pubblica ? '#1976d2' : '#757575',
                        border: '1px solid ' + (r.pubblica ? '#bbdefb' : '#ddd'),
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexShrink: 0
                      }}
                    >
                      {r.pubblica ? '🌍 Pubblica' : '🔒 Privata'}
                    </button>

                    <button
                      onClick={() => eliminaRaccolta(r.id)}
                      style={{ backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}
                    >
                      Elimina
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {r.scarpe && r.scarpe.length > 0 ? (
                    r.scarpe.map(s => (
                      <div key={s.id} style={{ textAlign: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fafafa' }}>
                        <div style={{ width: '100%', height: '210px', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {s.immagine ? (
                            <img src={s.immagine} alt={s.modello} style={{ width: '100%', height: '200%', objectFit: 'contain', display: 'block' }} />
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
    </div>
  );
}

export default ProfiloUtente;
