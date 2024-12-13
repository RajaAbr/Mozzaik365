import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Textarea,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { MemePictureProps } from "../../components/meme-picture";
import { MemeEditor } from "../../components/meme-editor";
import { useAuthToken } from "../../contexts/authentication";
import { createMeme } from "../../api";

export const Route = createFileRoute("/_authentication/create")({
  component: CreateMemePage,
});

type Picture = {
  url: string;
  file: File;
};

function CreateMemePage() {
  const token = useAuthToken();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [picture, setPicture] = useState<Picture | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [texts, setTexts] = useState<MemePictureProps["texts"]>([]);
  const [description, setDescription] = useState<string>("");

  const { mutate } = useMutation({
    mutationFn: async () => {
      await createMeme(token, {
        picture,
        description,
        texts,
      });
    },
    onSuccess: () => {
      toast({
        title: "Meme Created Successfully",
        description: `With Description: ${description}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      // Refresh Meme List on Create Success
      queryClient.invalidateQueries(["memes"]);
    },
  });

  const handleDrop = (file: File) => {
    setPicture({
      url: URL.createObjectURL(file),
      file,
    });
  };

  const handleAddCaptionButtonClick = () => {
    setTexts([
      ...texts,
      {
        content: captionText,
        x: Math.round(Math.random() * 400),
        y: Math.round(Math.random() * 225),
      },
    ]);
    setCaptionText("");
  };

  const handleDeleteCaptionButtonClick = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  const handleMemeCreate = () => mutate();

  const memePicture = useMemo(() => {
    if (!picture) {
      return undefined;
    }

    return {
      pictureUrl: picture.url,
      texts,
    };
  }, [picture, texts]);

  return (
    <Flex width="full" height="full">
      <Box flexGrow={1} height="full" p={4} overflowY="auto">
        <VStack spacing={5} align="stretch">
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Upload your picture
            </Heading>
            <MemeEditor onDrop={handleDrop} memePicture={memePicture} />
          </Box>
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Describe your meme
            </Heading>
            <Textarea
              placeholder="Type your description here..."
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </VStack>
      </Box>
      <Flex
        flexDir="column"
        width="30%"
        minW="250"
        height="full"
        boxShadow="lg"
      >
        <Heading as="h2" size="md" mb={2} p={4}>
          Add your captions
        </Heading>
        <Box p={4} flexGrow={1} height={0} overflowY="auto">
          <VStack>
            <Input
              value={captionText}
              mr={1}
              onChange={(event) => setCaptionText(event.target.value)}
            />
            {texts.map((text, index) => (
              <Flex width="full" key={text.x}>
                <Text color="green" variant="ghost" size="sm" width="full">
                  {text.content}
                </Text>
                <IconButton
                  onClick={() => handleDeleteCaptionButtonClick(index)}
                  aria-label="Delete caption"
                  icon={<Icon as={Trash} />}
                />
              </Flex>
            ))}
            <Button
              colorScheme="cyan"
              leftIcon={<Icon as={Plus} />}
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleAddCaptionButtonClick}
              isDisabled={memePicture === undefined}
            >
              Add a caption
            </Button>
          </VStack>
        </Box>
        <HStack p={4}>
          <Button
            as={Link}
            to="/"
            colorScheme="cyan"
            variant="outline"
            size="sm"
            width="full"
          >
            Cancel
          </Button>
          <Button
            colorScheme="cyan"
            size="sm"
            width="full"
            color="white"
            isDisabled={memePicture === undefined}
            onClick={handleMemeCreate}
          >
            Submit
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
