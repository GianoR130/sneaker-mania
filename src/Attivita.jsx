import React, { useState } from 'react';

function Attivita({ containerStyle }) {
  const [tabAttiva, setTabAttiva] = useState('notifiche');

  const stileTab = (isActive) => ({
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    flex: 1,
    backgroundColor: isActive ? '#111111' : '#e9ecef',
    color: isActive ? '#ffffff' : '#111111',
    transition: 'background-color 0.3s ease'
  });

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#111111' }}>Attività</h1>

        {/* TAB BUTTONS */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            onClick={() => setTabAttiva('messaggi')}
            style={stileTab(tabAttiva === 'messaggi')}
          >
            💬 Messaggi
          </button>
          <button
            onClick={() => setTabAttiva('notifiche')}
            style={stileTab(tabAttiva === 'notifiche')}
          >
            🔔 Notifiche
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={{ marginTop: '20px' }}>
        {tabAttiva === 'notifiche' && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999999' }}>
            <span style={{ fontSize: '45px', display: 'block', marginBottom: '15px' }}>🔔</span>
            <p style={{ fontSize: '16px', margin: 0 }}>Nessuna notifica per ora.</p>
            <p style={{ fontSize: '13px', marginTop: '8px', color: '#bbbbbb' }}>Le tue notifiche appariranno qui.</p>
          </div>
        )}

        {tabAttiva === 'messaggi' && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999999' }}>
            <span style={{ fontSize: '45px', display: 'block', marginBottom: '15px' }}>💬</span>
            <p style={{ fontSize: '16px', margin: 0 }}>Nessun messaggio per ora.</p>
            <p style={{ fontSize: '13px', marginTop: '8px', color: '#bbbbbb' }}>Le tue conversazioni appariranno qui.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Attivita;
