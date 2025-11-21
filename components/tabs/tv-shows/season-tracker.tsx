'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiCircle } from 'react-icons/fi';
import { Tabs } from '@/components/ui/tabs';
import type { Season, Episode } from '@/lib/tmdb';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Congratulations } from '@/components/shared/congratulations';

interface SeasonTrackerProps {
  tvShowId: number;
  seasons: Season[];
}

interface EpisodeWithStatus extends Episode {
  watched: boolean;
}

export function SeasonTracker({ tvShowId, seasons }: SeasonTrackerProps) {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const [activeSeasonNumber, setActiveSeasonNumber] = useState<number>(
    validSeasons[0]?.season_number || 1
  );
  const [episodes, setEpisodes] = useState<EpisodeWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingEpisodes, setUpdatingEpisodes] = useState<Set<number>>(
    new Set()
  );
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [congratulationsSeason, setCongratulationsSeason] = useState<
    number | null
  >(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    episodeNumber: number;
    currentStatus: boolean;
    prevEpisodes: number[];
  }>({ open: false, episodeNumber: 0, currentStatus: false, prevEpisodes: [] });

  // Fetch episodes for the active season
  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/tv-shows/${tvShowId}/episodes?seasonNumber=${activeSeasonNumber}`
        );
        if (!response.ok) throw new Error('Failed to fetch episodes');
        const data = await response.json();

        setEpisodes(data.episodes || []);
      } catch (error) {
        console.error('Error fetching episodes:', error);
        toast.error('Failed to load episodes');
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [tvShowId, activeSeasonNumber]);

  const handleToggleEpisode = async (
    episodeNumber: number,
    currentStatus: boolean
  ) => {
    const isMarkingWatched = !currentStatus;
    if (isMarkingWatched) {
      const prevUnwatched = episodes
        .filter((ep) => ep.episode_number < episodeNumber && !ep.watched)
        .map((ep) => ep.episode_number);
      if (prevUnwatched.length > 0) {
        setConfirmDialog({
          open: true,
          episodeNumber,
          currentStatus,
          prevEpisodes: prevUnwatched,
        });
        return;
      }
    }
    // Proceed to toggle
    await performToggle(episodeNumber, currentStatus);
  };

  const performToggle = async (
    episodeNumber: number,
    currentStatus: boolean,
    alsoPrev: boolean = false
  ) => {
    const episodesToUpdate = alsoPrev
      ? [episodeNumber, ...confirmDialog.prevEpisodes]
      : [episodeNumber];
    setUpdatingEpisodes((prev) => new Set([...prev, ...episodesToUpdate]));
    try {
      for (const epNum of episodesToUpdate) {
        const response = await fetch(`/api/tv-shows/${tvShowId}/episodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seasonNumber: activeSeasonNumber,
            episodeNumber: epNum,
            watched: !currentStatus,
          }),
        });
        if (!response.ok) throw new Error('Failed to update episode');
      }
      setEpisodes((prev) =>
        prev.map((ep) =>
          episodesToUpdate.includes(ep.episode_number)
            ? { ...ep, watched: !currentStatus }
            : ep
        )
      );

      // Check if season is now complete
      const updatedEpisodes = episodes.map((ep) =>
        episodesToUpdate.includes(ep.episode_number)
          ? { ...ep, watched: !currentStatus }
          : ep
      );
      const allWatched =
        updatedEpisodes.length > 0 && updatedEpisodes.every((ep) => ep.watched);
      const wasNotCompleteBefore =
        episodes.length > 0 && !episodes.every((ep) => ep.watched);

      if (
        allWatched &&
        wasNotCompleteBefore &&
        congratulationsSeason !== activeSeasonNumber
      ) {
        setShowCongratulations(true);
        setCongratulationsSeason(activeSeasonNumber);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowCongratulations(false), 3000);
      }

      toast.success(
        !currentStatus ? 'Marked as watched' : 'Marked as unwatched'
      );
    } catch (error) {
      console.error('Error updating episode:', error);
      toast.error('Failed to update episode');
    } finally {
      setUpdatingEpisodes((prev) => {
        const newSet = new Set(prev);
        episodesToUpdate.forEach((ep) => newSet.delete(ep));
        return newSet;
      });
    }
  };

  const tabs = validSeasons.map((season) => ({
    id: season.season_number.toString(),
    label: `Season ${season.season_number}`,
  }));

  const watchedCount = episodes.filter((ep) => ep.watched).length;
  const totalCount = episodes.length;
  const progress = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;

  return (
    <div className="relative">
      {/* Congratulations Animation */}
      <Congratulations
        show={showCongratulations}
        onHide={() => setShowCongratulations(false)}
      />

      <Tabs
        tabs={tabs}
        activeTab={activeSeasonNumber.toString()}
        onTabChange={(tabId) => setActiveSeasonNumber(parseInt(tabId))}
        className="mb-6"
      />

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>
            {watchedCount} / {totalCount} episodes
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Episodes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading episodes...</p>
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No episodes found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                episode.watched
                  ? 'bg-success/10 border-success/30'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {episode.still_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                  alt={episode.name}
                  width={120}
                  height={68}
                  className="rounded shrink-0"
                  sizes="120px"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {episode.episode_number}. {episode.name}
                  </h3>
                  {episode.runtime && (
                    <span className="text-sm text-muted-foreground shrink-0">
                      {episode.runtime} min
                    </span>
                  )}
                </div>
                {episode.air_date && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(episode.air_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                {episode.overview && (
                  <p className="text-sm text-foreground line-clamp-2">
                    {episode.overview}
                  </p>
                )}
              </div>

              <button
                onClick={() =>
                  handleToggleEpisode(episode.episode_number, episode.watched)
                }
                disabled={updatingEpisodes.has(episode.episode_number)}
                className={`shrink-0 mt-1 p-2 rounded-full transition-colors disabled:opacity-50 ${
                  episode.watched
                    ? 'bg-success text-success-foreground hover:bg-success/90'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {episode.watched ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  <FiCircle className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={() => {
          setConfirmDialog({
            open: false,
            episodeNumber: 0,
            currentStatus: false,
            prevEpisodes: [],
          });
        }}
        onConfirm={() => {
          performToggle(
            confirmDialog.episodeNumber,
            confirmDialog.currentStatus,
            true
          );
          setConfirmDialog({
            open: false,
            episodeNumber: 0,
            currentStatus: false,
            prevEpisodes: [],
          });
        }}
        title="Mark Previous Episodes"
        message={`There are ${confirmDialog.prevEpisodes.length} previous unwatched episodes. Mark them as watched too?`}
        confirmText="Yes, mark all"
        cancelText="No, just this one"
        confirmVariant="success"
      />
    </div>
  );
}
