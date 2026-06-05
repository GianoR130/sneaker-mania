import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

function CatalogoScarpe({
  utente,
  isAdmin,
  datiScarpe,
  scarpeFiltrate,
  inCaricamento,
  raccolte,
  scarpaSelezionata,
  setScarpaSelezionata,
  nomeNuovaRaccolta,
  setNomeNuovaRaccolta,
  idInModifica,
  setIdInModifica,
  brandModificato,
  setBrandModificato,
  modelloModificato,
  setModelloModificato,
  prezzoModificato,
  setPrezzoModificato,
  coloreModificato,
  setColoreModificato,
  genereNuovo = 'Unisex',
  setGenereNuovo,
  genereModificato,
  setGenereModificato,
  ricercaTesto,
  setRicercaTesto,
  mostraFiltri,
  setMostraFiltri,
  filtroPrezzoMin,
  setFiltroPrezzoMin,
  filtroPrezzoMax,
  setFiltroPrezzoMax,
  filtroBrand,
  setFiltroBrand,
  filtroColore,
  setFiltroColore,
  brandUnici,
  nuovoBrand,
  setNuovoBrand,
  nuovoModello,
  setNuovoModello,
  nuovoPrezzo,
  setNuovoPrezzo,
  nuovoColore,
  setNuovoColore,
  mantieniDati,
  setMantieniDati,
  aggiungiScarpa,
  eliminaScarpa,
  avviaModifica,
  salvaModifica,
  inserisciImmagine,
  rimuoviImmagine,
  gestisciImportazioneCSV,
  toggleScarpaInRaccolta,
  creaRaccolta,
  containerStyle
}) {
  const [conversazioniAttive, setConversazioniAttive] = useState([]);
  const [shareMenuAperto, setShareMenuAperto] = useState(null);
  const [feedbackInvio, setFeedbackInvio] = useState({});

  useEffect(() => {
    const caricaConversazioni = async () => {
      if (!utente?.id) {
        setConversazioniAttive([]);
        return;
      }

      const { data: conversazioni, error } = await supabase
        .from('conversazioni')
        .select('*')
        .or(`user1_id.eq.${utente.id},user2_id.eq.${utente.id}`)
        .order('updated_at', { ascending: false });

      if (error || !conversazioni) {
        setConversazioniAttive([]);
        return;
      }

      const otherIds = [...new Set(
        conversazioni
          .map((conversazione) => (conversazione.user1_id === utente.id ? conversazione.user2_id : conversazione.user1_id))
          .filter(Boolean)
      )];

      const { data: profili } = otherIds.length
        ? await supabase.from('profili').select('id, username').in('id', otherIds)
        : { data: [] };

      const profiliMap = (profili || []).reduce((acc, profilo) => {
        acc[profilo.id] = profilo;
        return acc;
      }, {});

      setConversazioniAttive(conversazioni.map((conversazione) => {
        const otherUserId = conversazione.user1_id === utente.id ? conversazione.user2_id : conversazione.user1_id;
        return {
          ...conversazione,
          otherUserId,
          otherUsername: profiliMap[otherUserId]?.username || 'Utente'
        };
      }));
    };

    caricaConversazioni();
  }, [utente?.id]);

  useEffect(() => {
    if (!scarpaSelezionata) return;

    const handleScrollToScarpa = () => {
      setTimeout(() => {
        try {
          const elemento = document.getElementById(`scarpa-card-${scarpaSelezionata}`);
          if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (err) {
          console.error('Errore scroll alla scarpa selezionata:', err);
        }
      }, 100);
    };

    handleScrollToScarpa();
  }, [scarpaSelezionata]);

  const condividiScarpaInChat = async (scarpa, conversazione) => {
    if (!utente?.id || !conversazione?.id) return;

    const { error } = await supabase.from('messaggi').insert([{
      conversazione_id: conversazione.id,
      mittente_id: utente.id,
      testo: `[CONDIVIDI_SCARPA:${scarpa.id}]`,
      letto: false
    }]);

    if (error) {
      console.error('Errore invio messaggio di condivisione:', error);
      return;
    }

    setFeedbackInvio((prev) => ({
      ...prev,
      [scarpa.id]: `Scarpa inviata a @${conversazione.otherUsername || 'chat'}`
    }));
    setShareMenuAperto(null);

    window.setTimeout(() => {
      setFeedbackInvio((prev) => {
        const next = { ...prev };
        delete next[scarpa.id];
        return next;
      });
    }, 2500);
  };

  return (
    <div style={{ ...containerStyle, boxSizing: 'border-box' }}>

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

      {/* Intestazione Catalogo */}
      <div style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '15px', textAlign: 'left', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#111111', letterSpacing: '-0.5px' }}>
          Catalogo Scarpe
        </h1>
      </div>

      {/* Barra di Ricerca e Bottone Filtri */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Cerca per brand o modello..."
            value={ricercaTesto}
            onChange={(e) => setRicercaTesto(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '14px 18px', 
              borderRadius: '25px', 
              border: '1px solid #e6e8eb', 
              fontSize: '15px', 
              color: '#111111', 
              backgroundColor: '#ffffff', 
              boxSizing: 'border-box',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          />
          <button
            onClick={() => setMostraFiltri(!mostraFiltri)}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#111111', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '25px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '14px',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            Filtri {mostraFiltri ? '▲' : '▼'}
          </button>
        </div>

        {/* Pannello dei Filtri Dropdown */}
        {mostraFiltri && (
          <div style={{ 
            marginTop: '15px', 
            padding: '20px', 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            border: '1px solid #e6e8eb', 
            display: 'flex', 
            gap: '15px', 
            flexWrap: 'wrap', 
            boxSizing: 'border-box', 
            textAlign: 'left',
            boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 'bold', color: '#111111' }}>Prezzo Min (€)</label>
              <input type="number" value={filtroPrezzoMin} onChange={(e) => setFiltroPrezzoMin(e.target.value)} style={{ padding: '10px', border: '1px solid #e6e8eb', borderRadius: '8px', color: '#111111', backgroundColor: '#f0f2f5', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 'bold', color: '#111111' }}>Prezzo Max (€)</label>
              <input type="number" value={filtroPrezzoMax} onChange={(e) => setFiltroPrezzoMax(e.target.value)} style={{ padding: '10px', border: '1px solid #e6e8eb', borderRadius: '8px', color: '#111111', backgroundColor: '#f0f2f5', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 'bold', color: '#111111' }}>Brand</label>
              <select value={filtroBrand} onChange={(e) => setFiltroBrand(e.target.value)} style={{ padding: '10px', border: '1px solid #e6e8eb', borderRadius: '8px', color: '#111111', backgroundColor: '#f0f2f5', cursor: 'pointer', outline: 'none' }}>
                <option value="">Tutti</option>
                {brandUnici.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 'bold', color: '#111111' }}>Colore</label>
              <input list="lista-colori" placeholder="Scegli..." value={filtroColore} onChange={(e) => setFiltroColore(e.target.value)} style={{ padding: '10px', border: '1px solid #e6e8eb', borderRadius: '8px', color: '#111111', backgroundColor: '#f0f2f5', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                onClick={() => { setFiltroPrezzoMin(''); setFiltroPrezzoMax(''); setFiltroBrand(''); setFiltroColore(''); }} 
                style={{ padding: '10px 18px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s ease' }}
              >
                Resetta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Area Admin: Gestione Catalogo */}
      {isAdmin && (
        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '16px', color: '#111111', textAlign: 'left', boxSizing: 'border-box', border: '1px solid #ffc107', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#111111', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#ffc107' }}>⚡</span> Area Admin: Gestione Catalogo
          </h3>
          <form onSubmit={aggiungiScarpa} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Brand (Es. Nike)" value={nuovoBrand} onChange={(e) => setNuovoBrand(e.target.value)} style={{ flex: 2, padding: '11px', borderRadius: '8px', border: '1px solid #e6e8eb', minWidth: '120px', color: '#111111', backgroundColor: '#f0f2f5', boxSizing: 'border-box', outline: 'none' }} />
              
              <select 
                value={genereNuovo} 
                onChange={(e) => setGenereNuovo(e.target.value)} 
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #e6e8eb', minWidth: '100px', color: '#111111', backgroundColor: '#f0f2f5', boxSizing: 'border-box', cursor: 'pointer', outline: 'none' }}
              >
                <option value="Unisex">Unisex</option>
                <option value="Uomo">Uomo</option>
                <option value="Donna">Donna</option>
              </select>

              <input type="text" placeholder="Modello (Es. Air Force 1)" value={nuovoModello} onChange={(e) => setNuovoModello(e.target.value)} style={{ flex: 2, padding: '11px', borderRadius: '8px', border: '1px solid #e6e8eb', minWidth: '120px', color: '#111111', backgroundColor: '#f0f2f5', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="number" placeholder="Prezzo (€)" value={nuovoPrezzo} onChange={(e) => setNuovoPrezzo(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #e6e8eb', minWidth: '100px', color: '#111111', backgroundColor: '#f0f2f5', boxSizing: 'border-box', outline: 'none' }} />
              <input list="lista-colori" placeholder="Colore (scegli o scrivi)" value={nuovoColore} onChange={(e) => setNuovoColore(e.target.value)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #e6e8eb', minWidth: '100px', color: '#111111', backgroundColor: '#f0f2f5', boxSizing: 'border-box', outline: 'none' }} />
              <button type="submit" style={{ padding: '11px 24px', backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(40,167,69,0.2)' }}>Aggiungi</button>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#666666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input type="checkbox" checked={mantieniDati} onChange={(e) => setMantieniDati(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                Mantieni i dati inseriti dopo il salvataggio
              </label>
            </div>
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '20px 0' }} />

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#111111', fontSize: '14px', fontWeight: 'bold' }}>Importazione Massiva</h4>
            <div style={{ padding: '15px', border: '1px dashed #cccccc', borderRadius: '12px', backgroundColor: '#f0f2f5', display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: 'bold', color: '#111111', fontSize: '13px' }}>Carica File CSV:</label>
                <input type="file" accept=".csv" onChange={gestisciImportazioneCSV} style={{ color: '#111111', fontSize: '13px' }} />
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#666666' }}>
                L'intestazione del file deve contenere esattamente: <strong>brand, modello, prezzo, colore, genere</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid Cards dei Prodotti Catalogo */}
      <ul style={{
        listStyleType: 'none',
        padding: 0,
        marginTop: '25px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {scarpeFiltrate.map((scarpa) => {
          const isSalvataOvunque = raccolte.some(r => r.scarpe.some(s => s.id === scarpa.id));

          return (
            <li 
              id={`scarpa-card-${scarpa.id}`} 
              key={scarpa.id} 
              style={{ 
                padding: '18px', 
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                borderLeft: isAdmin ? '5px solid #ffc107' : '5px solid #007BFF', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                color: '#111111',
                textAlign: 'left',
                boxSizing: 'border-box',
                maxWidth: '100%',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}
            >
              {/* Stato di Modifica Amministrativa */}
              {idInModifica === scarpa.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="text" value={brandModificato} onChange={(e) => setBrandModificato(e.target.value)} style={{ flex: 2, padding: '10px', minWidth: '100px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="Brand" />
                    
                    <select 
                      value={genereModificato || 'Unisex'} 
                      onChange={(e) => setGenereModificato(e.target.value)}
                      style={{ flex: 1, padding: '10px', minWidth: '90px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Uomo">Uomo</option>
                      <option value="Donna">Donna</option>
                    </select>

                    <input type="text" value={modelloModificato} onChange={(e) => setModelloModificato(e.target.value)} style={{ flex: 2, padding: '10px', minWidth: '100px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="Modello" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="number" value={prezzoModificato} onChange={(e) => setPrezzoModificato(e.target.value)} style={{ flex: 1, padding: '10px', minWidth: '80px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="Prezzo" />
                    <input list="lista-colori" value={coloreModificato} onChange={(e) => setColoreModificato(e.target.value)} style={{ flex: 1, padding: '10px', minWidth: '80px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', outline: 'none' }} placeholder="Colore" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button onClick={() => salvaModifica(scarpa.id)} style={{ flex: 1, padding: '10px', backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}>Salva</button>
                    <button onClick={() => setIdInModifica(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}>Annulla</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Vista Standard Prodotto: Immagine + Informazioni */}
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
                    
                    {/* Contenitore Immagine Sneaker */}
                    <div
                      onClick={() => isAdmin && inserisciImmagine(scarpa.id)}
                      title={isAdmin ? "Clicca per aggiungere/modificare l'immagine" : ""}
                      style={{
                        width: '140px',
                        height: '110px',
                        backgroundColor: '#f0f2f5',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: isAdmin ? 'pointer' : 'default',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid #e6e8eb',
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
                              style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'rgba(220, 53, 69, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s ease' }}
                            >
                              ✕
                            </button>
                          )}
                        </>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#adb5bd', gap: '4px' }}>
                          <span style={{ fontSize: '28px' }}>👟</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666666' }}>{isAdmin ? 'Aggiungi foto' : 'Nessuna foto'}</span>
                        </div>
                      )}
                    </div>

                    {/* Dettagli della Sneaker */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      flex: '1 1 160px', 
                      justifyContent: 'space-between', 
                      minWidth: 0, 
                      minHeight: '110px',
                      textAlign: 'left'
                    }}>
                      <div>
                        <strong style={{ fontSize: '17px', fontWeight: 'bold', lineHeight: '1.2', color: '#111111', display: 'block', marginBottom: '4px' }}>
                          {scarpa.brand} <span style={{ fontWeight: 'normal', color: '#666666', fontSize: '14px' }}>| {scarpa.genere || 'Unisex'}</span>
                        </strong>
                        <span style={{ fontWeight: 'normal', fontSize: '15px', color: '#666666', display: 'block', marginBottom: '6px' }}>{scarpa.modello}</span>
                        
                        <div style={{ color: '#111111', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '2px', fontWeight: '500' }}>
                          <span>Prezzo: <span style={{ fontWeight: 'bold', color: '#111111' }}>€{scarpa.prezzo || 'N/D'}</span></span>
                          <span style={{ color: '#666666' }}>Colore: {scarpa.colore || 'N/D'}</span>
                        </div>
                      </div>

                      {/* Bottoni d'Azione Prodotto */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setScarpaSelezionata(scarpaSelezionata === scarpa.id ? null : scarpa.id)}
                            style={{
                              flex: 12,
                              padding: '8px 12px',
                              backgroundColor: isSalvataOvunque ? '#ffc107' : '#f0f2f5',
                              color: '#111111',
                              border: 'none',
                              borderRadius: '25px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isSalvataOvunque ? 'Nelle tue raccolte ▾' : 'Salva in Raccolta ▾'}
                          </button>
                          <button
                            onClick={() => setShareMenuAperto(shareMenuAperto === scarpa.id ? null : scarpa.id)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#f0f2f5',
                              color: '#111111',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            title="Condividi in chat"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          </button>
                        </div>

                        {/* Menu a comparsa per Condivisione in Chat */}
                        {shareMenuAperto === scarpa.id && (
                          <div style={{ position: 'relative', width: '100%', paddingTop: '5px', zIndex: 10 }}>
                            <div style={{
                              width: '100%',
                              padding: '12px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #e6e8eb',
                              borderRadius: '12px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              boxSizing: 'border-box'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '13px', color: '#111111' }}>Invia a un amico</strong>
                                <button
                                  onClick={() => setShareMenuAperto(null)}
                                  style={{ border: 'none', background: 'transparent', color: '#dc3545', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: 0 }}
                                >
                                  Chiudi
                                </button>
                              </div>

                              {conversazioniAttive.length === 0 ? (
                                <p style={{ margin: 0, color: '#666666', fontSize: '13px', fontStyle: 'italic' }}>Nessuna chat attiva.</p>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                                  {conversazioniAttive.map((conversazione) => (
                                    <button
                                      key={conversazione.id}
                                      onClick={() => condividiScarpaInChat(scarpa, conversazione)}
                                      style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e6e8eb',
                                        backgroundColor: '#f0f2f5',
                                        cursor: 'pointer',
                                        color: '#111111',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      @{conversazione.otherUsername}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {feedbackInvio[scarpa.id] && (
                          <div style={{ marginTop: '4px', fontSize: '13px', color: '#28A745', fontWeight: 'bold', textAlign: 'center' }}>
                            ✓ {feedbackInvio[scarpa.id]}
                          </div>
                        )}

                        {/* Tasti Modifica/Cancella esclusivi per Admin */}
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button onClick={() => avviaModifica(scarpa)} style={{ flex: 1, padding: '6px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.2s ease' }}>Modifica</button>
                            <button onClick={() => eliminaScarpa(scarpa.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#DC3545', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.2s ease' }}>Cancella</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sotto-box Interno di Salvataggio nelle Raccolte */}
                  {scarpaSelezionata === scarpa.id && (
                    <div style={{ 
                      padding: '15px', 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e6e8eb', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      width: '100%',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                      marginTop: '5px',
                      textAlign: 'left'
                    }}>
                      <strong style={{ fontSize: '13px', color: '#111111', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seleziona Raccolta:</strong>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                        {raccolte.map(raccolta => (
                          <label key={raccolta.id} style={{ 
                            fontSize: '14px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '10px', 
                            cursor: 'pointer', 
                            color: '#111111',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            backgroundColor: '#f0f2f5',
                            textAlign: 'left'
                          }}>
                            <input
                              type="checkbox"
                              checked={raccolta.scarpe.some(s => s.id === scarpa.id)}
                              onChange={() => toggleScarpaInRaccolta(raccolta.id, scarpa)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                            />
                            <span style={{ lineBreak: 'anywhere', fontWeight: '500' }}>{raccolta.nome_raccolta}</span>
                          </label>
                        ))}
                      </div>

                      {/* Input rapido per creare una nuova raccolta al volo */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', width: '100%', boxSizing: 'border-box' }}>
                        <input
                          type="text"
                          placeholder="Nuova raccolta..."
                          value={nomeNuovaRaccolta}
                          onChange={(e) => setNomeNuovaRaccolta(e.target.value)}
                          style={{ 
                            flex: 1, 
                            padding: '10px 14px', 
                            fontSize: '14px', 
                            border: '1px solid #e6e8eb', 
                            borderRadius: '25px', 
                            minWidth: 0, 
                            color: '#111111', 
                            backgroundColor: '#f0f2f5',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }}
                        />
                        <button 
                          onClick={creaRaccolta} 
                          style={{ 
                            padding: '10px 18px', 
                            fontSize: '13px', 
                            fontWeight: 'bold', 
                            backgroundColor: '#111111', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '25px', 
                            cursor: 'pointer', 
                            flexShrink: 0,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Crea
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
      
      {scarpeFiltrate.length === 0 && !inCaricamento && (
        <p style={{ color: '#666666', textAlign: 'center', fontStyle: 'italic', marginTop: '40px', fontSize: '15px' }}>
          Nessuna scarpa trovata nel catalogo con i filtri attuali.
        </p>
      )}
    </div>
  );
}

export default CatalogoScarpe;