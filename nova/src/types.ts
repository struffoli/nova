export type Text = {
  color: string;
  centered: boolean;
  bold: boolean;
  italicized: boolean;
  content: string; // also contains type
};

export type Page = {
  id: number;
  title: string;
  content: Text[];
};

export type Chat = { // for python backend
  // messages field equivalent to python list[dict]
  messages: any[]
}
