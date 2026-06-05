import React from 'react';

function NavBar({ vistaCorrente, setVistaCorrente, setQueryRicerca, messaggiNonLetti }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      color: '#111111',
      borderTop: '1px solid #f1f5f9', // Grigio più morbido e moderno rispetto a #eaeaea
      boxShadow: '0 -4px 20px rgba(0,0,0,0.03)', // Ombra più morbida e diffusa
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      // Supporto per le "safe areas" dei display mobile con notch inferiore
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px', // Ottimizzata la larghezza massima per tenerla compatta sui tablet/desktop
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 12px 6px 12px',
        boxSizing: 'border-box',
      }}>

        {/* 1. HOME / FEED */}
        <button
          onClick={() => setVistaCorrente('social')}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            color: vistaCorrente === 'social' ? '#111111' : '#aaaaaa', 
            padding: '4px 0', 
            flex: 1,
            transition: 'color 0.2s ease'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={vistaCorrente === 'social' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span style={{ fontSize: '11px', marginTop: '5px', fontWeight: vistaCorrente === 'social' ? '600' : '500', letterSpacing: '-0.1px' }}>Feed</span>
        </button>

        {/* 2. PROFILO */}
        <button
          onClick={() => setVistaCorrente('profilo')}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            color: vistaCorrente === 'profilo' ? '#111111' : '#aaaaaa', 
            padding: '4px 0', 
            flex: 1,
            transition: 'color 0.2s ease'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={vistaCorrente === 'profilo' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span style={{ fontSize: '11px', marginTop: '5px', fontWeight: vistaCorrente === 'profilo' ? '600' : '500', letterSpacing: '-0.1px' }}>Profilo</span>
        </button>

        {/* 3. PULSANTE CENTRALE CREA POST (TikTok Style) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => setVistaCorrente('crea_post')}
            style={{ 
              backgroundColor: '#111111', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '50%', 
              width: '46px', 
              height: '46px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
              transform: 'translateY(-12px)', 
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-14px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(-12px) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        {/* 4. ATTIVITÀ (Icona Cuore corretta, rimossa Tazza ☕) */}
        <button
          onClick={() => {
            setQueryRicerca("");
            setVistaCorrente('attivita');
          }}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            color: vistaCorrente === 'attivita' ? '#111111' : '#aaaaaa', 
            padding: '4px 0', 
            flex: 1,
            transition: 'color 0.2s ease'
          }}
        >
          <div style={{ position: 'relative', width: '22px', height: '22px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={vistaCorrente === 'attivita' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {messaggiNonLetti > 0 && (
              <div style={{
                position: 'absolute',
                top: '-6px',
                right: '-8px',
                backgroundColor: '#FF3B30', // Rosso di sistema notifiche vivace
                color: '#ffffff',
                borderRadius: '10px',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                fontSize: '10px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                boxBounding: 'border-box',
                border: '2px solid #ffffff' // Stacca il badge dall'icona sottostante
              }}>
                {messaggiNonLetti > 99 ? '99+' : messaggiNonLetti}
              </div>
            )}
          </div>
          <span style={{ fontSize: '11px', marginTop: '5px', fontWeight: vistaCorrente === 'attivita' ? '600' : '500', letterSpacing: '-0.1px' }}>Attività</span>
        </button>

        {/* 5. CATALOGO */}
        <button
          onClick={() => setVistaCorrente('catalogo')}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            color: vistaCorrente === 'catalogo' ? '#111111' : '#aaaaaa', 
            padding: '4px 0', 
            flex: 1,
            transition: 'color 0.2s ease'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={vistaCorrente === 'catalogo' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span style={{ fontSize: '11px', marginTop: '5px', fontWeight: vistaCorrente === 'catalogo' ? '600' : '500', letterSpacing: '-0.1px' }}>Catalogo</span>
        </button>

      </div>
    </div>
  );
}

export default NavBar;