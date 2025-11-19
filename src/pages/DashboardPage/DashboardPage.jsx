import { useState, useEffect } from 'react';
import { fetchUserTopArtists, fetchUserTopTracks } from '../../api/spotify-me';
import { KEY_ACCESS_TOKEN } from '../../constants/storageKeys';
import './DashboardPage.css';

const TOP_ITEMS_LIMIT = 1;
const ERROR_NO_TOKEN = 'Vous devez être connecté pour voir cette page';
const ERROR_LOAD_DATA = 'Impossible de charger les données Spotify';

const DashboardPage = () => {
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getToken = () => {
      const token = localStorage.getItem(KEY_ACCESS_TOKEN);
      if (!token) {
        throw new Error(ERROR_NO_TOKEN);
      }
      return token;
    };

    const fetchTopArtist = async (token) => {
      const response = await fetchUserTopArtists(token, TOP_ITEMS_LIMIT);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data?.items?.length > 0) {
        setTopArtist(response.data.items[0]);
      }
    };

    const fetchTopTrack = async (token) => {
      const response = await fetchUserTopTracks(token, TOP_ITEMS_LIMIT);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data?.items?.length > 0) {
        setTopTrack(response.data.items[0]);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        await fetchTopArtist(token);
        await fetchTopTrack(token);

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(err.message || ERROR_LOAD_DATA);
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
              {topArtist.images?.length > 0 && (
                <img 
                  src={topArtist.images[0].url} 
                  alt={topArtist.name}
                  className="artist-image"
                  loading="lazy"
                />
              )}
              <div className="artist-details">
                <h3>{topArtist.name}</h3>
                {topArtist.genres?.length > 0 && (
                  <div className="genres">
                    <strong>Genres:</strong>
                    <div className="genre-list">
                      {topArtist.genres.map((genre, index) => (
                        <span key={`${genre}-${index}`} className="genre-tag">
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
              {topTrack.album?.images?.length > 0 && (
                <img 
                  src={topTrack.album.images[0].url} 
                  alt={topTrack.album.name}
                  className="track-image"
                  loading="lazy"
                />
              )}
              <div className="track-details">
                <h3>{topTrack.name}</h3>
                {topTrack.artists?.length > 0 && (
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

