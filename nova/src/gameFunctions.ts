import { Text, Page, Chat, Response } from "./types";

export async function getPage(
  id: number,
  chat: Chat,
  query: String
): Promise<[Page, Chat]> {
  // first page, use id start_game with query as name
  if (id === 1) {
    // post request to localhost:5432/start_game(player_name)
    const api_response = await fetch(
      encodeURI("http://localhost:5432/start_game?player_name=" + query.trim()),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "",
      }
    );
    const data = await api_response.json();
    // it returns an object with a messages field equivalent to python list[dict]
    // the newest message is the last element in the list, use as page

    const content = data.messages[data.messages.length - 1].content;
    // parse content into Response object
    const response: Response = JSON.parse(content);
    console.log(response);

    // process text_blocks
    let page_text: Text[] = [];
    for (let i = 0; i < response.text.length; i++) {
      const text = response.text[i];
      page_text.push({
        color: text.type === "dialogue" ? "#ddd" : "#3f3",
        centered: false,
        bold: false,
        italicized: false,
        content: text.content,
      });
    }

    // process system_calls

    const newChat: Chat = data;
    const page: Page = {
      id: id,
      title: "Game Start!",
      content: page_text,
    };
    return [page, newChat];
  } else {
    // post request to localhost:5432/make_move
    //  takes user_move parameter, and Chat as request body
    const api_response = await fetch(
      encodeURI("http://localhost:5432/make_move?user_move=" + query.trim()),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chat),
      }
    );
    const data = await api_response.json();
    const newChat: Chat = data;

    const content = data.messages[data.messages.length - 1].content;
    // parse content into Response object
    const response: Response = JSON.parse(content);
    console.log(response);

    // process text_blocks
    let page_text: Text[] = [];
    for (let i = 0; i < response.text.length; i++) {
      const text = response.text[i];
      page_text.push({
        color: text.type === "dialogue" ? "#ddd" : "#3f3",
        centered: false,
        bold: false,
        italicized: false,
        content: text.content,
      });
    }

    // set title of new page is the user's move with "..." at the end if too long
    const title = query.length > 32 ? query.substring(0, 32) + "..." : query;
    const page: Page = {
      id: id,
      title: title.toString(),
      content: page_text,
    };
    return [page, newChat];
  }

  try {
    // throw new Error("Error calling API");
    // return strings.placeholder + " You last typed: " + query;
  } catch (error) {
    throw new Error("Error calling API");
  }
  return [page, chat];
}
