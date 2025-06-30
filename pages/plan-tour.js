import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';

export default function PlanTour() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [selectedArtworks, setSelectedArtworks] = useState([]);
  const router = useRouter();

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
    if (!error) setArtworks(data);
  };

  const handleSelect = (artwork) => {
    if (selectedArtworks.length < 6 && !selectedArtworks.some(a => a.id === artwork.id)) {
      setSelectedArtworks([...selectedArtworks, artwork]);
    }
  };

  const handleRemove = (index) => {
    const newList = [...selectedArtworks];
    newList.splice(index, 1);
    setSelectedArtworks(newList);
  };

  const handleSubmit = async () => {
    if (!title || selectedArtworks.length === 0) return alert('Please enter a title and select artworks.');
    const { error } = await supabase.from('tour_plans').insert({
      user_id: user.id,
      title,
      artworks: selectedArtworks
    });
    if (!error) {
      alert('Tour plan saved!');
      router.push('/my-plans');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Plan a Tour</h1>
      <input placeholder="Plan Title" value={title} onChange={(e) => setTitle(e.target.value)} />

      <h3>Selected Artworks (up to 6)</h3>
      <ul>
        {selectedArtworks.map((art, idx) => (
          <li key={idx}>
            {art.title} by {art.artist} ({art.year}) - {art.location}
            <button onClick={() => handleRemove(idx)}>Remove</button>
          </li>
        ))}
      </ul>

      <h3>Browse Artworks</h3>
      <ul>
        {artworks.map((art) => (
          <li key={art.id}>
            {art.title} by {art.artist} ({art.year}) - {art.location}
            <button onClick={() => handleSelect(art)}>Add</button>
          </li>
        ))}
      </ul>

      <button onClick={handleSubmit}>Save Plan</button>
    </div>
  );
}