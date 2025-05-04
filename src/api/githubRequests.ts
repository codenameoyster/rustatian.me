import { PROFILE_NAME, REPO_NAME } from "@/constants";
import { routes } from "./routes";

export const getMarkdownDocument = async () => {
  const response = await fetch(routes.getReadmeMarkdownDocument(PROFILE_NAME, REPO_NAME));

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};
