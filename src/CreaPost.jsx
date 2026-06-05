import { useState } from 'react';
import { supabase } from './supabase';

function CreaPost({ utente, tornaAlFeed }) {
  const [descrizione, setDescrizione] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [immagineUrl, setImmagineUrl] = useState(''); // Per il link web (URL)
  const [fileImmagine, setFileImmagine] = useState(null); // Per il file locale (Bucket)
  const [inCaricamento, setInCaricamento] = useState(false);
  
  // Stati Hover
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isResetHovered, setIsResetHovered] = useState(false);

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
      padding: '24px',
      maxWidth: '600px',
      width: '100%',
      margin: '20px auto 30px auto',
      backgroundColor: '#ffffff',
      color: '#111111',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      boxSizing: 'border-box'
    }}>

      {/* HEADER CREA POST */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '16px', marginBottom: '24px' }}>
        <button
          onClick={tornaAlFeed}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
          style={{ 
            background: isCloseHovered ? '#f0f2f5' : 'transparent', 
            border: 'none', 
            fontSize: '20px', 
            cursor: 'pointer', 
            color: '#111111',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          ✕
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#111111', fontWeight: 'bold' }}>Crea Post</h2>
        <div style={{ width: '40px' }}></div> {/* Spaziatore per centrare il titolo */}
      </div>

      <form onSubmit={gestisciPubblicazione} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* TEXTAREA DESCRIZIONE */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111111', fontSize: '15px' }}>
            Cosa vuoi condividere?
          </label>
          <textarea
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder="Scrivi qui il tuo post..."
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e6e8eb',
              minHeight: '120px',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '15px',
              boxSizing: 'border-box',
              color: '#111111',
              backgroundColor: '#f8fafc',
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#111111'}
            onBlur={(e) => e.target.style.borderColor = '#e6e8eb'}
          />
        </div>

        {/* INPUT HASHTAG */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111111', fontSize: '15px' }}>
            Hashtag
          </label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#sneakers #style #drop"
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '25px',
              border: '1px solid #e6e8eb',
              fontSize: '15px',
              boxSizing: 'border-box',
              color: '#111111',
              backgroundColor: '#f8fafc',
              outline: 'none',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#111111'}
            onBlur={(e) => e.target.style.borderColor = '#e6e8eb'}
          />
        </div>

        {/* CONTENITORE IMMAGINI (DOPPIA SCELTA) */}
        <div style={{ 
          border: '1px dashed #cccccc', 
          padding: '20px', 
          borderRadius: '12px', 
          backgroundColor: '#f8fafc', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px' 
        }}>
          
          {/* OPZIONE FILE DAL DISPOSITIVO */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111111', fontSize: '14px' }}>
              Carica foto dal dispositivo
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={!!immagineUrl.trim()} 
              onChange={(e) => setFileImmagine(e.target.files[0] || null)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e6e8eb',
                boxSizing: 'border-box',
                color: '#111111',
                backgroundColor: !!immagineUrl.trim() ? '#e2e8f0' : '#ffffff',
                cursor: !!immagineUrl.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 'bold' }}>
            — OPPURE —
          </div>

          {/* OPZIONE LINK INTERNET */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#111111', fontSize: '14px' }}>
              Incolla link URL immagine
            </label>
            <input
              type="text"
              value={immagineUrl}
              disabled={!!fileImmagine} 
              onChange={(e) => setImmagineUrl(e.target.value)}
              placeholder="https://esempio.com/foto-scarpa.jpg"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e6e8eb',
                boxSizing: 'border-box',
                color: '#111111',
                fontSize: '14px',
                backgroundColor: !!fileImmagine ? '#e2e8f0' : '#ffffff',
                cursor: !!fileImmagine ? 'not-allowed' : 'text',
                outline: 'none'
              }}
              onFocus={(e) => !fileImmagine && (e.target.style.borderColor = '#111111')}
              onBlur={(e) => e.target.style.borderColor = '#e6e8eb'}
            />
          </div>

          {/* BOTTONE RESET SELEZIONE */}
          {(fileImmagine || immagineUrl.trim()) && (
            <button
              type="button"
              onMouseEnter={() => setIsResetHovered(true)}
              onMouseLeave={() => setIsResetHovered(false)}
              onClick={() => { setFileImmagine(null); setImmagineUrl(''); }}
              style={{
                alignSelf: 'flex-end',
                background: 'none',
                border: 'none',
                color: isResetHovered ? '#b02a37' : '#dc3545',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                marginTop: '4px',
                transition: 'color 0.2s ease'
              }}
            >
              Rimuovi selezione immagine
            </button>
          )}

        </div>

        {/* BOTTONE PUBBLICA (PILLOLA NERA) */}
        <button
          type="submit"
          disabled={inCaricamento}
          onMouseEnter={() => setIsSubmitHovered(true)}
          onMouseLeave={() => setIsSubmitHovered(false)}
          style={{
            marginTop: '10px',
            backgroundColor: inCaricamento ? '#cccccc' : (isSubmitHovered ? '#333333' : '#111111'),
            color: '#ffffff',
            padding: '16px',
            border: 'none',
            borderRadius: '25px', // Pill style (Premium TikTok)
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: inCaricamento ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: inCaricamento ? 'none' : '0 4px 15px rgba(0,0,0,0.15)'
          }}
        >
          {inCaricamento ? 'Pubblicazione...' : 'Pubblica Post'}
        </button>
      </form>
    </div>
  );
}

export default CreaPost;