Issues Found:

/**** Configuration ****/
  - CompilerOptions are missing in the tsconfig.json.
  - Some types are missing in tsconfig.app.json to enable linting.

/**** Authentification ****/
  - Missing storing token inside the local storage to prevent login on each refresh.
  - Missing the check of the token expiration date.
  - Missing the compare of the user token with the stored token in local sotrage (with some api call like /api/authentication/me wisch renders the right token for the given user)

/**** Components and performance ****/
  - All memes are displaying in oneshot, it is not performant ( waste of memory and time with severals iterations and several api calls). => I choose to load next page on scrolling to the end of the window.
  - All comments are loaded in oneShot, it is not performant => I choose to load comments on clicking in the collapsable panel of the comments.

/**** New features added ****/
  - A small toast displayed on meme create success.
  - On click on MemeFactory text in the Header, it will redirect to the home page.

/**** New unit test added ****/
  - An unit test for meme new comment creation

   