import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';

export default function Reflect() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [groupType, setGroupType] = useState('public');
  const [dateGiven, setDateGiven] = useState('');
  const [allArtworks, setAllArtworks] = useState([]);
  const [selectedArtworks, setSelectedArtworks] = useState([]);
  const [manualArtworks, setManualArtworks] = useState([]);
  const [newManualArtwork, setNewManualArtwork] = useState({ title: '', artist: '', year: '', location: '' });
  const [reflection1, setReflection1] = useState('');
  const [reflection2, setReflection2] = useState('');
  const [reflection3, setReflection3] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    const { data, error } = await supabase.from('artworks').select('*');
    if (!error) setAllArtworks(data);
  };

  const handleAddArtworkFromDropdown = (e) => {
    const id = e.target.value;
    if (!id) return;
    const artwork = allArtworks.find(a => a.id.toString() === id);
    if (
      artwork &&
      !selectedArtworks.some(a => a.id === artwork.id) &&
      selectedArtworks.length + manualArtworks.length < 6
    ) {
      setSelectedArtworks([...selectedArtworks, artwork]);
    }
  };

  const handleRemoveArtwork = (index, fromManual = false) => {
    if (fromManual) {
      const newList = [...manualArtworks];
      newList.splice(index, 1);
      setManualArtworks(newList);
    } else {
      const newList = [...selectedArtworks];
      newList.splice(index, 1);
      setSelectedArtworks(newList);
    }
  };

  const handleAddManualArtwork = () => {
    if (newManualArtwork.title && selectedArtworks.length + manualArtworks.length < 6) {
      setManualArtworks([...manualArtworks, newManualArtwork]);
      setNewManualArtwork({ title: '', artist: '', year: '', location: '' });
    }
  };

  const handleCreateTour = async () => {
    if (!title || !dateGiven || !user) return;

    const artworksToStore = [...selectedArtworks.map(({ id, title, artist, year, location }) => ({ id, title, artist, year, location })), ...manualArtworks];

    const { data, error } = await supabase.from('tour_logs').insert({
      user_id: user.id,
      title,
      audience_type: groupType,
      date_given: dateGiven,
      artworks: artworksToStore,
    }).select().single();

    if (error) {
      console.error('Error creating tour log:', error);
      return;
    }

    if (data) {
      const { error: reflectionError } = await supabase.from('reflections').insert({
        user_id: user.id,
        tour_id: data.id,
        question_1: reflection1,
        question_2: reflection2,
        question_3: reflection3,
        is_public: isPublic,
      });

      if (reflectionError) {
        console.error('Error saving reflection:', reflectionError);
      } else {
        router.push('/my-tours');
      }
    }
  };

  return (
    <div>
      <h1>Reflect on a Tour</h1>
      <input
        placeholder="Tour Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select value={groupType} onChange={(e) => setGroupType(e.target.value)}>
        <option value="public">Public</option>
        <option value="private group">Private Group</option>
        <option value="school">School</option>
      </select>
      <input
        type="date"
        value={dateGiven}
        onChange={(e) => setDateGiven(e.target.value)}
      />

      <h3>Select Artworks (up to 6)</h3>
      <select onChange={handleAddArtworkFromDropdown} defaultValue="">
        <option value="">-- Choose an artwork --</option>
        {allArtworks.map(art => (
          <option key={art.id} value={art.id}>{art.title} by {art.artist}</option>
        ))}
      </select>
      <ul>
        {selectedArtworks.map((art, idx) => (
          <li key={`sel-${idx}`}>{art.title} <button onClick={() => handleRemoveArtwork(idx)}>Remove</button></li>
        ))}
        {manualArtworks.map((art, idx) => (
          <li key={`man-${idx}`}>{art.title} (Other) <button onClick={() => handleRemoveArtwork(idx, true)}>Remove</button></li>
        ))}
      </ul>

      <h4>Add Other / Artwork not found</h4>
      <input
        placeholder="Title (required)"
        value={newManualArtwork.title}
        onChange={(e) => setNewManualArtwork({ ...newManualArtwork, title: e.target.value })}
      />
      <input
        placeholder="Artist (optional)"
        value={newManualArtwork.artist}
        onChange={(e) => setNewManualArtwork({ ...newManualArtwork, artist: e.target.value })}
      />
      <input
        placeholder="Year (optional)"
        value={newManualArtwork.year}
        onChange={(e) => setNewManualArtwork({ ...newManualArtwork, year: e.target.value })}
      />
      <input
        placeholder="Location (optional)"
        value={newManualArtwork.location}
        onChange={(e) => setNewManualArtwork({ ...newManualArtwork, location: e.target.value })}
      />
      <button onClick={handleAddManualArtwork}>Add this artwork</button>

      <h3>Reflection</h3>
      <textarea
        placeholder="What went well?"
        value={reflection1}
        onChange={(e) => setReflection1(e.target.value)}
      />
      <textarea
        placeholder="What could be improved?"
        value={reflection2}
        onChange={(e) => setReflection2(e.target.value)}
      />
      {isPublic && (
        <textarea
          placeholder="What advice would you give to other docents on this or a similar tour?"
          value={reflection3}
          onChange={(e) => setReflection3(e.target.value)}
        />
      )}
      <label>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        /> Make this reflection public
      </label>

      <button onClick={handleCreateTour}>Submit Tour Log + Reflection</button>
    </div>
  );
}
