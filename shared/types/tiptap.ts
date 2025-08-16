import type { Editor, Range } from "@tiptap/core";

export interface SuggestionProps {
  query: string;
  editor: Editor;
  range: Range;
  clientRect: () => DOMRect;
}

export interface SuggestionItem {
  name: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}
