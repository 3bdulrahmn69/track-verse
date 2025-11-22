'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiCircle } from 'react-icons/fi';
import { Tabs } from '@/components/ui/tabs';
import type { Season, Episode } from '@/lib/tmdb';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Congratulations } from '@/components/shared/congratulations';
import { EpisodeDetailsDialog } from './episode-details-dialog';
import { EpisodeCard } from './episode-card';
import { Popover } from '@/components/ui/popover';

interface SeasonTrackerProps {
  tvShowId: number;
  seasons: Season[];
}

interface EpisodeWithStatus extends Episode {
  watched: boolean;
  userRating?: number | null;
  userComment?: string | null;
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
  const [updatingAllEpisodes, setUpdatingAllEpisodes] = useState(false);
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
  const [markAllUnwatchedDialog, setMarkAllUnwatchedDialog] = useState(false);
  const [selectedEpisode, setSelectedEpisode] =
    useState<EpisodeWithStatus | null>(null);
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);

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
        const episode = episodes.find((ep) => ep.episode_number === epNum);
        const response = await fetch(`/api/tv-shows/${tvShowId}/episodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seasonNumber: activeSeasonNumber,
            episodeNumber: epNum,
            watched: !currentStatus,
            episodeName: episode?.name,
            runtime: episode?.runtime,
          }),
        });
        if (!response.ok) throw new Error('Failed to update episode');

        // Show completion handled by backend
        await response.json();
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

  const handleMarkAllEpisodes = async () => {
    const allWatched = watchedCount === totalCount;
    const newWatchedStatus = !allWatched;

    // Show confirmation dialog when marking all as unwatched
    if (allWatched) {
      setMarkAllUnwatchedDialog(true);
      return;
    }

    // Proceed with marking all as watched
    await performMarkAllEpisodes(newWatchedStatus);
  };

  const performMarkAllEpisodes = async (newWatchedStatus: boolean) => {
    setUpdatingAllEpisodes(true);
    setUpdatingEpisodes(new Set(episodes.map((ep) => ep.episode_number)));

    try {
      // Update all episodes
      const updatePromises = episodes.map(async (episode) => {
        const response = await fetch(`/api/tv-shows/${tvShowId}/episodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seasonNumber: activeSeasonNumber,
            episodeNumber: episode.episode_number,
            watched: newWatchedStatus,
            episodeName: episode.name,
            runtime: episode.runtime,
          }),
        });

        if (!response.ok) throw new Error('Failed to update episode');
        return response.json();
      });

      await Promise.all(updatePromises);

      // Update local state
      setEpisodes((prev) =>
        prev.map((ep) => ({ ...ep, watched: newWatchedStatus }))
      );

      // Check if season completion congratulations should be shown
      if (newWatchedStatus && congratulationsSeason !== activeSeasonNumber) {
        setShowCongratulations(true);
        setCongratulationsSeason(activeSeasonNumber);
        setTimeout(() => setShowCongratulations(false), 3000);
      }

      toast.success(
        newWatchedStatus
          ? 'Marked all episodes as watched'
          : 'Marked all episodes as unwatched'
      );
    } catch (error) {
      console.error('Error updating all episodes:', error);
      toast.error('Failed to update episodes');
    } finally {
      setUpdatingAllEpisodes(false);
      setUpdatingEpisodes(new Set());
    }
  };

  const tabs = validSeasons.map((season) => ({
    id: season.season_number.toString(),
    label: `Season ${season.season_number}`,
  }));

  const watchedCount = episodes.filter((ep) => ep.watched).length;
  const totalCount = episodes.length;
  const progress = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;

  const handleEpisodeClick = (episode: EpisodeWithStatus) => {
    setSelectedEpisode(episode);
    setEpisodeDialogOpen(true);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedEpisode) return;

    try {
      const response = await fetch(`/api/tv-shows/${tvShowId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seasonNumber: activeSeasonNumber,
          episodeNumber: selectedEpisode.episode_number,
          watched: true,
          episodeName: selectedEpisode.name,
          runtime: selectedEpisode.runtime,
          userRating: rating,
          userComment: comment,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      // Show completion handled by backend
      await response.json();

      // Update local state
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.episode_number === selectedEpisode.episode_number
            ? { ...ep, watched: true, userRating: rating, userComment: comment }
            : ep
        )
      );

      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
      throw error;
    }
  };

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
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <div className="flex items-center gap-3">
            <span>
              {watchedCount} / {totalCount} episodes
            </span>
            {episodes.length > 0 && (
              <Popover
                content={
                  watchedCount === totalCount
                    ? 'Mark All as Unwatched'
                    : 'Mark All as Watched'
                }
                position="left"
              >
                <button
                  onClick={handleMarkAllEpisodes}
                  disabled={updatingAllEpisodes || updatingEpisodes.size > 0}
                  className={`shrink-0 p-2 rounded-full transition-colors disabled:opacity-50 ${
                    watchedCount === totalCount
                      ? 'bg-success text-success-foreground hover:bg-success/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {updatingAllEpisodes ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : watchedCount === totalCount ? (
                    <FiCircle className="w-5 h-5" />
                  ) : (
                    <FiCheck className="w-5 h-5" />
                  )}
                </button>
              </Popover>
            )}
          </div>
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
            <EpisodeCard
              key={episode.id}
              episode={episode}
              onToggle={handleToggleEpisode}
              onClick={handleEpisodeClick}
              isUpdating={updatingEpisodes.has(episode.episode_number)}
            />
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
      <ConfirmDialog
        isOpen={markAllUnwatchedDialog}
        onClose={() => setMarkAllUnwatchedDialog(false)}
        onConfirm={() => {
          performMarkAllEpisodes(false);
          setMarkAllUnwatchedDialog(false);
        }}
        title="Mark All as Unwatched"
        message="Are you sure you want to mark all episodes in this season as unwatched? This will reset your progress."
        confirmText="Yes"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {selectedEpisode && (
        <EpisodeDetailsDialog
          isOpen={episodeDialogOpen}
          onClose={() => {
            setEpisodeDialogOpen(false);
            setSelectedEpisode(null);
          }}
          episode={{
            name: selectedEpisode.name,
            overview: selectedEpisode.overview,
            still_path: selectedEpisode.still_path,
            episode_number: selectedEpisode.episode_number,
            season_number: activeSeasonNumber,
            air_date: selectedEpisode.air_date,
            runtime: selectedEpisode.runtime,
          }}
          tvShowId={tvShowId}
          onSubmitReview={handleSubmitReview}
          initialRating={selectedEpisode.userRating || 0}
          initialComment={selectedEpisode.userComment || ''}
        />
      )}
    </div>
  );
}
