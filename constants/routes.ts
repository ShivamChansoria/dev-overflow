const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ASK_QUESTION: "/ask-question",
  COLLECTION: "/collection",
  COMMUNITY: "/community",
  TAGS: "/tags",
  JOBS: "/jobs",
  QUESTION: (id: string) => `/questions/${id}`, //Will be passed as 'ROUTES.QUESTION(38);
  PROFILE: (id: string) => `/profile/${id}`, //Will be passed as 'ROUTES.PROFILE(38);
  TAG: (id: string) => `/tag/${id}`,
  SIGN_IN_WITH_OAUTH: "/sign-in-with-oauth",
};

export default ROUTES;
