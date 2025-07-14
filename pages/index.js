import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching role:', error);
      return;
    }

    const roles = data.map(r => r.role);
    if (roles.includes('admin')) {
      setRole('admin');
    } else if (roles.includes('docent')) {
      setRole('docent');
    } else {
      setRole(null); // Or a fallback
    }
  };


  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user)
    return (
      <div>
        <h1>Welcome to the Docent Tour App</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Log In</button>
        <button onClick={handleSignup}>Sign Up</button>
      </div>
    );

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={handleLogout}>Logout</button>
      <p>Please use the navigation menu to access pages:</p>
      <ul>
        <li><a href="/my-tours">My Tour Log</a></li>
        <li><a href="/reflect">Record a Tour</a></li>
        <li><a href="/plan-tour">Plan a Tour</a></li>
        <li><a href="/my-plans">View Saved Plans</a></li>
        <li><a href="/browse-tours">Browse Tours</a></li>
      </ul>

      {role === 'admin' && (
        <>
          <h2>Admin Pages</h2>
          <ul>
            <li><a href="/admin/tour-summary">Tour Summary</a></li>
            <li><a href="/admin/artwork-summary">Artwork Summary</a></li>
            <li><a href="/admin/docent-summary">Docent Summary</a></li>
          </ul>
        </>
      )}
    </div>
  );
}
