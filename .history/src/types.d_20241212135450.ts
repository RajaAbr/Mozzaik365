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

/********* Meme *******/
