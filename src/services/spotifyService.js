const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

/**
 * Récupère les artistes les plus écoutés de l'utilisateur
 * @param {number} limit - Nombre d'artistes à récupérer
 * @returns {Promise<Object>} Les artistes les plus écoutés
 */
export async function fetchUserTopArtists(limit = 20) {
  const token = localStorage.getItem('spotify_access_token');
  
  if (!token) {
    throw new Error('Token d\'accès non disponible');
  }

  const response = await fetch(
    `${SPOTIFY_API_BASE_URL}/me/top/artists?limit=${limit}&time_range=medium_term`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des artistes: ${response.status}`);
  }

  return await response.json();
}

/**
 * Récupère les pistes les plus écoutées de l'utilisateur
 * @param {number} limit - Nombre de pistes à récupérer
 * @returns {Promise<Object>} Les pistes les plus écoutées
 */
export async function fetchUserTopTracks(limit = 20) {
  const token = localStorage.getItem('spotify_access_token');
  
  if (!token) {
    throw new Error('Token d\'accès non disponible');
  }

  const response = await fetch(
    `${SPOTIFY_API_BASE_URL}/me/top/tracks?limit=${limit}&time_range=medium_term`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des pistes: ${response.status}`);
  }

  return await response.json();
}
