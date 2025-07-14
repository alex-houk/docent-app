import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';

export default function PlanTour() {
  const [user, setUser] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [title, setTitle] = useState('');
  const [artworks, setArtworks] = useState([]);
  const [selectedArtworks, setSelectedArtworks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('organization_id')
          .eq('user_id', currentUser.id)
          .single();

        if (!error && roleData) {
          setOrgId(roleData.organization_id);
          loadArtworks(roleData.organization_id);
        }
      }
    };

    init();

    supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        supabase
          .from('user_roles')
          .select('organization_id')
          .eq('user_id', sessionUser.id)
          .single()
          .then(({ data: roleData }) => {
            if (roleData) {
              setOrgId(roleData.organization_id);
              loadArtworks(roleData.organization_id);
            }
          });
      }
    });
  }, []);

  const loadArtworks = async (orgId) => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('organization_id', orgId);
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
    if (!title || selectedArtworks.length === 0 || !orgId) {
      return alert('Please enter a title and select artworks.');
    }

    const { error } = await supabase.from('tour_plans').insert({
      user_id: user.id,
      organization_id: orgId,
      title,
      artworks: selectedArtworks,
    });

    if (!error) {
      alert('Tour plan saved!');
      router.push('/my-plans');
    } else {
      console.error('Error saving tour plan:', error);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Plan a Tour</h1>
      <input
        placeholder="Plan Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

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
