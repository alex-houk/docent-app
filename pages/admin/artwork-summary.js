import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function ArtworksSummary() {
  const [user, setUser] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [selectedArtworkId, setSelectedArtworkId] = useState('');
  const [relatedTours, setRelatedTours] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) loadArtworks();
  }, [user]);

  const loadArtworks = async () => {
    const { data, error } = await supabase.from('artworks').select('*');
    if (!error) setArtworks(data || []);
  };

  const handleSelectArtwork = async (id) => {
    setSelectedArtworkId(id);
    if (!id) {
      setRelatedTours([]);
      return;
    }

    const selected = artworks.find((a) => a.id.toString() === id);
    if (!selected) return;

    const { data, error } = await supabase
      .from('tour_logs')
      .select('*');

    if (!error && data) {
      const filtered = data.filter((tour) =>
        Array.isArray(tour.artworks) &&
        tour.artworks.some((a) => a.title === selected.title)
      );
      setRelatedTours(filtered);
    } else {
      console.error('Error fetching tour logs:', error);
      setRelatedTours([]);
    }
  };

  const selectedArtwork = artworks.find((a) => a.id.toString() === selectedArtworkId);

  return (
    <div>
      <h1>Artwork Summary</h1>
      <p>Select an artwork to view its tour log usage.</p>

      <select onChange={(e) => handleSelectArtwork(e.target.value)} value={selectedArtworkId}>
        <option value="">-- Choose an artwork --</option>
        {artworks.map((art) => (
          <option key={art.id} value={art.id}>
            {art.title} by {art.artist}
          </option>
        ))}
      </select>

      {selectedArtwork && (
        <div style={{ marginTop: '1em' }}>
          <h2>{selectedArtwork.title}</h2>
          <p><strong>Total tours with this artwork:</strong> {relatedTours.length}</p>
          <ul>
            {relatedTours.map((tour) => (
              <li key={tour.id}>
                <strong>{tour.title}</strong> ({tour.date_given}) – {tour.audience_type}<br />
                <em>{tour.is_public ? 'Public' : 'Private'}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
