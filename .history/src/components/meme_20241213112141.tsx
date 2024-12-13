import { Avatar, Box, Flex, Text, VStack } from "@chakra-ui/react";
import { MemePicture } from "./meme-picture";
import { format } from "timeago.js";
import { MemeWithAuthor } from "../types";
import { MemeCommentList } from "./meme-comment-list";

export const Meme = ({ meme }: { meme: MemeWithAuthor }) => {
  const { id, author, createdAt, pictureUrl, description, texts } = meme;
  return (
    <VStack key={id} p={4} width="full" align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex>
          <Avatar
            borderWidth="1px"
            borderColor="gray.300"
            size="xs"
            name={author.username}
            src={author.pictureUrl}
          />
          <Text ml={2} data-testid={`meme-author-${id}`}>
            {author.username}
          </Text>
        </Flex>
        <Text fontStyle="italic" color="gray.500" fontSize="small">
          {format(createdAt)}
        </Text>
      </Flex>
      <MemePicture
        pictureUrl={pictureUrl}
        texts={texts}
        dataTestId={`meme-picture-${id}`}
      />
      <Box>
        <Text fontWeight="bold" fontSize="medium" mb={2}>
          Description:{" "}
        </Text>
        <Box p={2} borderRadius={8} border="1px solid" borderColor="gray.100">
          <Text
            color="gray.500"
            whiteSpace="pre-line"
            data-testid={`meme-description-${id}`}
          >
            {meme.description}
          </Text>
        </Box>
      </Box>
      <MemeCommentList meme={meme} />
    </VStack>
  );
};
