import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlaylistDetailPage from './PlaylistDetailPage';
import * as spotifyPlaylists from '../../api/spotify-playlists';
import * as useRequireToken from '../../hooks/useRequireToken';

// Mock dependencies
jest.mock('../../api/spotify-playlists');
jest.mock('../../hooks/useRequireToken');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ playlistId: 'test-playlist-id' }),
  useNavigate: () => jest.fn(),
}));

const mockPlaylistData = {
  data: {
    id: 'test-playlist-id',
    name: 'Test Playlist',
    description: 'A test playlist',
    images: [{ url: 'https://example.com/image.jpg' }],
    external_urls: { spotify: 'https://open.spotify.com/playlist/test' },
    owner: { display_name: 'Test User' },
    tracks: {
      total: 2,
      items: [
        {
          track: {
            id: 'track1',
            name: 'Track 1',
            artists: [{ name: 'Artist 1' }],
          },
        },
        {
          track: {
            id: 'track2',
            name: 'Track 2',
            artists: [{ name: 'Artist 2' }, { name: 'Artist 3' }],
          },
        },
      ],
    },
  },
  error: null,
};

describe('PlaylistDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRequireToken.useRequireToken.mockReturnValue({ token: 'mock-token' });
  });

  it('renders loading state initially', () => {
    spotifyPlaylists.fetchPlaylistById.mockReturnValue(new Promise(() => {}));
    render(
      <BrowserRouter>
        <PlaylistDetailPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('renders playlist details when data is fetched', async () => {
    spotifyPlaylists.fetchPlaylistById.mockResolvedValue(mockPlaylistData);
    render(
      <BrowserRouter>
        <PlaylistDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Playlist')).toBeInTheDocument();
    });

    expect(screen.getByText('A test playlist')).toBeInTheDocument();
    expect(screen.getByText(/2 titre/)).toBeInTheDocument();
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Artist 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
    expect(screen.getByText('Artist 2, Artist 3')).toBeInTheDocument();
  });

  it('renders error message when fetch fails', async () => {
    spotifyPlaylists.fetchPlaylistById.mockResolvedValue({
      data: null,
      error: 'Failed to fetch playlist',
    });
    render(
      <BrowserRouter>
        <PlaylistDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch playlist')).toBeInTheDocument();
    });
  });

  it('renders empty playlist message when no tracks', async () => {
    const emptyPlaylist = {
      ...mockPlaylistData,
      data: {
        ...mockPlaylistData.data,
        tracks: { total: 0, items: [] },
      },
    };
    spotifyPlaylists.fetchPlaylistById.mockResolvedValue(emptyPlaylist);
    render(
      <BrowserRouter>
        <PlaylistDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cette playlist est vide.')).toBeInTheDocument();
    });
  });

  it('renders play button with correct link', async () => {
    spotifyPlaylists.fetchPlaylistById.mockResolvedValue(mockPlaylistData);
    render(
      <BrowserRouter>
        <PlaylistDetailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const playButton = screen.getByText(/Lire sur Spotify/);
      expect(playButton).toBeInTheDocument();
    });
  });
});
