import { useState } from 'react';
import { supabase } from './supabase';

function SchermataLogin({ email, setEmail, password, setPassword, login, registrati }) {
  const [sezione, setSezione] = useState('accesso');
  const [confermaPassword, setConfermaPassword] = useState('');

  const gestisciRegistrazione = async () => {
    if (password !== confermaPassword) {
      alert('Le password non coincidono!');
      return;
    }

    const { error: erroreRegistrazione } = await supabase.auth.signUp({ email, password });

    if (erroreRegistrazione) {
      alert('Errore durante la registrazione: ' + erroreRegistrazione.message);
      return;
    }

    const { error: erroreLogin } = await supabase.auth.signInWithPassword({ email, password });

    if (erroreLogin) {
      alert('Registrazione completata! Effettua il login manualmente.');
      setSezione('accesso');
      return;
    }
    // Se tutto ok, l'utente viene loggato automaticamente — MainApp reagisce da solo tramite onAuthStateChange
  };

  const cardStyle = {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    color: '#111111'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    color: '#111111',
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '6px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 16px',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '12px',
    fontSize: '16px'
  };

  const linkStyle = {
    color: '#007BFF',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px',
    textDecoration: 'underline'
  };

  const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  const buttonDivStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };

  const renderRegistrazione = () => (
    <>
      <h2 style={{ color: '#111111' }}>Crea un account</h2>
      <div style={sectionStyle}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Conferma password"
          value={confermaPassword}
          onChange={(e) => setConfermaPassword(e.target.value)}
          style={inputStyle}
        />
        <div
          onClick={gestisciRegistrazione}
          style={{ ...buttonStyle, backgroundColor: '#28A745' }}
        >
          Registrati
        </div>
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <div style={linkStyle} onClick={() => setSezione('accesso')}>
          Hai già un account? Accedi qui
        </div>
      </div>
    </>
  );

  const renderAccesso = () => (
    <>
      <h2 style={{ color: '#111111' }}>Accedi</h2>
      <div style={sectionStyle}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <div onClick={login} style={{ ...buttonStyle, backgroundColor: '#007BFF' }}>
          Login
        </div>
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <div style={linkStyle} onClick={() => setSezione('registrazione')}>
          Non hai un account? Registrati qui
        </div>
        <div style={linkStyle} onClick={() => setSezione('recupero')}>
          Password dimenticata?
        </div>
      </div>
    </>
  );

  const renderRecupero = () => (
    <>
      <h2 style={{ color: '#111111' }}>Recupera password</h2>
      <div style={sectionStyle}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <div style={{ ...buttonStyle, backgroundColor: '#111111' }}>
          Invia codice
        </div>
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <div style={linkStyle} onClick={() => setSezione('accesso')}>
          Torna al login
        </div>
      </div>
    </>
  );

  return (
    <div style={cardStyle}>
      {sezione === 'registrazione' && renderRegistrazione()}
      {sezione === 'accesso' && renderAccesso()}
      {sezione === 'recupero' && renderRecupero()}
    </div>
  );
}

export default SchermataLogin;
