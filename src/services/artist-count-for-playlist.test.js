// src/services/artist-count-for-playlist.test.js
import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { artistCountForPlaylist } from "./artist-count-for-playlist.js";

// Mock the API module that artistCountForPlaylist depends on
jest.mock("../api/spotify-playlists.js", () => ({
  fetchPlaylistById: jest.fn(),
}));

import { fetchPlaylistById } from "../api/spotify-playlists.js";

// Helper to build playlist shape
function makePlaylist(trackItems) {
  return {
    tracks: {
      items: trackItems.map((t) => ({
        track: {
          name: t.name,
          artists: (t.artists || []).map((a) => ({ name: a })),
        },
      })),
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("artistCountForPlaylist", () => {
  test("calls fetchPlaylistById with token and playlistId", async () => {
    const token = "token123";
    const playlistId = "playlistABC";
    fetchPlaylistById.mockResolvedValue({
      data: makePlaylist([
        { name: "Song 1", artists: ["Artist A"] },
        { name: "Song 2", artists: ["Artist B"] },
        { name: "Song 3", artists: ["Artist C", "Artist A"] },
      ]),
      error: null,
    });

    const result = await artistCountForPlaylist(token, playlistId);

    expect(fetchPlaylistById).toHaveBeenCalledTimes(1);
    expect(fetchPlaylistById).toHaveBeenCalledWith(token, playlistId);
    expect(result).toEqual({ "Artist A": 2, "Artist B": 1, "Artist C": 1 });
  });

  test("returns undefined and logs error when fetchPlaylistById rejects", async () => {
    const mockError = new Error("Network failure");
    fetchPlaylistById.mockRejectedValue(mockError);
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await artistCountForPlaylist("t", "p");
    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    // First arg string, second the error object (implementation logs both)
    const callArgs = consoleSpy.mock.calls[0];
    expect(callArgs[0]).toMatch(/Error fetching playlist/);
    expect(callArgs[1]).toBe(mockError);

    consoleSpy.mockRestore();
  });

  test("returns undefined when fetchPlaylistById returns an error", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: null,
      error: "API Error",
    });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await artistCountForPlaylist("token", "playlist");

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("Error fetching playlist:", "API Error");
    consoleSpy.mockRestore();
  });

  test("returns empty object for empty playlist", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: makePlaylist([]),
      error: null,
    });

    const result = await artistCountForPlaylist("token", "playlist");
    expect(result).toEqual({});
  });

  test("handles tracks without artists", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: {
        tracks: {
          items: [
            { track: { name: "Song 1", artists: [] } },
            { track: { name: "Song 2" } },
          ],
        },
      },
      error: null,
    });

    const result = await artistCountForPlaylist("token", "playlist");
    expect(result).toEqual({});
  });

  test("handles playlist without tracks property", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: {},
      error: null,
    });

    const result = await artistCountForPlaylist("token", "playlist");
    expect(result).toEqual({});
  });

  test("handles null playlist data", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await artistCountForPlaylist("token", "playlist");
    expect(result).toEqual({});
  });

  test("handles items with null track", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: {
        tracks: {
          items: [
            { track: null },
            { track: { name: "Song", artists: [{ name: "Artist A" }] } },
          ],
        },
      },
      error: null,
    });

    const result = await artistCountForPlaylist("token", "playlist");
    expect(result).toEqual({ "Artist A": 1 });
  });

  test("counts multiple occurrences of same artist correctly", async () => {
    fetchPlaylistById.mockResolvedValue({
      data: makePlaylist([
        { name: "Song 1", artists: ["Artist A"] },
        { name: "Song 2", artists: ["Artist A"] },
        { name: "Song 3", artists: ["Artist A"] },
      ]),
      error: null,
    });

    const result = await artistCountForPlaylist("token", "playlist");
    expect(result).toEqual({ "Artist A": 3 });
  });
});