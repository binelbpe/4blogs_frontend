import { useState, useEffect } from 'react';

const useInfiniteScroll = (callback, hasMore) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isFetching) return;

      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 100
      ) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  useEffect(() => {
    if (!isFetching) return;

    const loadMore = async () => {
      await callback();
      setIsFetching(false);
    };

    loadMore();
  }, [isFetching, callback]);

  return [isFetching, setIsFetching];
};

export default useInfiniteScroll; 