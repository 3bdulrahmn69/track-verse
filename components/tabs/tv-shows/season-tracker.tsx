'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiCircle } from 'react-icons/fi';
import { Tabs } from '@/components/ui/tabs';
import type { Season, Episode } from '@/lib/tmdb';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Congratulations } from '@/components/shared/congratulations';
import { EpisodeDetailsDialog } from './episode-details-dialog';

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

        const data = await response.json();

        // Check if show was completed
        if (data.showCompleted) {
          toast.success('🎉 Congratulations! You completed the entire show!', {
            autoClose: 5000,
          });
        }
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

    setUpdatingAllEpisodes(true);
    setUpdatingEpisodes(new Set(episodes.map(ep => ep.episode_number)));

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

      const results = await Promise.all(updatePromises);

      // Check if show was completed (only when marking as watched)
      if (newWatchedStatus) {
        const completionResult = results.find(result => result.showCompleted);
        if (completionResult) {
          toast.success('🎉 Congratulations! You completed the entire show!', {
            autoClose: 5000,
          });
        }
      }

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
        newWatchedStatus ? 'Marked all episodes as watched' : 'Marked all episodes as unwatched'
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

      const data = await response.json();

      // Check if show was completed
      if (data.showCompleted) {
        toast.success('🎉 Congratulations! You completed the entire show!', {
          autoClose: 5000,
        });
      }

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

  console.log(episodes);

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

      {/* Mark All Button */}
      {episodes.length > 0 && (
        <div className="mb-6">
          <button
            onClick={handleMarkAllEpisodes}
            disabled={updatingAllEpisodes || updatingEpisodes.size > 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            {updatingAllEpisodes ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Updating...
              </>
            ) : watchedCount === totalCount ? (
              <>
                <FiCircle className="w-4 h-4" />
                Mark All as Unwatched
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                Mark All as Watched
              </>
            )}
          </button>
        </div>
      )}

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
              onClick={() => handleEpisodeClick(episode)}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEpisode(episode.episode_number, episode.watched);
                }}
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
