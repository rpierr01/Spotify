import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import * as spotifyService from '../../services/spotifyService';

// Mock the spotify service
jest.mock('../../services/spotifyService');

// Mock SimpleCard component
jest.mock('../../components/SimpleCard/SimpleCard', () => {
  return function SimpleCard({ title, subtitle, imageUrl }) {
    return (
      <div data-testid="simple-card">
        <img src={imageUrl} alt={title} />
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    );
  };
});

const mockTopArtist = {
  id: '1',
  name: 'Test Artist',
  genres: ['pop', 'rock'],
  images: [{ url: 'https://example.com/artist.jpg' }]
};

const mockTopTrack = {
  id: '1',
  name: 'Test Track',
  artists: [{ name: 'Artist 1' }, { name: 'Artist 2' }],
  album: {
    images: [{ url: 'https://example.com/album.jpg' }]
  }
};

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.setItem('spotify_access_token', 'test-token');
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    spotifyService.fetchUserTopArtists.mockReturnValue(new Promise(() => {}));
    spotifyService.fetchUserTopTracks.mockReturnValue(new Promise(() => {}));

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('renders top artist and top track when data is available', async () => {
    spotifyService.fetchUserTopArtists.mockResolvedValue({
      items: [mockTopArtist]
    });
    spotifyService.fetchUserTopTracks.mockResolvedValue({
      items: [mockTopTrack]
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Mon Tableau de Bord')).toBeInTheDocument();
    });

    expect(screen.getByText('Artiste le plus écouté')).toBeInTheDocument();
    expect(screen.getByText('Piste la plus écoutée')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test Track')).toBeInTheDocument();
  });

  it('displays message when no artist is available', async () => {
    spotifyService.fetchUserTopArtists.mockResolvedValue({
      items: []
    });
    spotifyService.fetchUserTopTracks.mockResolvedValue({
      items: [mockTopTrack]
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Aucun artiste disponible/)).toBeInTheDocument();
    });
  });

  it('displays message when no track is available', async () => {
    spotifyService.fetchUserTopArtists.mockResolvedValue({
      items: [mockTopArtist]
    });
    spotifyService.fetchUserTopTracks.mockResolvedValue({
      items: []
    });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Aucune piste disponible/)).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    spotifyService.fetchUserTopArtists.mockRejectedValue(
      new Error('Failed to fetch')
    );
    spotifyService.fetchUserTopTracks.mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erreur/)).toBeInTheDocument();
    });
  });

  it('calls API with limit of 1', async () => {
    spotifyService.fetchUserTopArtists.mockResolvedValue({ items: [] });
    spotifyService.fetchUserTopTracks.mockResolvedValue({ items: [] });

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(spotifyService.fetchUserTopArtists).toHaveBeenCalledWith(1);
      expect(spotifyService.fetchUserTopTracks).toHaveBeenCalledWith(1);
    });
  });

  it('handles null or malformed data gracefully', async () => {
    spotifyService.fetchUserTopArtists.mockResolvedValue(null);
    spotifyService.fetchUserTopTracks.mockResolvedValue(null);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Aucun artiste disponible/)).toBeInTheDocument();
      expect(screen.getByText(/Aucune piste disponible/)).toBeInTheDocument();
    });
  });
});
