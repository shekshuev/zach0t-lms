import TipTapImage from "@/components/widgets/TipTapImage.vue";
import { Node, mergeAttributes } from "@tiptap/core";
import { VueRenderer } from "@tiptap/vue-3";

export const ImageComponent = Node.create({
  name: "imageComponent",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "image-component" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ({ node, editor }) => {
      const dom = document.createElement("div");
      const component = new VueRenderer(TipTapImage, {
        props: { id: node.attrs.id },
        editor,
      });
      dom.appendChild(component.element!);
      return {
        dom,
        destroy: () => component.destroy(),
      };
    };
  },
});
