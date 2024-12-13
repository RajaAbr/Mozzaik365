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
import { getMemes, getUserById } from "../../api";
import { GetMemesResponse } from "../../types";
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
    queryKey: ["memes", memesLoadingPage],
    queryFn: async () => {
      const memes: GetMemesResponse["results"] = [];
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
      return memesWithAuthor;
    },
    onSuccess: (data) => {
      console.log("Data fetched successfully:", data);
      // Additional side effects can be triggered here
    },
  });

  const handleScroll = (e: any) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      setMemesLoadingPage((prevPage) => prevPage + 1);
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
