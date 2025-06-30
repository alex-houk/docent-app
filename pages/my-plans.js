import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function MyPlans() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) loadPlans();
  }, [user]);

  const loadPlans = async () => {
    const { data, error } = await supabase.from('tour_plans').select('*').eq('user_id', user.id);
    if (!error) setPlans(data);
  };

  const deletePlan = async (id) => {
    const { error } = await supabase.from('tour_plans').delete().eq('id', id);
    if (!error) loadPlans();
  };

  return (
    <div>
      <h1>My Tour Plans</h1>
      {plans.length === 0 ? <p>No saved plans.</p> : (
        <ul>
          {plans.map(plan => (
            <li key={plan.id}>
              <h3>{plan.title}</h3>
              <ul>
                {plan.artworks.map((art, idx) => (
                  <li key={idx}>{art.title} by {art.artist} ({art.year}) - {art.location}</li>
                ))}
              </ul>
              <button onClick={() => deletePlan(plan.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}