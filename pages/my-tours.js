import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function MyTours() {
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [reflections, setReflections] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) {
      loadTours();
      loadReflections();
    }
  }, [user]);

  const loadTours = async () => {
    const { data } = await supabase.from('tour_logs').select('*').eq('user_id', user.id);
    setTours(data);
  };

  const loadReflections = async () => {
    const { data } = await supabase.from('reflections').select('*').eq('user_id', user.id);
    setReflections(data);
  };

  const getReflectionForTour = (tourId) =>
    reflections.find((r) => r.tour_id === tourId);

  return (
    <div>
      <h1>My Tour Logs</h1>
      {tours.length === 0 && <p>You haven’t saved any tours yet.</p>}
      {tours.map((tour) => {
        const reflection = getReflectionForTour(tour.id);
        return (
          <div key={tour.id} style={{ border: '1px solid #ccc', padding: '1em', marginBottom: '1em' }}>
            <h2>{tour.title}</h2>
            <p><strong>Date:</strong> {tour.date_given}</p>
            <p><strong>Audience:</strong> {tour.audience_type}</p>

            <h3>Artworks</h3>
            <ul>
              {tour.artworks && tour.artworks.map((art, idx) => (
                <li key={idx}>
                  <strong>{art.title}</strong>
                  {art.artist && <> by {art.artist}</>}
                  {art.year && <> ({art.year})</>}
                  {art.location && <> – {art.location}</>}
                  {!art.id && <em> (Other)</em>}
                </li>
              ))}
            </ul>

            {reflection && (
              <div>
                <h3>Reflection</h3>
                <p><strong>What went well?</strong><br />{reflection.question_1}</p>
                <p><strong>What could be improved?</strong><br />{reflection.question_2}</p>
                {reflection.is_public && reflection.question_3 && (
                  <p><strong>Advice for other docents:</strong><br />{reflection.question_3}</p>
                )}
                <p><em>{reflection.is_public ? 'Public' : 'Private'}</em></p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
