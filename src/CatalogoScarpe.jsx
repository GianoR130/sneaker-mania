import React from 'react';

function CatalogoScarpe({
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
  return (
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
        <h1 style={{ margin: 0, fontSize: '28px', color: '#111111' }}>Catalogo Scarpe</h1>
      </div>

      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Cerca per brand o modello..."
            value={ricercaTesto}
            onChange={(e) => setRicercaTesto(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px', minWidth: 0, color: '#111111', backgroundColor: '#ffffff' }}
          />
          <button
            onClick={() => setMostraFiltri(!mostraFiltri)}
            style={{ padding: '12px 20px', backgroundColor: '#e9ecef', color: '#111111', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
          >
            Filtri {mostraFiltri ? 'Su' : 'Giu'}
          </button>
        </div>

        {mostraFiltri && (
          <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold', color: '#111111' }}>Prezzo Min</label>
              <input type="number" value={filtroPrezzoMin} onChange={(e) => setFiltroPrezzoMin(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', color: '#111111', backgroundColor: '#ffffff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold', color: '#111111' }}>Prezzo Max</label>
              <input type="number" value={filtroPrezzoMax} onChange={(e) => setFiltroPrezzoMax(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', color: '#111111', backgroundColor: '#ffffff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold', color: '#111111' }}>Brand</label>
              <select value={filtroBrand} onChange={(e) => setFiltroBrand(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', color: '#111111', backgroundColor: '#ffffff' }}>
                <option value="">Tutti</option>
                {brandUnici.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '12px', marginBottom: '4px', fontWeight: 'bold', color: '#111111' }}>Colore</label>
              <input list="lista-colori" placeholder="Scegli..." value={filtroColore} onChange={(e) => setFiltroColore(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', color: '#111111', backgroundColor: '#ffffff' }} />
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
        <div style={{ padding: '15px', backgroundColor: '#f1f3f5', borderRadius: '8px', color: '#111111' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#111111' }}>Area Admin: Gestione Catalogo</h3>
          <form onSubmit={aggiungiScarpa} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Brand (Es. Nike)" value={nuovoBrand} onChange={(e) => setNuovoBrand(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '120px', color: '#111111', backgroundColor: '#ffffff' }} />
              <input type="text" placeholder="Modello (Es. Air Force 1)" value={nuovoModello} onChange={(e) => setNuovoModello(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '120px', color: '#111111', backgroundColor: '#ffffff' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="number" placeholder="Prezzo" value={nuovoPrezzo} onChange={(e) => setNuovoPrezzo(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '100px', color: '#111111', backgroundColor: '#ffffff' }} />
              <input list="lista-colori" placeholder="Colore (scegli o scrivi)" value={nuovoColore} onChange={(e) => setNuovoColore(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '100px', color: '#111111', backgroundColor: '#ffffff' }} />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28A745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>Aggiungi</button>
            </div>
            <div>
              <label style={{ fontSize: '13px', color: '#555555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="checkbox" checked={mantieniDati} onChange={(e) => setMantieniDati(e.target.checked)} />
                Mantieni i dati inseriti dopo il salvataggio
              </label>
            </div>
          </form>

          <hr style={{ borderTop: '1px solid #ddd', margin: '20px 0' }} />

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#111111' }}>Importazione Massiva</h4>
            <div style={{ padding: '10px', border: '1px dashed #aaa', borderRadius: '4px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: 'bold', color: '#111111' }}>Carica File CSV:</label>
                <input type="file" accept=".csv" onChange={gestisciImportazioneCSV} style={{ color: '#111111' }} />
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#555555' }}>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {scarpeFiltrate.map((scarpa) => {
          const isSalvataOvunque = raccolte.some(r => r.scarpe.some(s => s.id === scarpa.id));

          return (
            <li key={scarpa.id} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: isAdmin ? '5px solid #ffc107' : '5px solid #17A2B8', display: 'flex', flexDirection: 'column', gap: '10px', color: '#111111' }}>

              {idInModifica === scarpa.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="text" value={brandModificato} onChange={(e) => setBrandModificato(e.target.value)} style={{ flex: 1, padding: '8px', minWidth: '100px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Brand" />
                    <input type="text" value={modelloModificato} onChange={(e) => setModelloModificato(e.target.value)} style={{ flex: 1, padding: '8px', minWidth: '100px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Modello" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="number" value={prezzoModificato} onChange={(e) => setPrezzoModificato(e.target.value)} style={{ flex: 1, padding: '8px', minWidth: '80px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Prezzo" />
                    <input list="lista-colori" value={coloreModificato} onChange={(e) => setColoreModificato(e.target.value)} style={{ flex: 1, padding: '8px', minWidth: '80px', color: '#111111', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '4px' }} placeholder="Colore" />
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

                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', minWidth: 0 }}>
                    <div>
                      <strong style={{ fontSize: '18px', lineHeight: '1.2', marginBottom: '5px', color: '#111111' }}>{scarpa.brand}<br />{scarpa.modello}</strong>
                      <div style={{ color: '#333333', fontSize: '14px', display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
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
                          color: '#111111',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {isSalvataOvunque ? 'Nelle tue raccolte ▾' : 'Salva in una Raccolta ▾'}
                      </button>

                      {scarpaSelezionata === scarpa.id && (
                        <div style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <strong style={{ fontSize: '12px', color: '#111111' }}>Salva in:</strong>

                          {raccolte.map(raccolta => (
                            <label key={raccolta.id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#111111' }}>
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
                              style={{ flex: 1, padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', minWidth: 0, color: '#111111', backgroundColor: '#ffffff' }}
                            />
                            <button onClick={creaRaccolta} style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#111111', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', flexShrink: 0 }}>Crea</button>
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
        <p style={{ color: '#777777', textAlign: 'center', fontStyle: 'italic', marginTop: '30px' }}>Nessuna scarpa trovata.</p>
      )}
    </div>
  );
}

export default CatalogoScarpe;
