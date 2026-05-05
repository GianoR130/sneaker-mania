import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Papa from 'papaparse';
import CreaPost from './CreaPost';
import Esplora from './Esplora';


function MainApp() {
  // --- IMPOSTAZIONI ADMIN ---
  const EMAIL_ADMIN = 'admin@email.com';

  // STATO RICERCA
  const [queryRicerca, setQueryRicerca] = useState("");
  // STATI DATABASE E FORM
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
 
  const [vistaCorrente, setVistaCorrente] = useState('social');


  // --- STATI FUNZIONALITÀ RACCOLTE E SALVATAGGIO ---
  const [raccolte, setRaccolte] = useState([]);
  const [scarpaSelezionata, setScarpaSelezionata] = useState(null);
  const [nomeNuovaRaccolta, setNomeNuovaRaccolta] = useState('');


  // --- STATI SOCIAL MEDIA ---
  const [posts, setPosts] = useState([]);
  const [postInCommento, setPostInCommento] = useState(null);
  const [commentoTesto, setCommentoTesto] = useState('');
 
  // --- STATI PER I PROFILI E FOLLOWER ---
  const [profiloSelezionato, setProfiloSelezionato] = useState({ id: null, username: '' }); // MAI null!
  const [seguitiInfo, setSeguitiInfo] = useState({ followers: 0, following: 0, isFollowing: false, isFriend: false });
  const [mieRelazioni, setMieRelazioni] = useState({ followers: 0, following: 0 }); // Contatori per IL TUO profilo
  const [mioProfilo, setMioProfilo] = useState(null);
  


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


  useEffect(() => {
    if (utente) {
      scaricaCatalogo();
      caricaRaccolte();
      scaricaPosts();
      caricaMioProfilo(utente.id);
    }
  }, [utente]);


  // Carica i dati del TUO profilo personale
  const caricaMioProfilo = async (userId) => {
    const { data } = await supabase.from('profili').select('*').eq('id', userId).single();
    if (data) setMioProfilo(data);


    // Queste righe sono fondamentali!
    const { count: followers } = await supabase.from('seguiti').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const { count: following } = await supabase.from('seguiti').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    setMieRelazioni({ followers: followers || 0, following: following || 0 });
  };


  // --- FUNZIONI FOLLOWER E PROFILI ---


  // Carica i dati del profilo di un ALTRO utente
  const caricaRelazioniProfilo = async (targetUserId) => {
    const { count: followersCount } = await supabase.from('seguiti').select('*', { count: 'exact', head: true }).eq('following_id', targetUserId);
    const { count: followingCount } = await supabase.from('seguiti').select('*', { count: 'exact', head: true }).eq('follower_id', targetUserId);
    const { data: ioSeguoLui } = await supabase.from('seguiti').select('*').eq('follower_id', utente.id).eq('following_id', targetUserId).single();
    const { data: luiSegueMe } = await supabase.from('seguiti').select('*').eq('follower_id', targetUserId).eq('following_id', utente.id).single();


    setSeguitiInfo({
      followers: followersCount || 0,
      following: followingCount || 0,
      isFollowing: !!ioSeguoLui,
      isFriend: (!!ioSeguoLui && !!luiSegueMe)
    });
  };


  // Funzione per seguire o smettere di seguire
  const toggleSegui = async (targetUserId) => {
    // 1. Controllo di sicurezza: non puoi seguire te stesso
    if (targetUserId === utente.id) return;

    try {
      if (seguitiInfo.isFollowing) {
        // Se già lo seguiamo, RIMUOVIAMO il follow
        const { error } = await supabase
          .from('seguiti')
          .delete()
          .eq('follower_id', utente.id)
          .eq('following_id', targetUserId);
          
        if (error) throw error;
      } else {
        // Se NON lo seguiamo, AGGIUNGIAMO il follow
        const { error } = await supabase
          .from('seguiti')
          .insert([{ follower_id: utente.id, following_id: targetUserId }]);
          
        if (error) throw error;
      }

      // 2. Dopo aver aggiornato il DB, RICARICHIAMO i dati per aggiornare l'interfaccia
      await caricaRelazioniProfilo(targetUserId); 
      await caricaMioProfilo(utente.id);
      
    } catch (error) {
      console.error("Errore nel toggle segui:", error.message);
      alert("Si è verificato un errore: " + error.message);
    }
  };


  // Funzione per aprire i profili
  const apriProfiloUtente = (userId, nomeUtente, emailUtente) => {
    if (userId === utente.id) {
      setVistaCorrente('profilo');
    } else {
      // Ora salviamo anche l'email nel profilo selezionato!
      setProfiloSelezionato({ 
        id: userId, 
        username: nomeUtente || "Utente",
        email: emailUtente 
      });
      setVistaCorrente('profilo_altro_utente');
      caricaRelazioniProfilo(userId);
    }
  };
 


  // --- FUNZIONI SOCIAL MEDIA ---
  const scaricaPosts = async () => {
    const { data, error } = await supabase
      .from('post')
      .select(`
        *,
        post_likes ( user_id ),
        post_commenti ( * ),
        profili ( email, username )
      `)
      .order('created_at', { ascending: false });


    if (!error && data) {
      setPosts(data);
    } else {
      console.error("Errore download post:", error);
    }
  };


  const toggleMiPiace = async (postId) => {
    const postCorrente = posts.find(p => p.id === postId);
    const utenteHaMessoLike = postCorrente.post_likes.some(like => like.user_id === utente.id);


    if (utenteHaMessoLike) {
      await supabase.from('post_likes').delete().match({ post_id: postId, user_id: utente.id });
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: utente.id }]);
    }
    scaricaPosts();
  };

  const eliminaPost = async (postId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo post?")) return;

    const { error } = await supabase.from('post').delete().eq('id', postId);
    
    if (!error) {
      // Rimuoviamo il post dalla schermata in tempo reale
      setPosts(posts.filter(p => p.id !== postId));
    } else {
      alert("Errore durante l'eliminazione: " + error.message);
    }
  };

  const gestisciClickHashtag = (tag) => {
  setQueryRicerca(tag); // Salva l'hashtag (es. "#musica")
  setVistaCorrente('cerca'); // Cambia pagina
  };


  const aggiungiCommento = async (postId) => {
    if (!commentoTesto.trim()) return;
   
    const { error } = await supabase.from('post_commenti').insert([{
      post_id: postId,
      user_id: utente.id,
      testo: commentoTesto
    }]);


    if (!error) {
      setCommentoTesto('');
      scaricaPosts();
    } else {
      alert("Errore nell'invio del commento.");
    }
  };


  const eliminaCommento = async (commentoId) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo commento?")) return;
   
    const { error } = await supabase
      .from('post_commenti')
      .delete()
      .eq('id', commentoId);


    if (error) {
      alert("Errore durante l'eliminazione del commento: " + error.message);
    } else {
      scaricaPosts();
    }
  };




  const caricaRaccolte = async () => {
  // Aggiungiamo .select('*, scarpe(*)') per tirare fuori tutti i dettagli delle scarpe
  const { data, error } = await supabase
    .from('raccolte_scarpe')
    .select('*, scarpe(*)') 
    .order('nome_raccolta');

  if (!error && data) {
    setRaccolte(data);
  } else {
    console.error("Errore nel caricamento raccolte:", error);
  }
};


  const toggleScarpaInRaccolta = async (idRaccolta, scarpaObj) => {
    const raccoltaEsistente = raccolte.find(r => r.id === idRaccolta);
    if (!raccoltaEsistente) return;


    const presente = raccoltaEsistente.scarpe.some(s => s.id === scarpaObj.id);
   
    const scarpeAggiornate = presente
      ? raccoltaEsistente.scarpe.filter(s => s.id !== scarpaObj.id)
      : [...raccoltaEsistente.scarpe, scarpaObj];


    const { data, error } = await supabase
      .from('raccolte_scarpe')
      .update({ scarpe: scarpeAggiornate })
      .eq('id', idRaccolta)
      .select();


    if (!error && data) {
      setRaccolte(raccolte.map(r => r.id === idRaccolta ? data[0] : r));
    } else {
      console.error("Errore salvataggio:", error);
    }
  };


  const creaRaccolta = async () => {
    if (!nomeNuovaRaccolta.trim()) return;
   
    const { data, error } = await supabase
      .from('raccolte_scarpe')
      .insert([{
        user_id: utente.id,
        nome_raccolta: nomeNuovaRaccolta,
        scarpe: []
      }])
      .select();


    if (!error && data) {
      setRaccolte([...raccolte, data[0]]);
      setNomeNuovaRaccolta('');
    } else {
      alert("Errore nella creazione della raccolta");
      console.error(error);
    }
  };


  const eliminaRaccolta = async (idRaccolta) => {
    // 1. Chiede conferma prima di cancellare
    const conferma = window.confirm("Sei sicuro di voler eliminare questa raccolta?");
    if (!conferma) return; // Se l'utente clicca 'Annulla', si ferma qui

    // 2. Cancella la raccolta dal database Supabase
    const { error } = await supabase.from('raccolte_scarpe').delete().eq('id', idRaccolta);
    
    // 3. Se non ci sono stati errori, la fa scomparire istantaneamente dallo schermo
    if (!error) {
      setRaccolte(raccolte.filter(r => r.id !== idRaccolta));
    } else {
      alert("Errore nell'eliminazione: " + error.message);
    }
  };


  // --- CRUD DATABASE (CATALOGO) ---
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
    if (error) alert("Errore durante il salvataggio dell'immagine: " + error.message);
    else scaricaCatalogo();
  };


  const rimuoviImmagine = async (e, idScarpa) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm("Sei sicuro di voler rimuovere l'immagine da questa scarpa?")) return;


    const { error } = await supabase.from('scarpe').update({ immagine: null }).eq('id', idScarpa);
    if (error) alert("Errore durante la rimozione dell'immagine: " + error.message);
    else scaricaCatalogo();
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

  


  const scarpeFiltrate = datiScarpe.filter((scarpa) => {
    const matchTesto = `${scarpa.brand} ${scarpa.modello}`.toLowerCase().includes(ricercaTesto.toLowerCase());
    const matchMin = filtroPrezzoMin === '' || scarpa.prezzo >= Number(filtroPrezzoMin);
    const matchMax = filtroPrezzoMax === '' || scarpa.prezzo <= Number(filtroPrezzoMax);
    const matchBrand = filtroBrand === '' || (scarpa.brand && scarpa.brand.toLowerCase() === filtroBrand.toLowerCase());
    const matchColore = filtroColore === '' || (scarpa.colore && scarpa.colore.toLowerCase() === filtroColore.toLowerCase());


    return matchTesto && matchMin && matchMax && matchBrand && matchColore;
  });


  const brandUnici = [...new Set(datiScarpe.map(s => s.brand).filter(Boolean))];


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


  // --- SCHERMATA DI LOGIN ---
  if (!utente) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h2>Benvenuto!</h2>
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


  // --- RENDER DELL'APP PRINCIPALE ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px', paddingBottom: '90px', fontFamily: 'sans-serif' }}>
     
      {/* BARRA DI NAVIGAZIONE SUPERIORE */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 20px auto',
        backgroundColor: 'white',
        padding: '15px 20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
       
        {/* Sinistra: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ margin: 0, color: '#111', fontSize: '22px' }}>Sneaker(Not the chocolate bar)</h2>
        </div>


        {/* Destra: Azioni Utente (Admin, Esci, Profilo) */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {isAdmin && <span style={{ backgroundColor: '#ffc107', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>ADMIN</span>}
         
          <button onClick={logout} style={{ padding: '8px 16px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Esci
          </button>
         
   
        </div>
      </div>
      
      {/* SCHERMATA CREA POST*/}
        {vistaCorrente === 'crea_post' && (
          <CreaPost 
            utente={utente} 
            tornaAlFeed={() => {
              setVistaCorrente('social');
              scaricaPosts(); // Ricarichiamo i post così il nuovo appare subito!
            }} 
          />
        )}

      {/* --- 1. SCHERMATA SOCIAL MEDIA (FEED REALE) --- */}
      {vistaCorrente === 'social' && (
        <div style={containerStyle}>
          <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '28px' }}>Il tuo Feed</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Scopri le ultime tendenze e i post degli utenti.</p>
          </div>
          
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', marginTop: '30px' }}>Nessun post da mostrare. Aggiungine uno dal database!</p>
          ) : (
            posts.map(post => {
              const haMessoMiPiace = post.post_likes.some(like => like.user_id === utente.id);
              const numeroMiPiace = post.post_likes.length;
              const numeroCommenti = post.post_commenti.length;

              const emailAutore = post.profili?.email || "utente@anonimo.it";
              const nomeUtenteCorto = emailAutore.split('@')[0];

              return (
                <div key={post.id} style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '10px', marginBottom: '20px', backgroundColor: '#fafafa' }}>
                  
                  {/* Intestazione Utente */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div
                      onClick={() => apriProfiloUtente(post.user_id, nomeUtenteCorto, emailAutore)}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#007BFF', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {nomeUtenteCorto.charAt(0).toUpperCase()} 
                    </div>
                    <strong
                      onClick={() => apriProfiloUtente(post.user_id, nomeUtenteCorto, emailAutore)}
                      style={{ cursor: 'pointer' }}
                    >
                      {nomeUtenteCorto}
                    </strong>

                    {(isAdmin || post.user_id === utente.id) && (
                      <button 
                        onClick={() => eliminaPost(post.id)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px' }}
                        title="Elimina post"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                  
                  {/* Testo del Post */}
                  <p style={{ marginTop: 0, marginBottom: post.hashtags ? '5px' : '15px', fontSize: '16px' }}>
                    {post.descrizione}
                  </p>
                  
                  {/* --- HASHTAG ORA CLICCABILI (Layout Originale) --- */}
                  {post.hashtags && (
                    <p style={{ color: '#007BFF', margin: '0 0 15px 0', fontSize: '15px', fontWeight: '500' }}>
                      {post.hashtags.split(" ").map((tag, index) => (
                        <span 
                          key={index}
                          onClick={() => gestisciClickHashtag(tag)}
                          style={{ cursor: 'pointer', marginRight: '5px' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </p>
                  )}
                  
                  {/* Immagine del Post */}
                  {post.immagine_url && (
                    <div style={{ width: '100%', marginBottom: '15px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center' }}>
                      <img 
                        src={post.immagine_url} 
                        alt="Post" 
                        style={{ maxWidth: '100%', maxHeight: '550px', objectFit: 'contain' }} 
                      />
                    </div>
                  )}
                  
                  {/* Azioni del Post: Mi Piace e Commenti */}
                  <div style={{ display: 'flex', gap: '25px', marginTop: '15px', color: '#555', fontWeight: 'bold' }}>
                    <span onClick={() => toggleMiPiace(post.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={haMessoMiPiace ? "#e0245e" : "none"} stroke={haMessoMiPiace ? "#e0245e" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s, fill 0.2s', transform: haMessoMiPiace ? 'scale(1.15)' : 'scale(1)' }}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {numeroMiPiace} Mi piace
                    </span>
                    
                    <span onClick={() => setPostInCommento(postInCommento === post.id ? null : post.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      {numeroCommenti} Commenti
                    </span>
                  </div>

                  {/* Sezione Espansa dei Commenti */}
                  {postInCommento === post.id && (
                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                      {post.post_commenti.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                          {post.post_commenti.map(commento => {
                            const puoEliminare = isAdmin || commento.user_id === utente.id;
                            const nomeCommentatore = "Utente_" + commento.user_id.substring(0, 5);

                            return (
                              <div key={commento.id} style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '8px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <strong
                                    onClick={() => apriProfiloUtente(commento.user_id, nomeCommentatore, "")}
                                    style={{ display: 'block', marginBottom: '3px', cursor: 'pointer', color: '#007BFF' }}
                                  >
                                    {nomeCommentatore}
                                  </strong>
                                  {commento.testo}
                                </div>
                                {puoEliminare && (
                                  <button
                                    onClick={() => eliminaCommento(commento.id)}
                                    style={{ backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px' }}
                                    title="Elimina commento"
                                  >
                                    ❌
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>Nessun commento ancora. Scrivi il primo!</p>
                      )}

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Scrivi un commento..."
                          value={commentoTesto}
                          onChange={(e) => setCommentoTesto(e.target.value)}
                          style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc' }}
                        />
                        <button
                          onClick={() => aggiungiCommento(post.id)}
                          style={{ padding: '8px 16px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Invia
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. VISTA CERCA (QUESTO È IL CODICE D) */}
      {vistaCorrente === 'cerca' && (
        <Esplora 
          queryIniziale={queryRicerca} 
          utente={utente}
          alClickProfilo={apriProfiloUtente}
        />
      )}

      {/* --- 2. SCHERMATA DEL CATALOGO SCARPE --- */}
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
                    Mantieni i dati inseriti dopo il salvataggio
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
                    Intestazione richiesta: <strong>brand, modello, prezzo, colore</strong>.
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
            {scarpeFiltrate.map((scarpa) => {
              const isSalvataOvunque = raccolte.some(r => r.scarpe.some(s => s.id === scarpa.id));


              return (
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
                        border: '1px solid #dee2e6',
                        position: 'relative'
                      }}
                    >
                      {scarpa.immagine ? (
                        <>
                          <img src={scarpa.immagine} alt={scarpa.modello} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {isAdmin && (
                            <button
                              onClick={(e) => rimuoviImmagine(e, scarpa.id)}
                              title="Rimuovi immagine"
                              style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(220, 53, 69, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' }}
                            >
                              X
                            </button>
                          )}
                        </>
                      ) : (
                        isAdmin ? (
                          <span style={{ fontSize: '30px', color: '#adb5bd', fontWeight: 'bold' }}>+</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#adb5bd' }}>
                            <span style={{ fontSize: '30px' }}>👟</span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Nessuna foto</span>
                          </div>
                        )
                      )}
                    </div>


                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <strong style={{ fontSize: '18px', lineHeight: '1.2', marginBottom: '5px' }}>{scarpa.brand}<br/>{scarpa.modello}</strong>
                        <div style={{ color: '#555', fontSize: '14px', display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
                          <span>Prezzo: €{scarpa.prezzo || 'N/D'}</span>
                          <span>Colore: {scarpa.colore || 'N/D'}</span>
                        </div>
                      </div>
                     
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                        <button
                          onClick={() => setScarpaSelezionata(scarpaSelezionata === scarpa.id ? null : scarpa.id)}
                          style={{
                            padding: '6px',
                            backgroundColor: isSalvataOvunque ? '#ffc107' : '#e9ecef',
                            color: isSalvataOvunque ? '#000' : '#333',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {isSalvataOvunque ? 'Nelle tue raccolte ▾' : 'Salva in una Raccolta ▾'}
                        </button>


                        {/* MENU SCELTA RACCOLTE INLINE */}
                        {scarpaSelezionata === scarpa.id && (
                          <div style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <strong style={{ fontSize: '12px' }}>Salva in:</strong>
                           
                            {raccolte.map(raccolta => (
                              <label key={raccolta.id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={raccolta.scarpe.some(s => s.id === scarpa.id)}
                                  onChange={() => toggleScarpaInRaccolta(raccolta.id, scarpa)}
                                />
                                {raccolta.nome_raccolta}
                              </label>
                            ))}


                            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                              <input
                                type="text"
                                placeholder="Nuova raccolta..."
                                value={nomeNuovaRaccolta}
                                onChange={(e) => setNomeNuovaRaccolta(e.target.value)}
                                style={{ flex: 1, padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px' }}
                              />
                              <button onClick={creaRaccolta} style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Crea</button>
                            </div>
                          </div>
                        )}


                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => avviaModifica(scarpa)} style={{ flex: 1, padding: '6px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Modifica</button>
                            <button onClick={() => eliminaScarpa(scarpa.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancella</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
              );
            })}
           
          </ul>
          {scarpeFiltrate.length === 0 && !inCaricamento && (
            <p style={{ color: 'gray', textAlign: 'center', fontStyle: 'italic', marginTop: '30px' }}>Nessuna scarpa trovata.</p>
          )}
        </div>
      )}


      {/* SCHERMATA DEL TUO PROFILO */}
        {vistaCorrente === 'profilo' && (
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Il Tuo Profilo</h1>
            
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '15px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#28A745', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', fontWeight: 'bold', margin: '0 auto 15px auto' }}>
                {/* Prende l'iniziale dall'email per sicurezza */}
                {(utente?.email || mioProfilo?.username || "U").charAt(0).toUpperCase()}
              </div>
              
              {/* Mostra il nome utente oppure, se non c'è, la prima parte dell'email */}
              <h2 style={{ margin: '0 0 5px 0' }}>
                @{mioProfilo?.username || utente?.email?.split('@')[0] || "Utente"}
              </h2>
              
              {/* --- NUOVO: MOSTRA L'EMAIL COMPLETA QUI SOTTO --- */}
              <p style={{ color: '#666', margin: '0 0 20px 0', fontSize: '15px' }}>
                {utente?.email}
              </p>
              {/* ---------------------------------------------- */}
              
              {/* I TUOI FOLLOWER E SEGUITI */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', margin: '20px 0', padding: '15px 0', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold' }}>{mieRelazioni?.followers || 0}</span>
                  <span style={{ fontSize: '13px', color: '#777' }}>Follower</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold' }}>{mieRelazioni?.following || 0}</span>
                  <span style={{ fontSize: '13px', color: '#777' }}>Seguiti</span>
                </div>
              </div>

              <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
            </div>

            {/* --- SEZIONE "LE TUE RACCOLTE" - VERSIONE MIGLIORATA --- */}
<div style={{ marginTop: '40px' }}>
  <h2 style={{ fontSize: '22px', fontWeight: 'bold', borderBottom: '2px solid #111', paddingBottom: '10px', marginBottom: '20px' }}>
    Le Tue Raccolte
  </h2>
  
  {raccolte.length > 0 ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {raccolte.map(r => (
        <div key={r.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'relative' }}>
          
          {/* Header Raccolta: Titolo + Tasto Elimina */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '30px' }}>📁</span>
              <div>
                <strong style={{ fontSize: '20px', color: '#111' }}>{r.nome_raccolta}</strong>
                <span style={{ display: 'block', fontSize: '14px', color: '#888' }}>{r.scarpe?.length || 0} scarpe salvate</span>
              </div>
            </div>
            
            {/* TASTO ELIMINA */}
            <button 
              onClick={() => eliminaRaccolta(r.id)}
              style={{ backgroundColor: '#fff', color: '#dc3545', border: '1px solid #dc3545', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              Elimina
            </button>
          </div>

          {/* Griglia delle scarpe - PIÙ GRANDE E BLOCCATA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {r.scarpe && r.scarpe.length > 0 ? (
              r.scarpe.map(s => (
                <div key={s.id} style={{ textAlign: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fafafa' }}>
                  
                  {/* CONTENITORE IMMAGINE RIGIDO */}
                  <div style={{ width: '100%', height: '210px', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.immagine ? (
                      <img 
                        src={s.immagine} 
                        alt={s.modello} 
                        style={{ width: '100%', height: '200%', objectFit: 'contain', display: 'block' }} 
                      />
                    ) : (
                      <span style={{ fontSize: '40px' }}>👟</span>
                    )}
                  </div>
                  {/* --------------------------- */}

                  {/* NUOVA ZONA TESTO PIÙ SPAZIOSA E ALLINEATA */}
                  <div style={{ 
                    marginTop: '5px',      /* Spazio vuoto tra l'immagine e il testo */
                    minHeight: '100px',      /* Altezza minima fissa per la zona testo */
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' /* Mantiene il testo ben centrato in questo spazio */
                  }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>{s.brand}</div>
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>{s.modello}</div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '14px', color: '#bbb', gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>
                Questa raccolta è vuota.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', color: '#999' }}>
      <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📂</span>
      <p>Non hai ancora creato nessuna raccolta.</p>
    </div>
  )}
</div>
            {/* ------------------------------------------- */}

          </div>
        )}


      {/* --- 4. SCHERMATA PROFILO ALTRO UTENTE --- */}
      {vistaCorrente === 'profilo_altro_utente' && profiloSelezionato.id && (
        <div style={containerStyle}>
          {/* Header con tasto indietro e badge amico */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <button
              onClick={() => setVistaCorrente('social')}
              style={{ padding: '8px 12px', background: '#f0f2f5', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Torna al Feed
            </button>
            {seguitiInfo?.isFriend && (
              <span style={{ backgroundColor: '#d4edda', color: '#155724', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                🤝 Siete Amici
              </span>
            )}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            
            {/* Immagine Profilo (Prende l'iniziale dall'email per sicurezza) */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007BFF', color: 'white',
              display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', fontWeight: 'bold', margin: '0 auto 15px auto'
            }}>
               {(profiloSelezionato.email || profiloSelezionato.username || "U").charAt(0).toUpperCase()}
            </div>

            {/* Nome Utente: Taglia l'email alla @ se manca lo username */}
            <h2 style={{ margin: '0 0 5px 0' }}>
              @{profiloSelezionato.username || profiloSelezionato.email?.split('@')[0] || 'Utente'}
            </h2>
            
            {/* --- NUOVO: MOSTRA L'EMAIL COMPLETA QUI SOTTO --- */}
            <p style={{ color: '#666', margin: '0 0 15px 0', fontSize: '15px' }}>
              {profiloSelezionato.email}
            </p>
            {/* ---------------------------------------------- */}
            
            {/* DOVE APPAIONO FOLLOWER E SEGUITI: Sotto il nome utente e l'email */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '15px 0', color: '#666' }}>
              <span><strong>{seguitiInfo?.followers || 0}</strong> Follower</span>
              <span><strong>{seguitiInfo?.following || 0}</strong> Seguiti</span>
            </div>

            {/* Pulsante Segui / Smetti di seguire */}
              <button 
                onClick={() => toggleSegui(profiloSelezionato.id)} 
                style={{ 
                  padding: '10px 30px', 
                  borderRadius: '25px', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  backgroundColor: seguitiInfo?.isFollowing ? '#e9ecef' : '#111', 
                  color: seguitiInfo?.isFollowing ? '#111' : '#fff',
                  transition: 'all 0.2s ease'
                }}
              >
                {seguitiInfo?.isFollowing ? 'Smetti di seguire' : 'Segui'}
              </button>
          </div>

          <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
             <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic' }}>Le raccolte di questo utente sono private.</p>
          </div>
        </div>
      )}
      {/* BOTTOM NAVIGATION BAR AGGIORNATA A 5 TASTI */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #eaeaea',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)', /* Aggiornato a 5 colonne */
        alignItems: 'center',
        justifyItems: 'center',
        padding: '10px 200px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        zIndex: 1000
      }}>
       
        {/* 1. Bottone Feed (Estrema Sinistra) */}
        <button
          onClick={() => setVistaCorrente('social')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: vistaCorrente === 'social' ? '#111' : '#aaa' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={vistaCorrente === 'social' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: vistaCorrente === 'social' ? 'bold' : 'normal' }}>Feed</span>
        </button>


        {/* 2. Bottone Profilo (A sinistra del +) */}
        <button
          onClick={() => setVistaCorrente('profilo')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: vistaCorrente === 'profilo' ? '#111' : '#aaa' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={vistaCorrente === 'profilo' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: vistaCorrente === 'profilo' ? 'bold' : 'normal' }}>Profilo</span>
        </button>


        {/* 3. Bottone Centrale "+" (Creazione Post) */}
        <button
          onClick={() => setVistaCorrente('crea_post')}
          style={{ backgroundColor: '#111', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', transform: 'translateY(-15px)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>


        {/* 4. Bottone Ricerca (A destra del +) */}
        <button
          onClick={() => {
            setQueryRicerca(""); // Azzera vecchie ricerche
            setVistaCorrente('cerca'); // Apre la nuova pagina Esplora
          }}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            // Diventa scuro se sei nella pagina Cerca, altrimenti resta grigio
            color: vistaCorrente === 'cerca' ? '#111' : '#aaa' 
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span style={{ 
            fontSize: '10px', 
            marginTop: '4px', 
            // Diventa in grassetto se sei nella pagina Cerca
            fontWeight: vistaCorrente === 'cerca' ? 'bold' : 'normal' 
          }}>
            Cerca
          </span>
        </button>


        {/* 5. Bottone Catalogo (Estrema Destra) */}
        <button
          onClick={() => setVistaCorrente('catalogo')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: vistaCorrente === 'catalogo' ? '#111' : '#aaa' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={vistaCorrente === 'catalogo' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: vistaCorrente === 'catalogo' ? 'bold' : 'normal' }}>Catalogo</span>
        </button>


      </div>


    </div>
  );
}


export default MainApp;