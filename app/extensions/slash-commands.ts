import TipTapCommandList from "@/components/widgets/TipTapCommandList.vue";
import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import type { Editor } from "@tiptap/vue-3";
import { h, render } from "vue";

type Item = {
  title: string;
  subtitle?: string;
  icon?: string;
  command: (props: { editor: Editor }) => void;
};

function getItems({ editor, query }: { editor: Editor; query: string }): Item[] {
  const base: Item[] = [
    {
      title: "Heading 1",
      icon: "i-lucide-heading-1",
      command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      icon: "i-lucide-heading-2",
      command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      icon: "i-lucide-heading-3",
      command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: "Bullet list",
      icon: "i-lucide-list",
      command: ({ editor }) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "Ordered list",
      icon: "i-lucide-list-ordered",
      command: ({ editor }) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "Code block",
      icon: "i-lucide-code",
      command: ({ editor }) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "Blockquote",
      icon: "i-lucide-quote",
      command: ({ editor }) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "Table 3×3",
      icon: "i-lucide-table",
      command: ({ editor }) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: "Math block",
      icon: "i-lucide-sigma",
      command: ({ editor }) =>
        editor
          .chain()
          .focus()
          .insertContent({ type: "mathDisplay", attrs: { latex: "" } })
          .run(),
    },
    {
      title: "Math inline",
      icon: "i-lucide-sigma",
      command: ({ editor }) =>
        editor
          .chain()
          .focus()
          .insertContent({ type: "mathInline", attrs: { latex: "" } })
          .run(),
    },
    {
      title: "Horizontal rule",
      icon: "i-lucide-minus",
      command: ({ editor }) => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  return base.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
}

const SlashCommands = Extension.create({
  name: "slash-commands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: true,
        allowSpaces: true,
        render: () => {
          let component: any;
          let popup: HTMLElement;

          return {
            onStart: props => {
              component = document.createElement("div");
              popup = component;
              const vnode = h(TipTapCommandList, {
                items: getItems({ editor: props.editor as any, query: props.query }),
                command: (item: any) => {
                  item.command({ editor: props.editor as any });
                  props.command();
                },
              });
              render(vnode, component);
              props.clientRect && document.body.appendChild(popup);
              position();
            },
            onUpdate: props => {
              const vnode = h(TipTapCommandList, {
                items: getItems({ editor: props.editor as any, query: props.query }),
                command: (item: any) => {
                  item.command({ editor: props.editor as any });
                  props.command();
                },
              });
              render(vnode, popup);
              position();
            },
            onKeyDown: props => {
              if (props.event.key === "Escape") {
                props.event.preventDefault();
                props.command();
                return true;
              }
              return false;
            },
            onExit: () => {
              if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
            },
          };

          function position() {
            const rect = (window as any)._lastClientRect || null;
            const r = rect || { left: window.innerWidth / 2, top: window.innerHeight / 2, bottom: 0 };
            popup.style.position = "absolute";
            popup.style.left = `${r.left}px`;
            popup.style.top = `${(r.bottom || r.top) + 8}px`;
            popup.style.zIndex = "9999";
          }
        },
        items: ({ editor, query }: any) => getItems({ editor, query }),
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        render: this.options.suggestion!.render as any,
      }),
    ];
  },
});

export default SlashCommands;
