import { CreateCommentResponse, GetMemeCommentsResponse, GetMemesResponse, GetUserByIdResponse, LoginResponse, CreateMemeBody } from "./types";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export class NotFoundError extends Error {
  constructor() {
    super('Not Found');
  }
}

function checkStatus(response: Response) {
  if (response.status === 401) {
    throw new UnauthorizedError();
  }
  if (response.status === 404) {
    throw new NotFoundError();
  }
  return response;
}



/**
 * Authenticate the user with the given credentials
 * @param username 
 * @param password 
 * @returns 
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  return await fetch(`${BASE_URL}/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password }),
  }).then(res => checkStatus(res).json())
}

/**
 * Get a user by their id
 * @param token 
 * @param id 
 * @returns 
 */
export async function getUserById(token: string, id: string): Promise<GetUserByIdResponse> {
  return await fetch(`${BASE_URL}/users/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}



/**
 * Get the list of memes for a given page
 * @param token 
 * @param page 
 * @returns 
 */
export async function getMemes(token: string, page: number): Promise<GetMemesResponse> {
  return await fetch(`${BASE_URL}/memes?page=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}


/**
 * Get comments for a meme
 * @param token
 * @param memeId
 * @returns
 */
export async function getMemeComments(token: string, memeId: string, page: number): Promise<GetMemeCommentsResponse> {
  return await fetch(`${BASE_URL}/memes/${memeId}/comments?page=${page}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(res => checkStatus(res).json())
}

/**
 * Create a comment for a meme
 * @param token
 * @param memeId
 * @param content
 */
export async function createMemeComment(token: string, memeId: string, content: string): Promise<CreateCommentResponse> {
  return await fetch(`${BASE_URL}/memes/${memeId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content }),
  }).then(res => checkStatus(res).json());
}

/**
 * Create a new meme
 * @param token
 * @param memeDate
 */
export const formatCreateMemeData = (memeData: CreateMemeBody) => {
  const {picture, description, texts} = memeData;
  const memeFormData = new FormData();
  memeFormData.append("picture", picture.file);
  memeFormData.append("description", description);

  texts.forEach((text, index) => {
    memeFormData.append(`Texts[${index}][Content]`, text.content);
    memeFormData.append(`Texts[${index}][X]`, text.x.toString());
    memeFormData.append(`Texts[${index}][Y]`, text.y.toString());
  });
  return 
}

/**
 * Create a new meme
 * @param token
 * @param memeDate
 */
export async function createMeme(token: string, memeData: CreateMemeBody): Promise<CreateCommentResponse> {
  return await fetch(`${BASE_URL}/memes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: memeData

  }).then(res => checkStatus(res).json());
}