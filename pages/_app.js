import '../styles/globals.css';
import Navbar from '../components/navbar';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
