import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function Attivita({ utente, avviaChat, containerStyle }) {
  const [tabAttiva, setTabAttiva] = useState('messaggi');
  const [conversazioniLista, setConversazioniLista] = useState([]);

  useEffect(() => {
    const caricaConversazioni = async () => {
      if (!utente?.id) {
        setConversazioniLista([]);
        return;
      }

      const { data: conversazioni, error } = await supabase
        .from('conversazioni')
        .select('*')
        .or(`user1_id.eq.${utente.id},user2_id.eq.${utente.id}`)
        .order('updated_at', { ascending: false });

      if (error || !conversazioni) {
        setConversazioniLista([]);
        return;
      }

      const otherIds = conversazioni
        .map((conversazione) => (conversazione.user1_id === utente.id ? conversazione.user2_id : conversazione.user1_id))
        .filter(Boolean);

      const uniqueIds = [...new Set(otherIds)];
      const { data: profili } = await supabase
        .from('profili')
        .select('id, username, email')
        .in('id', uniqueIds);

      const profiliMap = (profili || []).reduce((acc, profilo) => {
        acc[profilo.id] = profilo;
        return acc;
      }, {});

      setConversazioniLista(conversazioni.map((conversazione) => {
        const otherUserId = conversazione.user1_id === utente.id ? conversazione.user2_id : conversazione.user1_id;
        const otherUser = profiliMap[otherUserId] || { id: otherUserId, username: 'Utente', email: '' };

        return {
          ...conversazione,
          otherUserId,
          otherUser
        };
      }));
    };

    caricaConversazioni();
  }, [utente]);

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
          <div>
            {conversazioniLista.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#999999' }}>
                <span style={{ fontSize: '45px', display: 'block', marginBottom: '15px' }}>💬</span>
                <p style={{ fontSize: '16px', margin: 0 }}>Nessun messaggio per ora.</p>
                <p style={{ fontSize: '13px', marginTop: '8px', color: '#bbbbbb' }}>Le tue conversazioni appariranno qui.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {conversazioniLista.map((conversazione) => (
                  <button
                    key={conversazione.id}
                    onClick={() => avviaChat(conversazione.otherUserId, conversazione.otherUser.username, conversazione.otherUser.email)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '18px',
                      borderRadius: '15px',
                      border: '1px solid #e6e8eb',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      color: '#111111',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>@{conversazione.otherUser.username || 'Utente'}</span>
                    <span style={{ fontSize: '14px', color: '#555555' }}>
                      {conversazione.last_message || 'Tocca per continuare la conversazione.'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Attivita;
