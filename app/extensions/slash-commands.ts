import TipTapCommandList from "@/components/widgets/TipTapCommandList.vue";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { VueRenderer } from "@tiptap/vue-3";
import tippy, { type Instance as TippyInstance } from "tippy.js";

function getItems({ query }: { query: string }): SuggestionItem[] {
  const base: SuggestionItem[] = [
    {
      name: "paragraph",
      icon: "mdi:text",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      name: "heading-1",
      icon: "i-lucide-heading-1",
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run(),
    },
    {
      name: "heading-2",
      icon: "i-lucide-heading-2",
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run(),
    },
    {
      name: "heading-3",
      icon: "i-lucide-heading-3",
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run(),
    },
    {
      name: "unordered-list",
      icon: "i-lucide-list",
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      name: "ordered-list",
      icon: "i-lucide-list-ordered",
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      name: "code-block",
      icon: "i-lucide-code",
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      name: "blockquote",
      icon: "i-lucide-quote",
      command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      name: "table",
      icon: "i-lucide-table",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      name: "upload-image",
      icon: "i-lucide-image",
      command: ({ editor, range }) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          const form = new FormData();
          form.append("file", file);

          const res = await fetch("/api/images/upload", {
            method: "POST",
            body: form,
          });

          const data = await res.json();
          if (data?.id) {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent({
                type: "imageComponent",
                attrs: { id: data.id },
              })
              .run();
          }
        };
        input.click();
      },
    },
  ];

  return base.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
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
          let component: VueRenderer;
          let popup: TippyInstance;

          return {
            onStart: (props: SuggestionProps) => {
              component = new VueRenderer(TipTapCommandList, {
                props: {
                  items: getItems(props),
                  command: (item: any) => {
                    item.command({ editor: props.editor, range: props.range });
                    popup?.destroy();
                  },
                },
                editor: props.editor,
              });

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: component.element!,
                theme: "none",
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              })[0] as TippyInstance;
            },

            onUpdate: (props: SuggestionProps) => {
              component.updateProps({
                items: getItems(props),
                command: (item: any) => {
                  item.command({ editor: props.editor, range: props.range });
                  popup?.destroy();
                },
              });

              popup?.setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },

            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === "Escape") {
                popup?.hide();
                return true;
              }

              return component.ref?.onKeyDown?.(props.event) ?? false;
            },

            onExit: () => {
              popup?.destroy();
              component?.destroy();
            },
          };
        },
        items: getItems,
      },
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
