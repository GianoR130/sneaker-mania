import { useState, useEffect } from 'react';
import { supabase } from './supabase';

function App() {
  // --- IMPOSTAZIONI ADMIN ---
  // Inserisci qui l'email che vuoi usare come amministratore!
  const EMAIL_ADMIN = 'admin@test.com';

  // --- STATI DATABASE E FORM ---
  const [datiScarpe, setDatiScarpe] = useState([]);
  const [inCaricamento, setInCaricamento] = useState(false);
  const [nuovoBrand, setNuovoBrand] = useState('');
  const [nuovoModello, setNuovoModello] = useState('');
  const [idInModifica, setIdInModifica] = useState(null);
  const [brandModificato, setBrandModificato] = useState('');
  const [modelloModificato, setModelloModificato] = useState('');

  // --- STATI AUTENTICAZIONE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [utente, setUtente] = useState(null);

  // LA MAGIA DEI RUOLI: Controllo se l'utente loggato è l'admin
  const isAdmin = utente?.email === EMAIL_ADMIN;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUtente(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUtente(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const registrati = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Errore: " + error.message);
    else alert('Registrazione completata!');
  };

  const login = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Errore: " + error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // --- CRUD DATABASE ---
  const scaricaCatalogo = async () => {
    setInCaricamento(true);
    const { data, error } = await supabase.from('scarpe').select('*').order('id', { ascending: true });
    if (error) console.error("Errore:", error.message);
    else setDatiScarpe(data);
    setInCaricamento(false);
  };

  const aggiungiScarpa = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert("Solo l'admin può aggiungere scarpe!");
    if (!nuovoBrand || !nuovoModello) return alert("Inserisci brand e modello.");

    const { error } = await supabase.from('scarpe').insert([
      { brand: nuovoBrand, modello: nuovoModello, user_id: utente.id }
    ]);

    if (error) alert("Errore: " + error.message);
    else { setNuovoBrand(''); setNuovoModello(''); scaricaCatalogo(); }
  };

  const eliminaScarpa = async (idScarpa) => {
    if (!isAdmin) return;
    if (!window.confirm("Sei sicuro di voler eliminare questa scarpa?")) return;
    const { error } = await supabase.from('scarpe').delete().eq('id', idScarpa);
    if (error) alert("Errore: " + error.message);
    else setDatiScarpe(datiScarpe.filter(s => s.id !== idScarpa));
  };

  const avviaModifica = (scarpa) => {
    setIdInModifica(scarpa.id);
    setBrandModificato(scarpa.brand);
    setModelloModificato(scarpa.modello);
  };

  const salvaModifica = async (idScarpa) => {
    const { error } = await supabase.from('scarpe').update({ brand: brandModificato, modello: modelloModificato }).eq('id', idScarpa);
    if (error) alert("Errore: " + error.message);
    else { setIdInModifica(null); scaricaCatalogo(); }
  };

  useEffect(() => {
    if (utente) scaricaCatalogo();
  }, [utente]);

  // SCHERMATE
  if (!utente) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h2>Benvenuto nel Catalogo!</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={login} style={{ flex: 1, padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
            <button onClick={registrati} style={{ flex: 1, padding: '10px', backgroundColor: '#28A745', color: 'white', border: 'none', cursor: 'pointer' }}>Registrati</button>
          </div>
        </form>
      </div>
    );
  }

  const containerStyle = {
    maxWidth: '900px',
    width: 'min(95vw, 900px)',
    margin: '50px auto',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
  };

  return (
    <div style={containerStyle}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Catalogo Scarpe</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isAdmin && <span style={{ backgroundColor: '#ffc107', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>ADMIN</span>}
          <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Esci</button>
        </div>
      </div>
      
      {/* MOSTRIAMO IL FORM SOLO SE L'UTENTE È ADMIN */}
      {isAdmin && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f3f5', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Aggiungi una nuova scarpa (Area Admin)</h3>
          <form onSubmit={aggiungiScarpa} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input type="text" placeholder="Es. Nike" value={nuovoBrand} onChange={(e) => setNuovoBrand(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Es. Air Force 1" value={nuovoModello} onChange={(e) => setNuovoModello(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Aggiungi</button>
          </form>
        </div>
      )}

      <ul style={{ listStyleType: 'none', padding: 0, marginTop: '20px' }}>
        {datiScarpe.map((scarpa) => (
          <li key={scarpa.id} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: isAdmin ? '5px solid #ffc107' : '5px solid #17A2B8', marginBottom: '10px' }}>
            
            {idInModifica === scarpa.id ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="text" value={brandModificato} onChange={(e) => setBrandModificato(e.target.value)} style={{ flex: 1, padding: '8px' }} />
                <input type="text" value={modelloModificato} onChange={(e) => setModelloModificato(e.target.value)} style={{ flex: 1, padding: '8px' }} />
                <button onClick={() => salvaModifica(scarpa.id)} style={{ padding: '8px 12px', backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>💾 Salva</button>
                <button onClick={() => setIdInModifica(null)} style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annulla</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>{scarpa.brand}</strong> - {scarpa.modello}</div>
                
                {/* MOSTRIAMO I BOTTONI MODIFICA/CANCELLA SOLO SE L'UTENTE È ADMIN */}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => avviaModifica(scarpa)} style={{ padding: '6px 10px', backgroundColor: '#00c3ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>✏️ Modifica</button>
                    <button onClick={() => eliminaScarpa(scarpa.id)} style={{ padding: '6px 10px', backgroundColor: '#4a4a4a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>❌ Cancella</button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
        {datiScarpe.length === 0 && !inCaricamento && (
          <p style={{ color: 'gray', textAlign: 'center', fontStyle: 'italic' }}>Il catalogo è vuoto.</p>
        )}
      </ul>
    </div>
  );
}

export default App;