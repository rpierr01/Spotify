import './PlayListItem.css';
import '../ListItem.css';
import PropTypes from 'prop-types';

/**
 * Playlist item component
 * @param {*}  playlist 
 * @returns JSX.Element
 */
export default function PlayListItem({ playlist, onClick }) {
  const handleClick = () => {
    onClick();
  };

  return (
  <li key={playlist.id} data-testid={`playlist-item-${playlist.id}`} className="list-item playlist-item">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
      >
        <img
          src={playlist.images[0]?.url}
          alt="cover"
          className="playlist-item-cover"
        />
        <div className="playlist-item-details">
          <div className="playlist-item-details-header">
            <div className="playlist-item-title">{playlist.name}</div>
            <div className="playlist-item-owner">By {playlist.owner.display_name}</div>
          </div>
          <div className="playlist-item-tracks">{playlist.tracks.total} tracks</div>
        </div>
      </div>
      <a
        href={playlist.external_urls.spotify}
        target="_blank"
        rel="noopener noreferrer"
        className="playlist-link"
      >
        Open
      </a>
    </li>
  );
}

PlayListItem.propTypes = {
  playlist: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};
