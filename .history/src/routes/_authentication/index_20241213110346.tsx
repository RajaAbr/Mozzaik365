import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  Box,
  Flex,
  StackDivider,
  Text,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { format } from "timeago.js";
import { getMemes, getUserById } from "../../api";
import { MemeWithAuthor } from "../../types";
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/custom/loader";
import { MemePicture } from "../../components/meme-picture";
import { useCallback, useEffect, useRef } from "react";
import { MemeCommentList } from "../../components/meme-comment-list";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchMemes = async ({
    pageParam = 1,
  }): Promise<{
    memesWithAuthor: MemeWithAuthor[];
    nextPage: number | null;
  }> => {
    const memes: any = [];
    const loadedMemesInPage = await getMemes(token, pageParam);
    memes.push(...loadedMemesInPage.results);
    const memesWithAuthor = [];
    for (let meme of memes) {
      const author = await getUserById(token, meme.authorId);
      memesWithAuthor.push({
        ...meme,
        author,
      });
    }
    const remainingPages =
      Math.ceil(loadedMemesInPage.total / loadedMemesInPage.pageSize) - 1;

    const nextPage = remainingPages > pageParam ? pageParam + 1 : null;
    return { memesWithAuthor, nextPage };
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["memes"],
      queryFn: fetchMemes,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    });

  const memes = data?.pages.flatMap((page) => page.memesWithAuthor) || [];

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

  const handleScroll = (e: any) => {
    console.log(
      "scroll",
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    );
    if (isFetchingNextPage) return;
    if (
      hasNextPage &&
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    ) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }

  return (
    <Flex
      width="full"
      height="full"
      justifyContent="center"
      overflowY="auto"
      onScroll={handleScroll}
    >
      <VStack
        p={4}
        width="full"
        maxWidth={800}
        divider={<StackDivider border="gray.200" />}
      >
        <>
          {memes?.map((meme) => {
            return (
              <VStack key={meme.id} p={4} width="full" align="stretch">
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex>
                    <Avatar
                      borderWidth="1px"
                      borderColor="gray.300"
                      size="xs"
                      name={meme.author.username}
                      src={meme.author.pictureUrl}
                    />
                    <Text ml={2} data-testid={`meme-author-${meme.id}`}>
                      {meme.author.username}
                    </Text>
                  </Flex>
                  <Text fontStyle="italic" color="gray.500" fontSize="small">
                    {format(meme.createdAt)}
                  </Text>
                </Flex>
                <MemePicture
                  pictureUrl={meme.pictureUrl}
                  texts={meme.texts}
                  dataTestId={`meme-picture-${meme.id}`}
                />
                <Box>
                  <Text fontWeight="bold" fontSize="medium" mb={2}>
                    Description:{" "}
                  </Text>
                  <Box
                    p={2}
                    borderRadius={8}
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Text
                      color="gray.500"
                      whiteSpace="pre-line"
                      data-testid={`meme-description-${meme.id}`}
                    >
                      {meme.description}
                    </Text>
                  </Box>
                </Box>

                <MemeCommentList meme={meme} />
              </VStack>
            );
          })}
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
        </>
      </VStack>
    </Flex>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});
