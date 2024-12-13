/********* Login *******/
export type LoginResponse = {
  jwt: string
}

/********* User *******/
export type GetUserByIdResponse = {
  id: string;
  username: string;
  pictureUrl: string;
}

/********* Memes *******/
export type Meme = {
  id: string;
  authorId: string;
  pictureUrl: string;
  description: string;
  commentsCount: string;
  texts: {
    content: string;
    x: number;
    y: number;
  }[];
  createdAt: string;
};

export type MemeWithAuthor = Meme & {
  author: GetUserByIdResponse,
}

export type MemeWithAuthorAndComments = Meme & {
  author: GetUserByIdResponse,
  comments: MemeComment[],
}


export type GetMemesResponse = {
  total: number;
  pageSize: number;
  results: Meme[];
}

export type CreateMemeBody = { picture: Picture | null; description: string; texts: { content: string; x: number; y: number; }[]; }

/********* MemesComment *******/
export type GetMemeCommentResponse = {
  id: string;
  authorId: string;
  memeId: string;
  content: string;
  createdAt: string;
}

export type GetMemeCommentsResponse = {
  total: number;
  pageSize: number;
  results: GetMemeCommentResponse[]
}

export type MemeComment = GetMemeCommentResponse & {
  author: GetUserByIdResponse;
}


export type CreateCommentResponse = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  memeId: string;
}

