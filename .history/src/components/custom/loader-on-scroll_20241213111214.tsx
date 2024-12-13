import { Box, Text, Spinner } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

type LoaderOnScrollProps = {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: 
};

export const LoaderOnScroll = ({
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: LoaderOnScrollProps) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage]);

  return (
    <Box
      ref={loadMoreRef}
      display="flex"
      justifyContent="center"
      alignItems="center"
      mt={4}
      p={4}
      bg="gray.100"
      borderRadius="md"
      boxShadow="sm"
    >
      {isFetchingNextPage ? (
        <Spinner size="lg" color="blue.500" />
      ) : hasNextPage ? (
        <Text color="blue.500" fontWeight="bold">
          Scroll down to load more...
        </Text>
      ) : (
        <Text color="gray.500">No more data to load</Text>
      )}
    </Box>
  );
};
