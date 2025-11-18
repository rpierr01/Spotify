import { useEffect, useState } from 'react';
import { fetchUserTopArtists, fetchUserTopTracks } from '../../services/spotifyService';
import SimpleCard from '../../components/SimpleCard/SimpleCard';
import '../../styles/DashboardPage.css';

function DashboardPage() {
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [artistsData, tracksData] = await Promise.all([
          fetchUserTopArtists(1),
          fetchUserTopTracks(1)
        ]);

        setTopArtist(artistsData?.items?.[0] || null);
        setTopTrack(tracksData?.items?.[0] || null);
      } catch (err) {
        console.error('Error fetching data:', err); // Ajout d'un log pour capturer les erreurs
        setError(err.message || 'Une erreur est survenue lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-page">Chargement...</div>;
  }

  if (error) {
    return <div className="dashboard-page error">Erreur : {error}</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Mon Tableau de Bord</h1>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Artiste le plus écouté</h2>
          {topArtist ? (
            <SimpleCard
              title={topArtist.name}
              subtitle={topArtist.genres?.join(', ') || 'Aucun genre'}
              imageUrl={topArtist.images?.[0]?.url}
            />
          ) : (
            <p className="no-data">Aucun artiste disponible. Écoutez plus de musique pour voir vos artistes préférés !</p>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Piste la plus écoutée</h2>
          {topTrack ? (
            <SimpleCard
              title={topTrack.name}
              subtitle={topTrack.artists?.map(artist => artist.name).join(', ')}
              imageUrl={topTrack.album?.images?.[0]?.url}
            />
          ) : (
            <p className="no-data">Aucune piste disponible. Écoutez plus de musique pour voir vos pistes préférées !</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
