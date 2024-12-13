import { useQuery } from "@tanstack/react-query";
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
import { getMemeComments, getMemes, getUserById } from "../../api";
import {
  GetMemeCommentsResponse,
  GetMemesResponse,
  GetUserByIdResponse,
} from "../../types";
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/loader";
import { MemePicture } from "../../components/meme-picture";
import { useState } from "react";
import { MemeCommentList } from "../../components/meme-comment-list";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();
  const [hasMoreMemes, setHasMoreMemes] = useState(true);
  const [memesLoadingPage, setMemesLoadingPage] = useState(1);

  const { isLoading, data: memes } = useQuery({
    queryKey: ["memes"],
    queryFn: async () => {
      const memes: GetMemesResponse["results"] = [];
      const firstPage = await getMemes(token, 1);
      memes.push(...firstPage.results);
      const remainingPages =
        Math.ceil(firstPage.total / firstPage.pageSize) - 1;
      /*for (let i = 0; i < remainingPages; i++) {
        const page = await getMemes(token, i + 2);
        memes.push(...page.results);
      }*/

      const memesWithAuthor = [];
      for (let meme of memes) {
        const author = await getUserById(token, meme.authorId);
        memesWithAuthor.push({
          ...meme,
          author,
        });
      }
      return memesWithAuthor;
    },
    enabled: hasMoreMemes,
  });

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading && hasMore) {
      loadMoreData();
    }
  };

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