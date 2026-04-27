import { useEffect, useState } from "react";

const WATCHLIST_KEY = "vidcluster_watchlist";

function readStoredWatchlist() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(WATCHLIST_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [watchedTopicIds, setWatchedTopicIds] = useState<string[]>(() => readStoredWatchlist());

  useEffect(() => {
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchedTopicIds));
  }, [watchedTopicIds]);

  const isWatched = (topicId: string) => watchedTopicIds.includes(topicId);

  const addTopic = (topicId: string) => {
    setWatchedTopicIds((currentTopicIds) =>
      currentTopicIds.includes(topicId) ? currentTopicIds : [...currentTopicIds, topicId],
    );
  };

  const removeTopic = (topicId: string) => {
    setWatchedTopicIds((currentTopicIds) =>
      currentTopicIds.filter((currentTopicId) => currentTopicId !== topicId),
    );
  };

  const toggleTopic = (topicId: string) => {
    setWatchedTopicIds((currentTopicIds) =>
      currentTopicIds.includes(topicId)
        ? currentTopicIds.filter((currentTopicId) => currentTopicId !== topicId)
        : [...currentTopicIds, topicId],
    );
  };

  return {
    watchedTopicIds,
    isWatched,
    addTopic,
    removeTopic,
    toggleTopic,
  };
}
