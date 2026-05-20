import { useState } from 'react';
import { supabase } from './supabase';

function CreaPost({ utente, tornaAlFeed }) {
  const [descrizione, setDescrizione] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [immagineUrl, setImmagineUrl] = useState(''); // Per il link web (URL)
  const [fileImmagine, setFileImmagine] = useState(null); // Per il file locale (Bucket)
  const [inCaricamento, setInCaricamento] = useState(false);

  const gestisciPubblicazione = async (e) => {
    e.preventDefault();
    if (!descrizione.trim()) {
      alert("Inserisci almeno una descrizione per il tuo post!");
      return;
    }

    setInCaricamento(true);

    try {
      let urlFinale = null;

      // 1. Priorità al file locale: se c'è, lo carichiamo sul bucket di Supabase
      if (fileImmagine) {
        const nomeUnicoFile = `${Date.now()}_${fileImmagine.name}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('immagini-post')
          .upload(nomeUnicoFile, fileImmagine);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase
          .storage
          .from('immagini-post')
          .getPublicUrl(nomeUnicoFile);

        urlFinale = urlData.publicUrl;
      } 
      // 2. Altrimenti, se l'utente ha inserito un URL testuale, usiamo direttamente quello
      else if (immagineUrl.trim()) {
        urlFinale = immagineUrl.trim();
      }

      // Inserimento del post nel database con l'URL corretto (da bucket o da link)
      const { error } = await supabase.from('post').insert([
        {
          user_id: utente.id,
          descrizione: descrizione,
          immagine_url: urlFinale,
          hashtags: hashtags
        }
      ]);

      if (error) throw error;

      // Reset completo di tutti i campi
      setDescrizione('');
      setFileImmagine(null);
      setImmagineUrl('');
      setHashtags('');
      tornaAlFeed();

    } catch (error) {
      alert("Errore durante la pubblicazione: " + error.message);
    } finally {
      setInCaricamento(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '600px',
      width: '100%',
      margin: '20px auto 0 auto',
      backgroundColor: '#ffffff',
      color: '#111111',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <button
          onClick={tornaAlFeed}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#555555' }}
        >
          ✕
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#111111' }}>Crea un nuovo post</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <form onSubmit={gestisciPubblicazione} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111111' }}>
            Cosa vuoi condividere?
          </label>
          <textarea
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder="Scrivi qui il tuo post..."
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #ddd',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              color: '#111111',
              backgroundColor: '#ffffff'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111111' }}>
            Hashtag
          </label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#sneakers #style #drop"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              boxSizing: 'border-box',
              color: '#111111',
              backgroundColor: '#ffffff'
            }}
          />
        </div>

        {/* CONTENITORE IMMAGINI: SCELTA DOPPIA COERENTE */}
        <div style={{ 
          border: '1px dashed #cccccc', 
          padding: '15px', 
          borderRadius: '10px', 
          backgroundColor: '#fafafa', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px' 
        }}>
          
          {/* OPZIONE FILE DAL DISPOSITIVO */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111111', fontSize: '14px' }}>
              Carica dal dispositivo
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={!!immagineUrl.trim()} // Blocca se l'utente sta usando l'URL
              onChange={(e) => setFileImmagine(e.target.files[0] || null)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
                color: '#111111',
                backgroundColor: !!immagineUrl.trim() ? '#e9e9e9' : '#ffffff',
                cursor: !!immagineUrl.trim() ? 'not-allowed' : 'default'
              }}
            />
          </div>

          <div style={{ textAlign: 'center', color: '#888888', fontSize: '12px', fontWeight: 'bold', margin: '2px 0' }}>
            — OPPURE —
          </div>

          {/* OPZIONE LINK INTERNET */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111111', fontSize: '14px' }}>
              Incolla un link URL immagine
            </label>
            <input
              type="text"
              value={immagineUrl}
              disabled={!!fileImmagine} // Blocca se l'utente ha scelto un file locale
              onChange={(e) => setImmagineUrl(e.target.value)}
              placeholder="https://esempio.com/immagine-scarpa.jpg"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
                color: '#111111',
                backgroundColor: !!fileImmagine ? '#e9e9e9' : '#ffffff',
                cursor: !!fileImmagine ? 'not-allowed' : 'text'
              }}
            />
          </div>

          {/* BOTTONE RESET SELEZIONE (COMPARE SOLO SE UNA DELLE DUE È COMPILATA) */}
          {(fileImmagine || immagineUrl.trim()) && (
            <button
              type="button"
              onClick={() => { setFileImmagine(null); setImmagineUrl(''); }}
              style={{
                alignSelf: 'flex-end',
                background: 'none',
                border: 'none',
                color: '#dc3545',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Resetta selezione immagine
            </button>
          )}

        </div>

        <button
          type="submit"
          disabled={inCaricamento}
          style={{
            backgroundColor: inCaricamento ? '#cccccc' : '#111111',
            color: 'white',
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: inCaricamento ? 'not-allowed' : 'pointer'
          }}
        >
          {inCaricamento ? 'Pubblicazione...' : 'Pubblica Post'}
        </button>
      </form>
    </div>
  );
}

export default CreaPost;