import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Papa from 'papaparse';

function App() {
  // --- IMPOSTAZIONI ADMIN ---
  const EMAIL_ADMIN = 'admin@email.com';

  // --- STATI DATABASE E FORM ---
  const [datiScarpe, setDatiScarpe] = useState([]);
  const [inCaricamento, setInCaricamento] = useState(false);
  
  // Stati per la Creazione
  const [nuovoBrand, setNuovoBrand] = useState('');
  const [nuovoModello, setNuovoModello] = useState('');
  const [nuovoPrezzo, setNuovoPrezzo] = useState('');
  const [nuovoColore, setNuovoColore] = useState('');
  const [mantieniDati, setMantieniDati] = useState(false); 
  
  // Stati per la Modifica
  const [idInModifica, setIdInModifica] = useState(null);
  const [brandModificato, setBrandModificato] = useState('');
  const [modelloModificato, setModelloModificato] = useState('');
  const [prezzoModificato, setPrezzoModificato] = useState('');
  const [coloreModificato, setColoreModificato] = useState('');

  // --- STATI RICERCA E FILTRI ---
  const [ricercaTesto, setRicercaTesto] = useState('');
  const [mostraFiltri, setMostraFiltri] = useState(false);
  const [filtroPrezzoMin, setFiltroPrezzoMin] = useState('');
  const [filtroPrezzoMax, setFiltroPrezzoMax] = useState('');
  const [filtroBrand, setFiltroBrand] = useState('');
  const [filtroColore, setFiltroColore] = useState('');

  // --- STATI AUTENTICAZIONE E NAVIGAZIONE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [utente, setUtente] = useState(null);
  const [vistaCorrente, setVistaCorrente] = useState('catalogo');

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
    if (!nuovoBrand || !nuovoModello || !nuovoPrezzo) return alert("Inserisci almeno brand, modello e prezzo.");

    const { error } = await supabase.from('scarpe').insert([
      { 
        brand: nuovoBrand, 
        modello: nuovoModello, 
        prezzo: nuovoPrezzo,
        colore: nuovoColore,
        user_id: utente.id 
      }
    ]);

    if (error) alert("Errore: " + error.message);
    else { 
      if (!mantieniDati) {
        setNuovoBrand(''); 
        setNuovoModello(''); 
        setNuovoPrezzo(''); 
        setNuovoColore(''); 
      }
      scaricaCatalogo(); 
    }
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
    setPrezzoModificato(scarpa.prezzo || '');
    setColoreModificato(scarpa.colore || '');
  };

  const salvaModifica = async (idScarpa) => {
    const { error } = await supabase.from('scarpe').update({ 
      brand: brandModificato, 
      modello: modelloModificato,
      prezzo: prezzoModificato,
      colore: coloreModificato
    }).eq('id', idScarpa);

    if (error) alert("Errore: " + error.message);
    else { setIdInModifica(null); scaricaCatalogo(); }
  };

  const inserisciImmagine = async (idScarpa) => {
    if (!isAdmin) return;
    const urlImmagine = window.prompt("Incolla qui l'URL (link) dell'immagine della scarpa:");
    if (!urlImmagine) return;

    const { error } = await supabase.from('scarpe').update({ immagine: urlImmagine }).eq('id', idScarpa);
    if (error) {
      alert("Errore durante il salvataggio dell'immagine: " + error.message);
    } else {
      scaricaCatalogo();
    }
  };

  const gestisciImportazioneCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (risultati) => {
        const datiEstratti = risultati.data;
        const scarpeDaInserire = datiEstratti.map((riga) => ({
          brand: riga.brand,
          modello: riga.modello,
          prezzo: Number(riga.prezzo),
          colore: riga.colore,
          user_id: utente.id
        }));

        const { error } = await supabase.from('scarpe').insert(scarpeDaInserire);

        if (error) alert("Errore durante l'importazione: " + error.message);
        else {
          alert(`Successo! Hai importato ${scarpeDaInserire.length} scarpe nel database.`);
          scaricaCatalogo();
        }
        e.target.value = null; 
      }
    });
  };

  useEffect(() => {
    if (utente) scaricaCatalogo();
  }, [utente]);

  const scarpeFiltrate = datiScarpe.filter((scarpa) => {
    const matchTesto = `${scarpa.brand} ${scarpa.modello}`.toLowerCase().includes(ricercaTesto.toLowerCase());
    const matchMin = filtroPrezzoMin === '' || scarpa.prezzo >= Number(filtroPrezzoMin);
    const matchMax = filtroPrezzoMax === '' || scarpa.prezzo <= Number(filtroPrezzoMax);
    const matchBrand = filtroBrand === '' || (scarpa.brand && scarpa.brand.toLowerCase() === filtroBrand.toLowerCase());
    const matchColore = filtroColore === '' || (scarpa.colore && scarpa.colore.toLowerCase() === filtroColore.toLowerCase());

    return matchTesto && matchMin && matchMax && matchBrand && matchColore;
  });

  const brandUnici = [...new Set(datiScarpe.map(s => s.brand).filter(Boolean))];

  // --- SCHERMATA DI LOGIN ---
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
    margin: '0 auto 50px auto',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
    backgroundColor: 'white'
  };

  // --- RENDER DELL'APP CON I BOTTONI ESTERNI ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* BARRA IN ALTO A DESTRA (FUORI DAI BOX) */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '20px', paddingRight: '10px', maxWidth: '1100px', margin: '0 auto 20px auto' }}>
        
        {isAdmin && <span style={{ backgroundColor: '#ffc107', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>ADMIN</span>}
        
        <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          Esci
        </button>
        
        <button 
          onClick={() => setVistaCorrente('profilo')} 
          title="Vai al tuo profilo"
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #ccc', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
        >
          👤
        </button>
      </div>

      {/* --- SCHERMATA DEL PROFILO --- */}
      {vistaCorrente === 'profilo' && (
        <div style={containerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Il Tuo Profilo</h1>
            <button onClick={() => setVistaCorrente('catalogo')} style={{ padding: '8px 15px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Torna al Catalogo
            </button>
          </div>
          
          <div style={{ marginTop: '40px', textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h2 style={{ margin: '10px 0' }}>Dettagli Account</h2>
            <p style={{ fontSize: '18px', color: '#555' }}><strong>Email:</strong> {utente.email}</p>
            <p style={{ fontSize: '18px', color: '#555' }}>
              <strong>Ruolo:</strong> {isAdmin ? <span style={{ color: '#ffc107', fontWeight: 'bold' }}>Amministratore</span> : 'Utente Standard'}
            </p>
          </div>
        </div>
      )}

      {/* --- SCHERMATA DEL CATALOGO --- */}
      {vistaCorrente === 'catalogo' && (
        <div style={containerStyle}>
          
          <datalist id="lista-colori">
            <option value="Nero" />
            <option value="Bianco" />
            <option value="Rosso" />
            <option value="Blu" />
            <option value="Verde" />
            <option value="Giallo" />
            <option value="Grigio" />
            <option value="Marrone" />
            <option value="Rosa" />
            <option value="Arancione" />
            <option value="Multicolore" />
          </datalist>

          <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <h1 style={{ margin: 0, fontSize: '28px' }}>Catalogo Scarpe</h1>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Cerca per brand o modello..." 
                value={ricercaTesto}
                onChange={(e) => setRicercaTesto(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }} 
              />
              <button 
                onClick={() => setMostraFiltri(!mostraFiltri)} 
                style={{ padding: '12px 20px', backgroundColor: '#e9ecef', color: '#333', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
              >
                Filtri {mostraFiltri ? 'Su' : 'Giu'}
              </button>
            </div>

            {mostraFiltri && (
              <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Prezzo Min</label>
                  <input type="number" value={filtroPrezzoMin} onChange={(e) => setFiltroPrezzoMin(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Prezzo Max</label>
                  <input type="number" value={filtroPrezzoMax} onChange={(e) => setFiltroPrezzoMax(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Brand</label>
                  <select value={filtroBrand} onChange={(e) => setFiltroBrand(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="">Tutti</option>
                    {brandUnici.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>Colore</label>
                  <input list="lista-colori" placeholder="Scegli..." value={filtroColore} onChange={(e) => setFiltroColore(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={() => { setFiltroPrezzoMin(''); setFiltroPrezzoMax(''); setFiltroBrand(''); setFiltroColore(''); }} style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '35px' }}>
                    Resetta
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {isAdmin && (
            <div style={{ padding: '15px', backgroundColor: '#f1f3f5', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Area Admin: Gestione Catalogo</h3>
              <form onSubmit={aggiungiScarpa} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Brand (Es. Nike)" value={nuovoBrand} onChange={(e) => setNuovoBrand(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <input type="text" placeholder="Modello (Es. Air Force 1)" value={nuovoModello} onChange={(e) => setNuovoModello(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="number" placeholder="Prezzo" value={nuovoPrezzo} onChange={(e) => setNuovoPrezzo(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <input list="lista-colori" placeholder="Colore (scegli o scrivi)" value={nuovoColore} onChange={(e) => setNuovoColore(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Aggiungi</button>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="checkbox" checked={mantieniDati} onChange={(e) => setMantieniDati(e.target.checked)} />
                    Mantieni i dati inseriti dopo il salvataggio (utile per caricamenti multipli)
                  </label>
                </div>
              </form>

              <hr style={{ borderTop: '1px solid #ddd', margin: '20px 0' }} />

              <div>
                <h4 style={{ margin: '0 0 10px 0' }}>Importazione Massiva</h4>
                <div style={{ padding: '10px', border: '1px dashed #aaa', borderRadius: '4px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold' }}>Carica File CSV:</label>
                    <input type="file" accept=".csv" onChange={gestisciImportazioneCSV} />
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    Il file deve avere la seguente riga di intestazione esatta: <strong>brand, modello, prezzo, colore</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <ul style={{ 
            listStyleType: 'none', 
            padding: 0, 
            marginTop: '25px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {scarpeFiltrate.map((scarpa) => (
              <li key={scarpa.id} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: isAdmin ? '5px solid #ffc107' : '5px solid #17A2B8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {idInModifica === scarpa.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" value={brandModificato} onChange={(e) => setBrandModificato(e.target.value)} style={{ flex: 1, padding: '8px', width: '100%' }} placeholder="Brand"/>
                      <input type="text" value={modelloModificato} onChange={(e) => setModelloModificato(e.target.value)} style={{ flex: 1, padding: '8px', width: '100%' }} placeholder="Modello"/>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="number" value={prezzoModificato} onChange={(e) => setPrezzoModificato(e.target.value)} style={{ flex: 1, padding: '8px', width: '100%' }} placeholder="Prezzo"/>
                      <input list="lista-colori" value={coloreModificato} onChange={(e) => setColoreModificato(e.target.value)} style={{ flex: 1, padding: '8px', width: '100%' }} placeholder="Colore"/>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => salvaModifica(scarpa.id)} style={{ flex: 1, padding: '8px', backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salva</button>
                      <button onClick={() => setIdInModifica(null)} style={{ flex: 1, padding: '8px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annulla</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    
                    <div 
                      onClick={() => isAdmin && inserisciImmagine(scarpa.id)}
                      title={isAdmin ? "Clicca per aggiungere/modificare l'immagine" : ""}
                      style={{ 
                        width: '160px', 
                        height: '120px', 
                        backgroundColor: '#e9ecef', 
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: isAdmin ? 'pointer' : 'default',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #dee2e6'
                      }}
                    >
                      {scarpa.immagine ? (
                        <img src={scarpa.immagine} alt={scarpa.modello} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '30px', color: '#adb5bd', fontWeight: 'bold' }}>+</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <strong style={{ fontSize: '18px', lineHeight: '1.2', marginBottom: '5px' }}>{scarpa.brand}<br/>{scarpa.modello}</strong>
                      <div style={{ color: '#555', fontSize: '14px', display: 'flex', flexDirection: 'column' }}>
                        <span>Prezzo: €{scarpa.prezzo || 'N/D'}</span>
                        <span>Colore: {scarpa.colore || 'N/D'}</span>
                      </div>
                      
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                          <button onClick={() => avviaModifica(scarpa)} style={{ flex: 1, padding: '6px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Modifica</button>
                          <button onClick={() => eliminaScarpa(scarpa.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancella</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
            
          </ul>
          {scarpeFiltrate.length === 0 && !inCaricamento && (
            <p style={{ color: 'gray', textAlign: 'center', fontStyle: 'italic', marginTop: '30px' }}>Nessuna scarpa trovata con questi filtri.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;