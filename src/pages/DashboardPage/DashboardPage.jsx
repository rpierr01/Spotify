import { useState, useEffect } from 'react';
import { fetchUserTopArtists, fetchUserTopTracks } from '../../api/spotify-me';
import { KEY_ACCESS_TOKEN } from '../../constants/storageKeys';
import './DashboardPage.css';

const DashboardPage = () => {
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem(KEY_ACCESS_TOKEN);
        if (!token) {
          setError('Vous devez être connecté pour voir cette page');
          setLoading(false);
          return;
        }

        // Récupérer l'artiste le plus écouté
        const artistsResponse = await fetchUserTopArtists(token, 1);
        if (artistsResponse.error) {
          setError(artistsResponse.error);
          setLoading(false);
          return;
        }
        if (artistsResponse.data?.items && artistsResponse.data.items.length > 0) {
          setTopArtist(artistsResponse.data.items[0]);
        }

        // Récupérer la piste la plus écoutée
        const tracksResponse = await fetchUserTopTracks(token, 1);
        if (tracksResponse.error) {
          setError(tracksResponse.error);
          setLoading(false);
          return;
        }
        if (tracksResponse.data?.items && tracksResponse.data.items.length > 0) {
          setTopTrack(tracksResponse.data.items[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Impossible de charger les données Spotify');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>Tableau de bord Spotify</h1>
      
      <div className="dashboard-content">
        {/* Artiste le plus écouté */}
        <div className="dashboard-card">
          <h2>Artiste le plus écouté</h2>
          {topArtist ? (
            <div className="artist-info">
              {topArtist.images && topArtist.images.length > 0 && (
                <img 
                  src={topArtist.images[0].url} 
                  alt={topArtist.name}
                  className="artist-image"
                />
              )}
              <div className="artist-details">
                <h3>{topArtist.name}</h3>
                {topArtist.genres && topArtist.genres.length > 0 && (
                  <div className="genres">
                    <strong>Genres:</strong>
                    <div className="genre-list">
                      {topArtist.genres.map((genre, index) => (
                        <span key={index} className="genre-tag">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="no-data">Pas d'artiste favori disponible. Écoutez plus de musique pour voir vos statistiques !</p>
          )}
        </div>

        {/* Piste la plus écoutée */}
        <div className="dashboard-card">
          <h2>Piste la plus écoutée</h2>
          {topTrack ? (
            <div className="track-info">
              {topTrack.album?.images && topTrack.album.images.length > 0 && (
                <img 
                  src={topTrack.album.images[0].url} 
                  alt={topTrack.album.name}
                  className="track-image"
                />
              )}
              <div className="track-details">
                <h3>{topTrack.name}</h3>
                {topTrack.artists && topTrack.artists.length > 0 && (
                  <div className="artists">
                    <strong>Artiste(s):</strong>
                    <div className="artist-list">
                      {topTrack.artists.map((artist, index) => (
                        <span key={artist.id}>
                          {artist.name}
                          {index < topTrack.artists.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="no-data">Pas de piste favorite disponible. Écoutez plus de musique pour voir vos statistiques !</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
