import { Page } from "./types";

const strings = {
  placeholder:
    "This is some placeholder text. You will be prompted about what to do next. Type what you'd like to do in the input line.",
};

export async function getPage(query: String): Promise<Page> {
  // call api
  try {
    throw new Error("Error calling API");
    // return strings.placeholder + " You last typed: " + query;
  } catch (error) {
    throw new Error("Error calling API");
  }
}
