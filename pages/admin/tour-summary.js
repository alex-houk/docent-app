import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function TourSummary() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [publicCount, setPublicCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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
      fetchUserRole();
      fetchCounts();
    }
  }, [user]);

  const fetchUserRole = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (!error && data?.role === 'admin') {
      setRole('admin');
    }
  };

  const fetchCounts = async () => {
    const { count: total, error: totalErr } = await supabase
      .from('reflections')
      .select('*', { count: 'exact', head: true });

    const { count: pub, error: pubErr } = await supabase
      .from('reflections')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true);

    if (!totalErr) setTotalCount(total);
    if (!pubErr) setPublicCount(pub);
  };

  if (!user || role !== 'admin') return <p>Loading or access denied...</p>;

  return (
    <div>
      <h1>Tour Summary Stats</h1>
      <p><strong>Total Tour Logs:</strong> {totalCount}</p>
      <p><strong>Public Tour Logs:</strong> {publicCount}</p>
    </div>
  );
}
