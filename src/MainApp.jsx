import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Papa from 'papaparse';
import CreaPost from './CreaPost';
import Esplora from './Esplora';
import FeedSocial from './FeedSocial';
import CatalogoScarpe from './CatalogoScarpe';
import ProfiloUtente from './ProfiloUtente';
import ProfiloAltroUtente from './ProfiloAltroUtente';
import Impostazioni from './Impostazioni';
import SchermataLogin from './SchermataLogin';
import NavBar from './NavBar';
import ModaleRelazioni from './ModaleRelazioni';
import Attivita from './Attivita';
import ChatSingola from './ChatSingola';

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

  const [chatAttiva, setChatAttiva] = useState(null);
  const [conversazioni, setConversazioni] = useState([]);
  const [messaggiNonLetti, setMessaggiNonLetti] = useState(0);

  // --- STATI PER I PROFILI E FOLLOWER ---
  const [profiloSelezionato, setProfiloSelezionato] = useState({ id: null, username: '' });
  const [seguitiInfo, setSeguitiInfo] = useState({ followers: 0, following: 0, isFollowing: false, isFriend: false });
  const [mieRelazioni, setMieRelazioni] = useState({ followers: 0, following: 0 });
  const [mioProfilo, setMioProfilo] = useState(null);

  const [modaleRelazioni, setModaleRelazioni] = useState({ visibile: false, titolo: '', utenti: [] });

  const [miSegue, setMiSegue] = useState(false);
  const [loSeguo, setLoSeguo] = useState(false);

  const [genereNuovo, setGenereNuovo] = useState('Unisex');
  const [genereModificato, setGenereModificato] = useState('Unisex');

  const isAdmin = utente?.email === EMAIL_ADMIN;

  // ─── GLOBAL STYLE INJECTION ───────────────────────────────────────────────
  useEffect(() => {
    const styleId = 'sneaker-global-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      /* Force light mode regardless of OS/browser dark mode */
      html, body, #root {
        background-color: #f0f2f5 !important;
        color: #111111 !important;
        color-scheme: light !important;
        min-height: 100%;
        margin: 0 !important;
        padding: 0 !important;
        font-family: sans-serif;
        width: 100% !important;
      }

      /* Prevent horizontal scroll on mobile */
      html, body {
        overflow-x: hidden;
        max-width: 100vw;
      }

      /* Make sure text inside inputs/textareas is always dark */
      input, textarea, select, button {
        color: #111111;
        color-scheme: light;
      }

      /* Prevent content from overflowing on small screens */
      * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);

    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';

    return () => {};
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUtente(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUtente(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- SCROLL IN CIMA AUTOMATICO ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [vistaCorrente]);

  useEffect(() => {
    if (utente?.id) {
      scaricaCatalogo();
      caricaRaccolte(utente.id);
      scaricaPosts();
      caricaMioProfilo(utente.id);
    } else {
      setRaccolte([]);
      setMioProfilo(null);
      setMieRelazioni({ followers: 0, following: 0 });
      console.log("Stati svuotati post-logout");
    }
  }, [utente?.id]);

  useEffect(() => {
    if (!utente?.id) {
      setMessaggiNonLetti(0);
      return;
    }

    conteggiaMessaggiNonLetti();

    const channel = supabase
      .channel('notifiche-messaggi-globali')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaggi' }, (payload) => {
        if (payload.new?.mittente_id !== utente.id) {
          conteggiaMessaggiNonLetti();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messaggi' }, () => {
        conteggiaMessaggiNonLetti();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [utente?.id]);

  const cambiaSchermata = (nuovaVista) => {
    // Non svuotare immediatamente le raccolte: manteniamo lo stato locale
    // e carichiamo/aggiorniamo quando necessario per evitare flicker.
    setVistaCorrente(nuovaVista);
  };

  const avviaChat = async (targetUserId, targetUsername, targetEmail) => {
    if (!utente?.id || !targetUserId) return;

    const { data: conversazioneEsistente, error: erroreRicerca } = await supabase
      .from('conversazioni')
      .select('*')
      .or(`and(user1_id.eq.${utente.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${utente.id})`)
      .limit(1)
      .single();

    if (erroreRicerca && erroreRicerca.code !== 'PGRST116') {
      console.error('Errore ricerca conversazione:', erroreRicerca.message || erroreRicerca);
      return;
    }

    let conversazioneSelezionata = conversazioneEsistente;

    if (!conversazioneEsistente) {
      const { data: nuovaConversazione, error: erroreCreazione } = await supabase
        .from('conversazioni')
        .insert([
          {
            user1_id: utente.id,
            user2_id: targetUserId
          }
        ])
        .select()
        .single();

      if (erroreCreazione) {
        console.error('Errore creazione conversazione:', erroreCreazione.message || erroreCreazione);
        return;
      }

      conversazioneSelezionata = nuovaConversazione;
    }

    const chatObj = {
      ...conversazioneSelezionata,
      targetUserId,
      targetUsername,
      targetEmail
    };

    setChatAttiva(chatObj);
    setConversazioni((prev) => {
      if (prev.some((item) => item.id === chatObj.id)) return prev;
      return [...prev, chatObj];
    });
    segnaMessaggiComeLetti(conversazioneSelezionata.id);
    setVistaCorrente('chat');
  };

  const caricaMioProfilo = async (userId) => {
    const { data } = await supabase.from('profili').select('*').eq('id', userId).single();
    if (data) setMioProfilo(data);

    const { count: followers } = await supabase.from('seguiti').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const { count: following } = await supabase.from('seguiti').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    setMieRelazioni({ followers: followers || 0, following: following || 0 });
  };

  const conteggiaMessaggiNonLetti = async () => {
    if (!utente?.id) {
      setMessaggiNonLetti(0);
      return;
    }

    const { data: conversazioniUtente, error: conversazioniError } = await supabase
      .from('conversazioni')
      .select('id')
      .or(`user1_id.eq.${utente.id},user2_id.eq.${utente.id}`);

    if (conversazioniError) {
      console.error('Errore conteggio conversazioni:', conversazioniError.message || conversazioniError);
      setMessaggiNonLetti(0);
      return;
    }

    const conversazioneIds = (conversazioniUtente || []).map((item) => item.id);
    if (conversazioneIds.length === 0) {
      setMessaggiNonLetti(0);
      return;
    }

    const { count, error: countError } = await supabase
      .from('messaggi')
      .select('*', { count: 'exact', head: true })
      .eq('letto', false)
      .neq('mittente_id', utente.id)
      .in('conversazione_id', conversazioneIds);

    if (countError) {
      console.error('Errore conteggio messaggi non letti:', countError.message || countError);
      setMessaggiNonLetti(0);
      return;
    }

    setMessaggiNonLetti(count || 0);
  };

  const segnaMessaggiComeLetti = async (conversazioneId) => {
    if (!utente?.id || !conversazioneId) return;

    const { error } = await supabase
      .from('messaggi')
      .update({ letto: true })
      .eq('conversazione_id', conversazioneId)
      .neq('mittente_id', utente.id)
      .eq('letto', false);

    if (error) {
      console.error('Errore segnatura messaggi come letti:', error.message || error);
      return;
    }

    conteggiaMessaggiNonLetti();
  };

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

  const apriListaRelazioni = async (userId, tipo) => {
    setModaleRelazioni({ visibile: true, titolo: 'Caricamento...', utenti: [] });

    try {
      const colonnaFiltro = tipo === 'follower' ? 'following_id' : 'follower_id';
      const colonnaTarget = tipo === 'follower' ? 'follower_id' : 'following_id';

      const { data: relazioni } = await supabase
        .from('seguiti')
        .select('*')
        .eq(colonnaFiltro, userId);

      if (!relazioni || relazioni.length === 0) {
        setModaleRelazioni({ visibile: true, titolo: tipo === 'follower' ? 'Follower' : 'Seguiti', utenti: [] });
        return;
      }

      const ids = relazioni.map(r => r[colonnaTarget]);

      const { data: profili } = await supabase
        .from('profili')
        .select('id, username, email')
        .in('id', ids);

      setModaleRelazioni({
        visibile: true,
        titolo: tipo === 'follower' ? 'Follower' : 'Seguiti',
        utenti: profili || []
      });

    } catch (error) {
      console.error(error);
      setModaleRelazioni({ visibile: false, titolo: '', utenti: [] });
    }
  };

  const toggleSegui = async (targetUserId) => {
    if (targetUserId === utente.id) return;

    try {
      if (seguitiInfo.isFollowing) {
        const { error } = await supabase
          .from('seguiti')
          .delete()
          .eq('follower_id', utente.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('seguiti')
          .insert([{ follower_id: utente.id, following_id: targetUserId }]);

        if (error) throw error;
      }

      await caricaRelazioniProfilo(targetUserId);
      await caricaMioProfilo(utente.id);

    } catch (error) {
      console.error("Errore nel toggle segui:", error.message);
      alert("Si è verificato un errore: " + error.message);
    }
  };

  const apriProfiloUtente = async (userId, nomeUtente, emailUtente) => {
    // Svuotiamo le raccolte per evitare di vedere le vecchie
    setRaccolte([]);

    // 1. Controllo se è il mio profilo
    if (userId === utente.id) {
      setVistaCorrente('profilo');
      caricaRaccolte(utente.id);
      return;
    }

    // 2. Impostiamo i dati dell'altro utente
    setProfiloSelezionato({
      id: userId,
      username: nomeUtente || "Utente",
      email: emailUtente
    });

    // 3. Prepariamo l'interfaccia
    setVistaCorrente('profilo_altro_utente');

    // 4. Carichiamo relazioni e raccolte in parallelo
    caricaRelazioniProfilo(userId);

    try {
      const { data, error } = await supabase
        .from('raccolte_scarpe')
        .select('*')
        .eq('user_id', userId)
        .eq('pubblica', true)
        .order('nome_raccolta');

      if (error) throw error;

      console.log("Raccolte pubbliche trovate:", data);
      setRaccolte(data || []);

    } catch (error) {
      console.error("Errore caricamento profilo esterno:", error.message);
    }
  };

  const togglePrivacyRaccolta = async (idRaccolta, isPublicAttuale) => {
    const nuovaPrivacy = !isPublicAttuale;

    try {
      // Uso .select().single() per ottenere la raccolta aggiornata dal DB
      const { data, error } = await supabase
        .from('raccolte_scarpe')
        .update({ pubblica: nuovaPrivacy })
        .eq('id', idRaccolta)
        .select()
        .single();

      if (error) {
        console.error('Errore salvataggio privacy:', error);
        alert('Errore del server durante l\'aggiornamento della privacy');
        return;
      }

      // Aggiorniamo lo stato in modo immutabile basandoci sul valore precedente
      setRaccolte((prev) => prev.map(r => r.id === idRaccolta ? { ...r, pubblica: data?.pubblica ?? nuovaPrivacy, is_public: data?.pubblica ?? nuovaPrivacy } : r));
    } catch (err) {
      console.error('Eccezione togglePrivacyRaccolta:', err);
      alert('Errore del server');
    }
  };

  const scaricaPosts = async () => {
    const { data, error } = await supabase
      .from('post')
      .select(`
        *,
        post_likes ( user_id ),
        post_commenti ( *, profili ( email, username ) ),
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
      setPosts(posts.filter(p => p.id !== postId));
    } else {
      alert("Errore durante l'eliminazione: " + error.message);
    }
  };

  const gestisciClickHashtag = (tag) => {
    setQueryRicerca(tag);
    cambiaSchermata('cerca');
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

  const caricaRaccolte = async (idDaCercare) => {
    const id = idDaCercare || utente?.id;

    if (!id) {
      setRaccolte([]);
      return;
    }

    const { data, error } = await supabase
      .from('raccolte_scarpe')
      .select('*')
      .eq('user_id', id)
      .order('nome_raccolta');

    if (!error) {
      setRaccolte(data || []);
    } else {
      console.error("Errore database raccolte:", error.message);
      setRaccolte([]);
    }
  };

  const toggleScarpaInRaccolta = async (idRaccolta, scarpaObj) => {
    const raccoltaEsistente = raccolte.find(r => r.id === idRaccolta);
    if (!raccoltaEsistente) return;

    const presente = (raccoltaEsistente.scarpe || []).some(s => s.id === scarpaObj.id);

    const scarpeAggiornate = presente
      ? (raccoltaEsistente.scarpe || []).filter(s => s.id !== scarpaObj.id)
      : [...(raccoltaEsistente.scarpe || []), scarpaObj];

    try {
      const { data, error } = await supabase
        .from('raccolte_scarpe')
        .update({ scarpe: scarpeAggiornate })
        .eq('id', idRaccolta)
        .select();

      if (error) {
        console.error('Errore salvataggio scarpe in raccolta:', error);
        alert('Errore del server durante l\'aggiornamento della raccolta');
        return;
      }

      const updated = Array.isArray(data) ? data[0] : data;
      setRaccolte(prev => prev.map(r => r.id === idRaccolta ? (updated || { ...r, scarpe: scarpeAggiornate }) : r));
    } catch (err) {
      console.error('Eccezione toggleScarpaInRaccolta:', err);
      alert('Errore del server');
    }
  };

  const creaRaccolta = async () => {
    if (!nomeNuovaRaccolta.trim()) return;
    if (!utente?.id) return alert('Utente non autenticato');

    const { data, error } = await supabase
      .from('raccolte_scarpe')
      .insert([{
        user_id: utente?.id,
        nome_raccolta: nomeNuovaRaccolta,
        scarpe: []
      }])
      .select();

    if (!error && data) {
      setRaccolte(prev => [...prev, data[0]]);
      setNomeNuovaRaccolta('');
    } else {
      alert("Errore nella creazione della raccolta");
      console.error(error);
    }
  };

  const eliminaRaccolta = async (idRaccolta) => {
    const conferma = window.confirm("Sei sicuro di voler eliminare questa raccolta?");
    if (!conferma) return;

    const { error } = await supabase.from('raccolte_scarpe').delete().eq('id', idRaccolta);

    if (!error) {
      setRaccolte(prev => prev.filter(r => r.id !== idRaccolta));
    } else {
      alert("Errore nell'eliminazione: " + error.message);
    }
  };

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
        genere: genereNuovo,
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
        setGenereNuovo('Unisex');
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
    setGenereModificato(scarpa.genere || 'Unisex');
  };

  const salvaModifica = async (idScarpa) => {
    const { error } = await supabase
      .from('scarpe')
      .update({
        brand: brandModificato,
        modello: modelloModificato,
        prezzo: prezzoModificato,
        colore: coloreModificato,
        genere: genereModificato
      })
      .eq('id', idScarpa);

    if (error) alert("Errore: " + error.message);
    else {
      setIdInModifica(null);
      scaricaCatalogo();
    }
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
    setRaccolte([]);
    setMioProfilo(null);
    await supabase.auth.signOut();
    cambiaSchermata('social');
  };

  // --- SCHERMATA DI LOGIN ---
  if (!utente) {
    return (
      <SchermataLogin
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        login={login}
        registrati={registrati}
      />
    );
  }

  const containerStyle = {
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto 50px auto',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
    backgroundColor: '#ffffff',
    color: '#111111'
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      backgroundColor: '#f0f2f5',
      color: '#111111',
      padding: '20px',
      paddingBottom: '90px',
      fontFamily: 'sans-serif',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      margin: '0 auto'
    }}>

      {/* BARRA DI NAVIGAZIONE SUPERIORE */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 20px auto',
        backgroundColor: '#ffffff',
        color: '#111111',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#111111', fontSize: '18px', whiteSpace: 'nowrap' }}>Sneaker Mania</h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          {isAdmin && <span style={{ backgroundColor: '#ffc107', color: '#111111', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>ADMIN</span>}
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
            cambiaSchermata('social');
            scaricaPosts();
          }}
        />
      )}

      {/* --- 1. SCHERMATA SOCIAL MEDIA (FEED) --- */}
      {vistaCorrente === 'social' && (
        <FeedSocial
          posts={posts}
          utente={utente}
          isAdmin={isAdmin}
          postInCommento={postInCommento}
          setPostInCommento={setPostInCommento}
          commentoTesto={commentoTesto}
          setCommentoTesto={setCommentoTesto}
          toggleMiPiace={toggleMiPiace}
          eliminaPost={eliminaPost}
          aggiungiCommento={aggiungiCommento}
          eliminaCommento={eliminaCommento}
          apriProfiloUtente={apriProfiloUtente}
          gestisciClickHashtag={gestisciClickHashtag}
          containerStyle={containerStyle}
        />
      )}
      {/* VISTA CERCA */}
      {vistaCorrente === 'cerca' && (
        <Esplora
          queryIniziale={queryRicerca}
          utente={utente}
          alClickProfilo={apriProfiloUtente}
        />
      )}
      {/* VISTA ATTIVITÀ */}
      {vistaCorrente === 'attivita' && (
        <Attivita
          utente={utente}
          avviaChat={avviaChat}
          containerStyle={containerStyle}
        />
      )}

      {/* VISTA CHAT SINGOLA */}
      {(vistaCorrente === 'chat' || vistaCorrente === 'chat_singola') && (
        <ChatSingola
          conversazione={chatAttiva}
          utente={utente}
          setVistaCorrente={cambiaSchermata}
          apriProfiloUtente={apriProfiloUtente}
        />
      )}

      {/* CATALOGO SCARPE */}
      {vistaCorrente === 'catalogo' && (
        <CatalogoScarpe
          isAdmin={isAdmin}
          datiScarpe={datiScarpe}
          scarpeFiltrate={scarpeFiltrate}
          inCaricamento={inCaricamento}
          raccolte={raccolte}
          scarpaSelezionata={scarpaSelezionata}
          setScarpaSelezionata={setScarpaSelezionata}
          nomeNuovaRaccolta={nomeNuovaRaccolta}
          setNomeNuovaRaccolta={setNomeNuovaRaccolta}
          idInModifica={idInModifica}
          setIdInModifica={setIdInModifica}
          brandModificato={brandModificato}
          setBrandModificato={setBrandModificato}
          modelloModificato={modelloModificato}
          setModelloModificato={setModelloModificato}
          prezzoModificato={prezzoModificato}
          setPrezzoModificato={setPrezzoModificato}
          coloreModificato={coloreModificato}
          setColoreModificato={setColoreModificato}
          genereNuovo={genereNuovo}
          setGenereNuovo={setGenereNuovo}
          genereModificato={genereModificato}
          setGenereModificato={setGenereModificato}
          ricercaTesto={ricercaTesto}
          setRicercaTesto={setRicercaTesto}
          mostraFiltri={mostraFiltri}
          setMostraFiltri={setMostraFiltri}
          filtroPrezzoMin={filtroPrezzoMin}
          setFiltroPrezzoMin={setFiltroPrezzoMin}
          filtroPrezzoMax={filtroPrezzoMax}
          setFiltroPrezzoMax={setFiltroPrezzoMax}
          filtroBrand={filtroBrand}
          setFiltroBrand={setFiltroBrand}
          filtroColore={filtroColore}
          setFiltroColore={setFiltroColore}
          brandUnici={brandUnici}
          nuovoBrand={nuovoBrand}
          setNuovoBrand={setNuovoBrand}
          nuovoModello={nuovoModello}
          setNuovoModello={setNuovoModello}
          nuovoPrezzo={nuovoPrezzo}
          setNuovoPrezzo={setNuovoPrezzo}
          nuovoColore={nuovoColore}
          setNuovoColore={setNuovoColore}
          mantieniDati={mantieniDati}
          setMantieniDati={setMantieniDati}
          aggiungiScarpa={aggiungiScarpa}
          eliminaScarpa={eliminaScarpa}
          avviaModifica={avviaModifica}
          salvaModifica={salvaModifica}
          inserisciImmagine={inserisciImmagine}
          rimuoviImmagine={rimuoviImmagine}
          gestisciImportazioneCSV={gestisciImportazioneCSV}
          toggleScarpaInRaccolta={toggleScarpaInRaccolta}
          creaRaccolta={creaRaccolta}
          containerStyle={containerStyle}
        />
      )}
      {/* SCHERMATA PROFILO */}
      {vistaCorrente === 'profilo' && (
        <ProfiloUtente
          utente={utente}
          mioProfilo={mioProfilo}
          mieRelazioni={mieRelazioni}
          raccolte={raccolte}
          apriListaRelazioni={apriListaRelazioni}
          eliminaRaccolta={eliminaRaccolta}
          togglePrivacyRaccolta={togglePrivacyRaccolta}
          setVistaCorrente={cambiaSchermata}
          containerStyle={containerStyle}
        />
      )}
      {/* SCHERMATA IMPOSTAZIONI */}
      {vistaCorrente === 'impostazioni' && (
        <Impostazioni
          utente={utente}
          setVistaCorrente={cambiaSchermata}
          containerStyle={containerStyle}
        />
      )}
      {/* PROFILO ALTRO UTENTE */}
      {vistaCorrente === 'profilo_altro_utente' && profiloSelezionato.id && (
        <ProfiloAltroUtente
          profiloSelezionato={profiloSelezionato}
          seguitiInfo={seguitiInfo}
          raccolte={raccolte}
          utente={utente}
          toggleSegui={toggleSegui}
          apriListaRelazioni={apriListaRelazioni}
          setVistaCorrente={cambiaSchermata}
          avviaChat={avviaChat}
          containerStyle={containerStyle}
        />
      )}
      <NavBar
        vistaCorrente={vistaCorrente}
        setVistaCorrente={cambiaSchermata}
        setQueryRicerca={setQueryRicerca}
        messaggiNonLetti={messaggiNonLetti}
      />

      <ModaleRelazioni
        modaleRelazioni={modaleRelazioni}
        setModaleRelazioni={setModaleRelazioni}
        apriProfiloUtente={apriProfiloUtente}
      />

    </div>
  );
}

export default MainApp;