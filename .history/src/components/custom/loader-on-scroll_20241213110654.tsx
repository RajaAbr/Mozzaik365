import { Box, Text, Spinner } from "@chakra-ui/react";

type LoaderOnScrollProps = {
  loadMoreRef: HTMLDivElement | null;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
};

export const LoaderOnScroll: React.FC = () => {
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
