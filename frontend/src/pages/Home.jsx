import { Link } from 'react-router-dom';

import { useHeritage } from '../context/HeritageContext';



export default function Home() {

  const { token } = useHeritage();



  return (

    <div className="min-h-screen bg-heritage-cream flex flex-col items-center justify-center p-8 text-center">

      <h1 className="text-4xl md:text-5xl font-bold text-heritage-dark mb-4 font-serif">Buganda Heritage</h1>

      <p className="text-gray-600 mb-8 max-w-xl text-lg">

        Preserve and explore your family lineage with respect for Buganda traditions — all 55 clans, totems, and generational trees.

      </p>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mb-10 w-full">

        <div className="bg-white rounded-lg shadow p-5 border-t-4 border-heritage-gold">

          <h2 className="font-bold text-heritage-dark">Family Trees</h2>

          <p className="text-sm text-gray-600 mt-1">Build multi-generational lineage with parents, spouses, and clan inheritance.</p>

        </div>

        <div className="bg-white rounded-lg shadow p-5 border-t-4 border-heritage-gold">

          <h2 className="font-bold text-heritage-dark">55 Clans</h2>

          <p className="text-sm text-gray-600 mt-1">Browse all Buganda clans with their totems (emiziro).</p>

        </div>

        <div className="bg-white rounded-lg shadow p-5 border-t-4 border-heritage-gold">

          <h2 className="font-bold text-heritage-dark">Heritage Experience</h2>

          <p className="text-sm text-gray-600 mt-1">Totem trees, clan alliances, timelines, and ancestor stories — living lineage.</p>

        </div>

      </div>



      <div className="flex flex-wrap gap-4 justify-center">

        {token ? (

          <>

            <Link to="/dashboard" className="bg-heritage-gold text-white px-6 py-3 rounded font-semibold">Lineage Home</Link>

            <Link to="/heritage" className="border border-heritage-gold text-heritage-gold px-6 py-3 rounded font-semibold">Heritage Experience</Link>

            <Link to="/family-tree" className="border border-heritage-dark text-heritage-dark px-6 py-3 rounded font-semibold">Family Tree</Link>

          </>

        ) : (

          <>

            <Link to="/login" className="bg-heritage-gold text-white px-6 py-3 rounded font-semibold">Login</Link>

            <Link to="/register" className="border border-heritage-gold text-heritage-gold px-6 py-3 rounded font-semibold">Register</Link>

          </>

        )}

        <Link to="/clans" className="border border-heritage-dark text-heritage-dark px-6 py-3 rounded font-semibold">Browse Clans</Link>

      </div>

    </div>

  );

}

