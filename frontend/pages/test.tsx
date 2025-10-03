import Link from 'next/link';

export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Page de Test</h1>
      <p>Cette page teste si la navigation Next.js fonctionne.</p>

      <div style={{ marginTop: '20px' }}>
        <Link href="/" style={{ marginRight: '10px', color: 'blue', textDecoration: 'underline' }}>
          Retour à l'accueil
        </Link>
        <Link href="/pharmacies" style={{ marginRight: '10px', color: 'blue', textDecoration: 'underline' }}>
          Pharmacies
        </Link>
        <Link href="/about" style={{ color: 'blue', textDecoration: 'underline' }}>
          À propos
        </Link>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => alert('Le JavaScript fonctionne!')}
          style={{ padding: '10px', backgroundColor: 'green', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Tester JavaScript
        </button>
      </div>
    </div>
  );
}