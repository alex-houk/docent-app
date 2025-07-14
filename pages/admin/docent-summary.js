import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function DocentSummary() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tourLogs, setTourLogs] = useState([]);
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
    if (user) loadUsers();
  }, [user]);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, name')
      .eq('role', 'docent');

    if (!error && data) {
      setUsers(data || []);
    }
  };

  const loadUserData = async (id) => {
    const { data: tours } = await supabase
      .from('tour_logs')
      .select('*')
      .eq('user_id', id);
    setTourLogs(tours || []);

    const { data: refs } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', id);
    setReflections(refs || []);
  };

  const handleSelectUser = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    loadUserData(userId);
  };

  const countPublic = reflections.filter((r) => r.is_public).length;
  const countPrivate = reflections.filter((r) => !r.is_public).length;

  return (
    <div>
      <h1>Docent Summary</h1>
      <select onChange={handleSelectUser} defaultValue="">
        <option value="">Select a docent</option>
        {users.map((u) => (
          <option key={u.user_id} value={u.user_id}>
            {u.name || u.user_id.slice(0, 8)}
          </option>
        ))}
      </select>

      {selectedUser && (
        <div>
          <h2>
            Stats for {users.find((u) => u.user_id === selectedUser)?.name || 'Unknown'}
          </h2>
          <p><strong>Public Tour Logs:</strong> {countPublic}</p>
          <p><strong>Private Tour Logs:</strong> {countPrivate}</p>

          <h3>Tour Logs</h3>
          {tourLogs.map((tour) => (
            <div key={tour.id} style={{ border: '1px solid #ccc', padding: '0.5em', marginBottom: '1em' }}>
              <h4>{tour.title}</h4>
              <p><strong>Date:</strong> {tour.date_given}</p>
              <p><strong>Audience:</strong> {tour.audience_type}</p>
              <p><strong>Visibility:</strong> {
                reflections.find((r) => r.tour_id === tour.id)?.is_public ? 'Public' : 'Private'
              }</p>
              <ul>
                {tour.artworks.map((art, idx) => (
                  <li key={idx}>{art.title} by {art.artist}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
