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

export type MemeComment = GetMemeCommentResponse & {
  author: GetUserByIdResponse;
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