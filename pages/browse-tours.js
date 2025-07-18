import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function BrowseTours() {
  const [reflections, setReflections] = useState([]);
  const [tourLogs, setTourLogs] = useState([]);

  useEffect(() => {
    loadPublicReflections();
  }, []);

  const loadPublicReflections = async () => {
    const { data: refs, error: refErr } = await supabase
      .from('reflections')
      .select('*')
      .eq('is_public', true);

    if (refErr || !refs.length) return;

    const tourIds = refs.map(r => r.tour_id);
    const { data: tours, error: tourErr } = await supabase
      .from('tour_logs')
      .select('*')
      .in('id', tourIds);

    if (!tourErr) {
      setReflections(refs);
      setTourLogs(tours);
    }
  };

  const getTourForReflection = (tourId) => tourLogs.find(t => t.id === tourId);

  return (
    <div>
      <h1>Browse Shared Tours</h1>
      {reflections.length === 0 ? <p>No public reflections available.</p> : (
        <ul>
          {reflections.map(ref => {
            const tour = getTourForReflection(ref.tour_id);
            return (
              <li key={ref.id} style={{ border: '1px solid #ccc', padding: '1em', marginBottom: '1em' }}>
                <h3>{tour?.title || 'Untitled Tour'}</h3>
                {tour?.audience_type && <p><strong>Audience:</strong> {tour.audience_type}</p>}
                <ul>
                  {tour?.artworks?.map((art, idx) => (
                    <li key={idx}>
                      <strong>{art.title}</strong>
                      {art.artist && <> by {art.artist}</>}
                      {art.year && <> ({art.year})</>}
                      {art.location && <> – {art.location}</>}
                      {!art.id && <em> (Other)</em>}
                    </li>
                  ))}
                </ul>
                <div>
                  <h4>Reflection</h4>
                  <p><strong>What went well?</strong><br />{ref.question_1}</p>
                  <p><strong>What could be improved?</strong><br />{ref.question_2}</p>
                  <p><strong>Advice to others:</strong><br />{ref.question_3}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
