import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/plan-tour">Plan a Tour</Link></li>
        <li><Link href="/reflect">Reflect on a Tour</Link></li>
        <li><Link href="/my-tours">My Tours</Link></li>
        <li><Link href="/my-plans">My Plans</Link></li>
        <li><Link href="/browse-tours">Browse Tours</Link></li>
      </ul>
    </nav>
  );
}

const navStyle = {
  backgroundColor: '#f4f4f4',
  padding: '10px 20px',
  borderBottom: '1px solid #ccc',
};

const ulStyle = {
  listStyle: 'none',
  display: 'flex',
  gap: '1rem',
  margin: 0,
  padding: 0,
};
