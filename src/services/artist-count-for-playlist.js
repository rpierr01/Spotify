import { fetchPlaylistById } from "../api/spotify-playlists.js";

/**
 * Counts how many times each artist appears in a playlist
 * @param {string} token - Spotify access token
 * @param {string} playlistId - ID of the playlist
 * @returns {Promise<Object|undefined>} Object with artist names as keys and counts as values, or undefined on error
 */
export async function artistCountForPlaylist(token, playlistId) {
  try {
    const { data: playlist, error } = await fetchPlaylistById(token, playlistId);
    
    if (error) {
      console.error("Error fetching playlist:", error);
      return undefined;
    }

    const artistCount = {};
    
    // Parse tracks and count artist occurrences
    if (playlist?.tracks?.items) {
      for (const item of playlist.tracks.items) {
        if (item?.track?.artists) {
          for (const artist of item.track.artists) {
            const artistName = artist.name;
            artistCount[artistName] = (artistCount[artistName] || 0) + 1;
          }
        }
      }
    }
    
    return artistCount;
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return undefined;
  }
}
