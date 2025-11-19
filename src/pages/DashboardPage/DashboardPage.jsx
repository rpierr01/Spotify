import { useState, useEffect } from 'react';
import { fetchUserTopArtists, fetchUserTopTracks } from '../../api/spotify-me';
import { KEY_ACCESS_TOKEN } from '../../constants/storageKeys';
import './DashboardPage.css';

const TOP_ITEMS_LIMIT = 1;
const ERROR_NO_TOKEN = 'Vous devez être connecté pour voir cette page';
const ERROR_LOAD_DATA = 'Impossible de charger les données Spotify';

const ArtistCard = ({ artist }) => (
  <div className="dashboard-card">
    <h2>Artiste le plus écouté</h2>
    {artist ? (
      <div className="artist-info">
        {artist.images?.length > 0 && (
          <img 
            src={artist.images[0].url} 
            alt={artist.name}
            className="artist-image"
            loading="lazy"
          />
        )}
        <div className="artist-details">
          <h3>{artist.name}</h3>
          {artist.genres?.length > 0 && (
            <div className="genres">
              <strong>Genres:</strong>
              <div className="genre-list">
                {artist.genres.map((genre, index) => (
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
);

const TrackCard = ({ track }) => (
  <div className="dashboard-card">
    <h2>Piste la plus écoutée</h2>
    {track ? (
      <div className="track-info">
        {track.album?.images?.length > 0 && (
          <img 
            src={track.album.images[0].url} 
            alt={track.album.name}
            className="track-image"
            loading="lazy"
          />
        )}
        <div className="track-details">
          <h3>{track.name}</h3>
          {track.artists?.length > 0 && (
            <div className="artists">
              <strong>Artiste(s):</strong>
              <div className="artist-list">
                {track.artists.map((artist, index) => (
                  <span key={artist.id}>
                    {artist.name}
                    {index < track.artists.length - 1 && ', '}
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
);

const DashboardPage = () => {
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => {
    try {
      const token = localStorage.getItem(KEY_ACCESS_TOKEN);
      if (!token) {
        console.warn('No access token found in localStorage.');
        return null;
      }
      return token;
    } catch (err) {
      console.error('Error retrieving access token:', err);
      return null;
    }
  };

  const fetchTopArtist = async (token) => {
    const response = await fetchUserTopArtists(token, TOP_ITEMS_LIMIT);
    if (response.error) {
      throw new Error(response.error);
    }
    if (response.data?.items?.length > 0) {
      return response.data.items[0];
    }
    return null;
  };

  const fetchTopTrack = async (token) => {
    const response = await fetchUserTopTracks(token, TOP_ITEMS_LIMIT);
    if (response.error) {
      throw new Error(response.error);
    }
    if (response.data?.items?.length > 0) {
      return response.data.items[0];
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          setError(ERROR_NO_TOKEN);
          setLoading(false);
          return;
        }

        const [artist, track] = await Promise.all([
          fetchTopArtist(token),
          fetchTopTrack(token),
        ]);

        setTopArtist(artist);
        setTopTrack(track);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(err.message || ERROR_LOAD_DATA);
      } finally {
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
        <ArtistCard artist={topArtist} />
        <TrackCard track={topTrack} />
      </div>
    </div>
  );
};

export default DashboardPage;

