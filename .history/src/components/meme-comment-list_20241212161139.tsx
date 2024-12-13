import { useEffect, useState } from "react";
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
import { createMemeComment, getMemeComments, getUserById } from "../api";
import { GetMemeCommentsResponse, MemeComment, MemeWithAuthor } from "../types";
import { jwtDecode } from "jwt-decode";
import { useAuthToken } from "../contexts/authentication";
import { Loader } from "./loader";

export type MemeCommentListProps = {
  meme: MemeWithAuthor;
};

export const MemeCommentList = ({ meme }: MemeCommentListProps) => {
  const token = useAuthToken();
  /*const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await getUserById(token, jwtDecode<{ id: string }>(token).id);
    },
  });*/

  const { mutate } = useMutation({
    mutationFn: async (data: { memeId: string; content: string }) => {
      await createMemeComment(token, data.memeId, data.content);
    },
  });

  const [commentContent, setCommentContent] = useState<{
    [key: string]: string;
  }>({});
  const [openedCommentSection, setOpenedCommentSection] = useState<
    string | null
  >(null);

  const { isLoading, data: comments } = useQuery({
    queryKey: ["memeComments", meme.id],
    queryFn: async () => {
      const comments: MemeComment[] = [];

      const memeComments: GetMemeCommentsResponse["results"] = [];

      const firstPage = await getMemeComments(token, meme.id, 1);
      memeComments.push(...firstPage.results);
      const remainingCommentPages =
        Math.ceil(firstPage.total / firstPage.pageSize) - 1;
      for (let i = 0; i < remainingCommentPages; i++) {
        const page = await getMemeComments(token, meme.id, i + 2);
        memeComments.push(...page.results);
      }
      for (let comment of memeComments) {
        const author = await getUserById(token, comment.authorId);
        comments.push({ ...comment, author });
      }

      return comments;
    },
  });

  /*const getmemesWithAuthorAndComments;
  const memesWithAuthorAndComments = [];
  for (let meme of memes) {
    const author = await getUserById(token, meme.authorId);
    const comments: GetMemeCommentsResponse["results"] = [];
    const firstPage = await getMemeComments(token, meme.id, 1);
    comments.push(...firstPage.results);
    const remainingCommentPages =
      Math.ceil(firstPage.total / firstPage.pageSize) - 1;
    for (let i = 0; i < remainingCommentPages; i++) {
      const page = await getMemeComments(token, meme.id, i + 2);
      comments.push(...page.results);
    }
    const commentsWithAuthor: (GetMemeCommentsResponse["results"][0] & {
      author: GetUserByIdResponse;
    })[] = [];
    for (let comment of comments) {
      const author = await getUserById(token, comment.authorId);
      commentsWithAuthor.push({ ...comment, author });
    }
    memesWithAuthorAndComments.push({
      ...meme,
      author,
      comments: commentsWithAuthor,
    });
  }
  return memesWithAuthorAndComments;*/

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }

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
                name={meme.author?.username}
                src={meme.author?.pictureUrl}
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
          {comments?.map((comment) => (
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
