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
import { MemeCommentList } from "../../components/meme-comment-list";
import { LoaderOnScroll } from "../../components/custom/loader-on-scroll";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();

  const fetchMemes = async ({
    pageParam = 1,
  }): Promise<{
    memesWithAuthor: MemeWithAuthor[];
    nextPage: number | null;
  }> => {
    const memes = [];
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

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }

  return (
    <Flex width="full" height="full" justifyContent="center" overflowY="auto">
      <VStack
        p={4}
        width="full"
        maxWidth={800}
        divider={<StackDivider border="gray.200" />}
      >
        <>
          {memes?.map((meme) => {
            return (
              
            );
          })}
          <LoaderOnScroll
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        </>
      </VStack>
    </Flex>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});
