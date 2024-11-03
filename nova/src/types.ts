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

export type Chat = {
  // for python backend
  // messages field equivalent to python list[dict]
  messages: any[];
};

export type Item = {
  name: string;
  quantity: number;
};

export type Response = {
  text: [{
    type: string;
    content: string;
  }],
  system_calls: [{
    type: string;
    string_param: string;
    int_param: number;
  }]
}
