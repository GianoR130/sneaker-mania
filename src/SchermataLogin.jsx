function SchermataLogin({ email, setEmail, password, setPassword, login, registrati }) {
  return (
    <div style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      color: '#111111'
    }}>
      <h2 style={{ color: '#111111' }}>Benvenuto!</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={login} style={{ flex: 1, padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px' }}>Login</button>
          <button onClick={registrati} style={{ flex: 1, padding: '10px', backgroundColor: '#28A745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px' }}>Registrati</button>
        </div>
      </form>
    </div>
  );
}

export default SchermataLogin;
