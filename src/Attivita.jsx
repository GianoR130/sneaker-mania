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

      try {
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

        const conversazioniArricchite = await Promise.all((conversazioni || []).map(async (conversazione) => {
          const otherUserId = conversazione?.user1_id === utente?.id ? conversazione?.user2_id : conversazione?.user1_id;
          const otherUser = profiliMap[otherUserId] || { id: otherUserId, username: 'Utente', email: '' };

          const { count: nonLetti, error: countError } = await supabase
            .from('messaggi')
            .select('id', { count: 'exact' })
            .eq('conversazione_id', conversazione.id)
            .neq('mittente_id', utente.id)
            .eq('letto', false);

          if (countError) {
            console.error('Errore conteggio messaggi non letti per conversazione:', countError.message || countError);
          }

          return {
            ...conversazione,
            otherUserId,
            otherUser,
            nonLetti: nonLetti || 0
          };
        }));

        setConversazioniLista(conversazioniArricchite);
      } catch (err) {
        console.error('Errore durante il caricamento delle attività:', err);
      }
    };

    caricaConversazioni();
  }, [utente]);

  // STILE TAB OTTIMIZZATO (PILL STYLE - DNA VISIVO)
  const stileTab = (isActive) => ({
    padding: '12px 24px',
    borderRadius: '25px', // Pill style coerente
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    flex: 1,
    backgroundColor: isActive ? '#111111' : '#f0f2f5', // Sfondo scuro TikTok vs Sfondo App neutro
    color: isActive ? '#ffffff' : '#666666', // Testo primario vs Testo secondario
    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', color: '#111111', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
          Attività
        </h1>

        {/* TAB BUTTONS RE-STYLED */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
          <button
            onClick={() => setTabAttiva('messaggi')}
            style={stileTab(tabAttiva === 'messaggi')}
          >
            <span style={{ fontSize: '16px' }}>💬</span> Messaggi
          </button>
          <button
            onClick={() => setTabAttiva('notifiche')}
            style={stileTab(tabAttiva === 'notifiche')}
          >
            <span style={{ fontSize: '16px' }}>🔔</span> Notifiche
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div style={{ marginTop: '20px' }}>
        {tabAttiva === 'notifiche' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666666' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>🔔</span>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111111', margin: 0 }}>Nessuna notifica per ora.</p>
            <p style={{ fontSize: '14px', marginTop: '6px', color: '#777777' }}>Le tue notifiche appariranno qui.</p>
          </div>
        )}

        {tabAttiva === 'messaggi' && (
          <div>
            {conversazioniLista.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666666' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}>💬</span>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111111', margin: 0 }}>Nessun messaggio per ora.</p>
                <p style={{ fontSize: '14px', marginTop: '6px', color: '#777777' }}>Le tue conversazioni appariranno qui.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {conversazioniLista.map((conversazione) => {
                  const haMessaggiNonLetti = conversazione.nonLetti > 0;
                  const usernameIniziale = conversazione.otherUser.username 
                    ? conversazione.otherUser.username.charAt(0).toUpperCase() 
                    : 'U';

                  return (
                    <button
                      key={conversazione.id}
                      onClick={() => avviaChat(conversazione.otherUserId, conversazione.otherUser.username, conversazione.otherUser.email)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '16px',
                        borderRadius: '15px',
                        border: '1px solid #edf2f7',
                        borderLeft: haMessaggiNonLetti ? '4px solid #007BFF' : '1px solid #edf2f7',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.08)';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                        e.currentTarget.style.borderColor = '#edf2f7';
                      }}
                    >
                      {/* AVATAR CIRCOLARE (DNA VISIVO) */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: haMessaggiNonLetti ? '#007BFF' : '#111111',
                        color: '#ffffff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        {usernameIniziale}
                      </div>

                      {/* CORPO INFORMAZIONI CHAT */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: '700', 
                          color: '#111111',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          @{conversazione.otherUser.username || 'Utente'}
                        </span>
                        <span style={{ 
                          fontSize: '13.5px', 
                          color: haMessaggiNonLetti ? '#111111' : '#666666', 
                          fontWeight: haMessaggiNonLetti ? '600' : 'normal',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {conversazione.last_message || 'Tocca per continuare la conversazione.'}
                        </span>
                      </div>

                      {/* BADGE NUMERICO AZZURRO MESSAGGI NON LETTI */}
                      {haMessaggiNonLetti && (
                        <div style={{
                          backgroundColor: '#007BFF',
                          color: '#ffffff',
                          borderRadius: '20px',
                          padding: '4px 9px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          minWidth: '18px',
                          textAlign: 'center',
                          boxShadow: '0 2px 6px rgba(0, 123, 255, 0.3)',
                          flexShrink: 0
                        }}>
                          {conversazione.nonLetti}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Attivita;