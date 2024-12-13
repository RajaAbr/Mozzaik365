import { useState } from "react";
import {
  Avatar,
  Box,
  Collapse,
  Icon,
  Flex,
  LinkBox,
  LinkOverlay,
  Text,
  Input,
  VStack,
} from "@chakra-ui/react";
import { CaretDown, CaretUp, Chat } from "@phosphor-icons/react";
import { format } from "timeago.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createMemeComment,
  getUserById,
  MemeWithAuthorAndComments,
} from "../api";
import { jwtDecode } from "jwt-decode";
import { useAuthToken } from "../contexts/authentication";

export type MemeCommentListProps = {
  meme: MemeWithAuthorAndComments;
  openedCommentSection: string | null;
};

export const MemeCommentList = ({
  meme,
  openedCommentSection,
}: MemeCommentListProps) => {
  const token = useAuthToken();
  const [openedCommentSection, setOpenedCommentSection] = useState<
    string | null
  >(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await getUserById(token, jwtDecode<{ id: string }>(token).id);
    },
  });
  const { mutate } = useMutation({
    mutationFn: async (data: { memeId: string; content: string }) => {
      await createMemeComment(token, data.memeId, data.content);
    },
  });

  const [commentContent, setCommentContent] = useState<{
    [key: string]: string;
  }>({});

  return (
    <>
      <LinkBox as={Box} py={2} borderBottom="1px solid black">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <LinkOverlay
              data-testid={`meme-comments-section-${meme.id}`}
              cursor="pointer"
              onClick={() =>
                setOpenedCommentSection(
                  openedCommentSection === meme.id ? null : meme.id
                )
              }
            >
              <Text data-testid={`meme-comments-count-${meme.id}`}>
                {meme.commentsCount} comments
              </Text>
            </LinkOverlay>
            <Icon
              as={openedCommentSection !== meme.id ? CaretDown : CaretUp}
              ml={2}
              mt={1}
            />
          </Flex>
          <Icon as={Chat} />
        </Flex>
      </LinkBox>
      <Collapse in={openedCommentSection === meme.id} animateOpacity>
        <Box mb={6}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (commentContent[meme.id]) {
                mutate({
                  memeId: meme.id,
                  content: commentContent[meme.id],
                });
              }
            }}
          >
            <Flex alignItems="center">
              <Avatar
                borderWidth="1px"
                borderColor="gray.300"
                name={user?.username}
                src={user?.pictureUrl}
                size="sm"
                mr={2}
              />
              <Input
                placeholder="Type your comment here..."
                onChange={(event) => {
                  setCommentContent({
                    ...commentContent,
                    [meme.id]: event.target.value,
                  });
                }}
                value={commentContent[meme.id]}
              />
            </Flex>
          </form>
        </Box>
        <VStack align="stretch" spacing={4}>
          {meme.comments.map((comment) => (
            <Flex key={comment.id}>
              <Avatar
                borderWidth="1px"
                borderColor="gray.300"
                size="sm"
                name={comment.author.username}
                src={comment.author.pictureUrl}
                mr={2}
              />
              <Box p={2} borderRadius={8} bg="gray.50" flexGrow={1}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex>
                    <Text
                      data-testid={`meme-comment-author-${meme.id}-${comment.id}`}
                    >
                      {comment.author.username}
                    </Text>
                  </Flex>
                  <Text fontStyle="italic" color="gray.500" fontSize="small">
                    {format(comment.createdAt)}
                  </Text>
                </Flex>
                <Text
                  color="gray.500"
                  whiteSpace="pre-line"
                  data-testid={`meme-comment-content-${meme.id}-${comment.id}`}
                >
                  {comment.content}
                </Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </Collapse>
    </>
  );
};
