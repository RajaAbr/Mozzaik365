import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Flex, StackDivider, VStack } from "@chakra-ui/react";
import { getMemes, getUserById } from "../../api";
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/custom/loader";
import { LoaderOnScroll } from "../../components/custom/loader-on-scroll";
import { Meme } from "../../components/meme";
import { MemeWithAuthor } from "../../types";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();

  const fetchMemes = async ({
    pageParam = 1,
  }): Promise<{
    memesWithAuthor: MemeWithAuthor[];
    nextPage: number | null;
  }> => {
    // Fetch Meme List
    const memes = [];
    console.log("rrrrrrrr");
    const loadedMemesInPage = await getMemes(token, pageParam);
    console.log("rrrrrrrr", loadedMemesInPage);

    memes.push(...loadedMemesInPage.results);
    // Add author data to MemeList
    const memesWithAuthor: MemeWithAuthor[] = [];
    for (let meme of memes) {
      const author = await getUserById(token, meme.authorId);
      memesWithAuthor.push({
        ...meme,
        author,
      });
    }
    // Check if nextPage exists
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

  // Flat all meme pages on on single array
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
          {memes?.map((meme) => <Meme key={meme.id} meme={meme} />)}
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
