function NavBar({ vistaCorrente, setVistaCorrente, setQueryRicerca, messaggiNonLetti }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      color: '#111111',
      borderTop: '1px solid #eaeaea',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px 16px',
        boxSizing: 'border-box',
      }}>

        <button
          onClick={() => setVistaCorrente('social')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: vistaCorrente === 'social' ? '#111111' : '#aaaaaa', padding: '4px 8px', flex: 1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={vistaCorrente === 'social' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: vistaCorrente === 'social' ? 'bold' : 'normal' }}>Feed</span>
        </button>

        <button
          onClick={() => setVistaCorrente('profilo')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: vistaCorrente === 'profilo' ? '#111111' : '#aaaaaa', padding: '4px 8px', flex: 1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={vistaCorrente === 'profilo' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: vistaCorrente === 'profilo' ? 'bold' : 'normal' }}>Profilo</span>
        </button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button
            onClick={() => setVistaCorrente('crea_post')}
            style={{ backgroundColor: '#111111', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transform: 'translateY(-10px)', flexShrink: 0 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <button
          onClick={() => {
            setQueryRicerca("");
            setVistaCorrente('attivita');
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: vistaCorrente === 'attivita' ? '#111111' : '#aaaaaa', padding: '4px 8px', flex: 1 }}
        >
          <div style={{ position: 'relative', width: '24px', height: '24px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            {messaggiNonLetti > 0 && (
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#FF3B30',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}>
                {messaggiNonLetti > 99 ? '99+' : messaggiNonLetti}
              </div>
            )}
          </div>
          <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: vistaCorrente === 'attivita' ? 'bold' : 'normal' }}>Attività</span>
        </button>

        <button
          onClick={() => setVistaCorrente('catalogo')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: vistaCorrente === 'catalogo' ? '#111111' : '#aaaaaa', padding: '4px 8px', flex: 1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={vistaCorrente === 'catalogo' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: vistaCorrente === 'catalogo' ? 'bold' : 'normal' }}>Catalogo</span>
        </button>

      </div>   {/* end outer nav */}
    </div>
  );
}

export default NavBar;
