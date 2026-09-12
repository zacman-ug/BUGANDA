import { Link } from 'react-router-dom';
import { useHeritage } from '../context/HeritageContext';

export default function Home() {
  const { token } = useHeritage();

  return (
    <div className="min-h-screen bg-heritage-cream flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-heritage-dark mb-4">Buganda Heritage</h1>
      <p className="text-gray-600 mb-8 max-w-xl">Preserve and explore your family lineage with respect for Buganda traditions.</p>
      <div className="flex gap-4">
        {token ? (
          <Link to="/dashboard" className="bg-heritage-gold text-white px-6 py-3 rounded font-semibold">Go to Dashboard</Link>
        ) : (
          <>
            <Link to="/login" className="bg-heritage-gold text-white px-6 py-3 rounded font-semibold">Login</Link>
            <Link to="/register" className="border border-heritage-gold text-heritage-gold px-6 py-3 rounded font-semibold">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
