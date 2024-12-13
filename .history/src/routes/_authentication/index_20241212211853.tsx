import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  Box,
  Flex,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { format } from "timeago.js";
import { getMemes, getUserById } from "../../api";
import { GetMemesResponse, MemeWithAuthor } from "../../types";
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/loader";
import { MemePicture } from "../../components/meme-picture";
import { useCallback, useRef, useState } from "react";
import { MemeCommentList } from "../../components/meme-comment-list";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();
  const [hasMoreMemes, setHasMoreMemes] = useState(true);
  const [memesLoadingPage, setMemesLoadingPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchMemes = async (): Promise<{
    memesWithAuthor: MemeWithAuthor[];
    nextPage: number | null;
  }> => {
    const memes: any = [];
    const loadedMemesInPage = await getMemes(token, memesLoadingPage);
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

    const nextPage =
      remainingPages > memesLoadingPage ? memesLoadingPage + 1 : null;
    return { memesWithAuthor, nextPage };
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["memes", memesLoadingPage],
    queryFn: fetchMemes,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Observer to detect when the user scrolls to the end
  const observer = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observerRef.current.observe(node);
  }, []);

  const memes = data?.pages.flatMap((page) => page.memesWithAuthor) || [];
  console.log("eee", memes);

  const handleScroll = useCallback(
    (e: any) => {
      if (isFetchingNextPage) return;

      if (
        e.target.scrollHeight - e.target.scrollTop ===
        e.target.clientHeight
      ) {
        setMemesLoadingPage((prevPage) => prevPage + 1);
      }
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }
  return (
    <Flex
      width="full"
      height="full"
      justifyContent="center"
      overflowY="auto"
      //onScroll={handleScroll}
    >
      <VStack
        p={4}
        width="full"
        maxWidth={800}
        divider={<StackDivider border="gray.200" />}
      >
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
      </VStack>
    </Flex>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});
