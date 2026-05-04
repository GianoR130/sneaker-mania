import { useState } from 'react';
import { supabase } from './supabase';

function CreaPost({ utente, tornaAlFeed }) {
  const [descrizione, setDescrizione] = useState('');
  const [immagineUrl, setImmagineUrl] = useState('');
  const [hashtags, setHashtags] = useState(''); // Questo gestisce la nuova casella
  const [inCaricamento, setInCaricamento] = useState(false);

  const gestisciPubblicazione = async (e) => {
    e.preventDefault();
    if (!descrizione.trim()) {
      alert("Inserisci almeno una descrizione per il tuo post!");
      return;
    }

    setInCaricamento(true);

    try {
      const { error } = await supabase.from('post').insert([
        {
          user_id: utente.id,
          descrizione: descrizione,
          immagine_url: immagineUrl || null,
          hashtags: hashtags // Salviamo gli hashtag nel database
        }
      ]);

      if (error) throw error;

      setDescrizione('');
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
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginTop: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
        <button onClick={tornaAlFeed} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#555' }}>✕</button>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Crea un nuovo post</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <form onSubmit={gestisciPubblicazione} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Campo Testo */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Cosa vuoi condividere?</label>
          <textarea 
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder="Scrivi qui il tuo post..."
            style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        {/* --- NUOVA CASELLA: HASHTAG --- */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hashtag</label>
          <input 
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#sneakers #style #drop"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </div>
        {/* ------------------------------ */}

        {/* Campo Immagine */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>URL Immagine</label>
          <input 
            type="text"
            value={immagineUrl}
            onChange={(e) => setImmagineUrl(e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={inCaricamento}
          style={{ 
            backgroundColor: inCaricamento ? '#ccc' : '#111', 
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