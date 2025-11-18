import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { handleTokenError } from '../../utils/handleTokenError.js';
import { buildTitle } from '../../constants/appMeta.js';
import './PlaylistDetailPage.css';

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { token } = useRequireToken();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    fetchPlaylistById(token, playlistId)
      .then(res => {
        if (res.error) {
          if (!handleTokenError(res.error, navigate)) {
            setError(res.error);
          }
          return;
        }
        setPlaylist(res.data);
        document.title = buildTitle(res.data.name);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, playlistId, navigate]);

  if (loading) {
    return <div className="loading-message">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message" role="alert">{error}</div>;
  }

  if (!playlist) {
    return <div className="error-message">Playlist non trouvée.</div>;
  }

  return (
    <section className="playlist-detail-page page-container" aria-labelledby="playlist-title">
      <div className="playlist-header">
        {playlist.images?.[0]?.url && (
          <img 
            src={playlist.images[0].url} 
            alt={playlist.name} 
            className="playlist-image" 
          />
        )}
        <div className="playlist-info">
          <h1 id="playlist-title">{playlist.name}</h1>
          {playlist.description && (
            <p dangerouslySetInnerHTML={{ __html: playlist.description }} />
          )}
          <p className="playlist-meta">
            {playlist.owner?.display_name && `Par ${playlist.owner.display_name} • `}
            {playlist.tracks.total} titre{playlist.tracks.total > 1 ? 's' : ''}
          </p>
          {playlist.external_urls?.spotify && (
            <button
              className="play-button"
              onClick={() => window.open(playlist.external_urls.spotify, '_blank')}
              aria-label="Ouvrir la playlist dans Spotify"
            >
              ▶ Lire sur Spotify
            </button>
          )}
        </div>
      </div>
      <div className="playlist-tracks">
        <h2>Titres</h2>
        {playlist.tracks.items && playlist.tracks.items.length > 0 ? (
          <ul role="list">
            {playlist.tracks.items.map((item, index) => (
              item.track && (
                <li key={item.track.id || index} className="track-item">
                  <span className="track-name">{item.track.name}</span>
                  <span className="track-artist">
                    {item.track.artists.map(a => a.name).join(', ')}
                  </span>
                </li>
              )
            ))}
          </ul>
        ) : (
          <p className="empty-message">Cette playlist est vide.</p>
        )}
      </div>
    </section>
  );
};

export default PlaylistDetailPage;
