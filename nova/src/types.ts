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
