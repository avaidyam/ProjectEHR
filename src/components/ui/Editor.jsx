/* eslint-disable import/no-extraneous-dependencies */
// THIS FILE IS COPIED FROM: https://github.com/sjdemartini/mui-tiptap/tree/main

import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useTheme, Box, Button, Stack, Typography, Icon } from "@mui/material";

import { Blockquote } from "@tiptap/extension-blockquote";
import { Bold } from "@tiptap/extension-bold";
import { BulletList } from "@tiptap/extension-bullet-list";
import { Code } from "@tiptap/extension-code";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Color } from "@tiptap/extension-color";
import { Document } from "@tiptap/extension-document";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { FontFamily } from "@tiptap/extension-font-family";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { History } from "@tiptap/extension-history";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Italic } from "@tiptap/extension-italic";
import { Link } from "@tiptap/extension-link";
import { ListItem } from "@tiptap/extension-list-item";
import { Mention } from "@tiptap/extension-mention";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Strike } from "@tiptap/extension-strike";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableCell } from "@tiptap/extension-table/cell";
import { TableHeader } from "@tiptap/extension-table/header";
import { TableRow } from "@tiptap/extension-table/row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { Text } from "@tiptap/extension-text";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import {
  LinkBubbleMenu,
  MenuButton,
  RichTextEditor,
  RichTextReadOnly,
  TableBubbleMenu,
  insertImages,
  FontSize,
  HeadingWithAnchor,
  LinkBubbleMenuHandler,
  ResizableImage,
  TableImproved,
  MenuButtonAddTable,
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonEditLink,
  MenuButtonHighlightColor,
  MenuButtonHorizontalRule,
  MenuButtonImageUpload,
  MenuButtonIndent,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonRemoveFormatting,
  MenuButtonStrikethrough,
  MenuButtonSubscript,
  MenuButtonSuperscript,
  MenuButtonTaskList,
  MenuButtonTextColor,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuButtonUnindent,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectFontFamily,
  MenuSelectFontSize,
  MenuSelectHeading,
  MenuSelectTextAlign,
  isTouchDevice,
} from "mui-tiptap";

const LockIcon = () => <Icon>lock</Icon>
const LockOpenIcon = () => <Icon>lock_open</Icon>
const TextFieldsIcon = () => <Icon>text_fields</Icon>

// Don't treat the end cursor as "inclusive" of the Link mark, so that users can
// actually "exit" a link if it's the last element in the editor (see
// https://tiptap.dev/api/schema#inclusive and
// https://github.com/ueberdosis/tiptap/issues/2572#issuecomment-1055827817).
// This also makes the `isActive` behavior somewhat more consistent with
// `extendMarkRange` (as described here
// https://github.com/ueberdosis/tiptap/issues/2535), since a link won't be
// treated as active if the cursor is at the end of the link. One caveat of this
// approach: it seems that after creating or editing a link with the link menu
// (as opposed to having a link created via autolink), the next typed character
// will be part of the link unexpectedly, and subsequent characters will not be.
// This may have to do with how we're using `insertContent` and `setLink` in
// the LinkBubbleMenu, but I can't figure out an alternative approach that
// avoids the issue. This is arguably better than being "stuck" in the link
// without being able to leave it, but it is still not quite right. See the
// related open issues here:
// https://github.com/ueberdosis/tiptap/issues/2571,
// https://github.com/ueberdosis/tiptap/issues/2572, and
// https://github.com/ueberdosis/tiptap/issues/514
const CustomLinkExtension = Link.extend({
  inclusive: false,
});

// Make subscript and superscript mutually exclusive
// https://github.com/ueberdosis/tiptap/pull/1436#issuecomment-1031937768

const CustomSubscript = Subscript.extend({
  excludes: "superscript",
});

const CustomSuperscript = Superscript.extend({
  excludes: "subscript",
});

function fileListToImageFiles(fileList) {
  // You may want to use a package like attr-accept
  // (https://www.npmjs.com/package/attr-accept) to restrict to certain file
  // types.
  return Array.from(fileList).filter((file) => {
    const mimeType = (file.type || "").toLowerCase();
    return mimeType.startsWith("image/");
  });
}

/**
 * A hook for providing a default set of useful extensions for the MUI-Tiptap
 * editor.
 */
function useExtensions({ placeholder } = {}) {
  return useMemo(() => {
    return [
      // We incorporate all of the functionality that's part of
      // https://tiptap.dev/api/extensions/starter-kit, plus a few additional
      // extensions, including mui-tiptap's

      // Note that the Table extension must come before other nodes that also have "tab"
      // shortcut keys so that when using the tab key within a table on a node that also
      // responds to that shortcut, it respects that inner node with higher precedence
      // than the Table. For instance, if you want to indent or dedent a list item
      // inside a table, you should be able to do that by pressing tab. Tab should only
      // move between table cells if not within such a nested node. See comment here for
      // notes on extension ordering
      // https://github.com/ueberdosis/tiptap/issues/1547#issuecomment-890848888, and
      // note in prosemirror-tables on the need to have these plugins be lower
      // precedence
      // https://github.com/ueberdosis/prosemirror-tables/blob/1a0428af3ca891d7db648ce3f08a2c74d47dced7/src/index.js#L26-L30
      TableImproved.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,

      BulletList,
      CodeBlock,
      Document,
      HardBreak,
      ListItem,
      OrderedList,
      Paragraph,
      CustomSubscript,
      CustomSuperscript,
      Text,

      // Blockquote must come after Bold, since we want the "Cmd+B" shortcut to
      // have lower precedence than the Blockquote "Cmd+Shift+B" shortcut.
      // Otherwise using "Cmd+Shift+B" will mistakenly toggle the bold mark.
      // (See https://github.com/ueberdosis/tiptap/issues/4005,
      // https://github.com/ueberdosis/tiptap/issues/4006)
      Bold,
      Blockquote,

      Code,
      Italic,
      Underline,
      Strike,
      CustomLinkExtension.configure({
        // autolink is generally useful for changing text into links if they
        // appear to be URLs (like someone types in literally "example.com"),
        // though it comes with the caveat that if you then *remove* the link
        // from the text, and then add a space or newline directly after the
        // text, autolink will turn the text back into a link again. Not ideal,
        // but probably still overall worth having autolink enabled, and that's
        // how a lot of other tools behave as well.
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
      }),
      LinkBubbleMenuHandler,

      // Extensions
      Gapcursor,
      HeadingWithAnchor,
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      HorizontalRule,

      ResizableImage,
      // When images are dragged, we want to show the "drop cursor" for where they'll
      // land
      Dropcursor,

      TaskList,
      TaskItem.configure({
        nested: true,
      }),

      // To enable this, copy the contents of: https://raw.githubusercontent.com/sjdemartini/mui-tiptap/refs/heads/main/src/demo/mentionSuggestionOptions.ts
      // Mention.configure({ suggestion: mentionSuggestionOptions }),

      Placeholder.configure({
        placeholder,
      }),

      // We use the regular `History` (undo/redo) extension when not using
      // collaborative editing
      History,
    ];
  }, [placeholder]);
}

function EditorMenuControls() {
  const theme = useTheme();
  return (
    <MenuControlsContainer>
      <MenuSelectFontFamily
        options={[
          { label: "Comic Sans", value: "Comic Sans MS, Comic Sans" },
          { label: "Cursive", value: "cursive" },
          { label: "Monospace", value: "monospace" },
          { label: "Serif", value: "serif" },
        ]}
      />

      <MenuDivider />

      <MenuSelectHeading />

      <MenuDivider />

      <MenuSelectFontSize />

      <MenuDivider />

      <MenuButtonBold />

      <MenuButtonItalic />

      <MenuButtonUnderline />

      <MenuButtonStrikethrough />

      <MenuButtonSubscript />

      <MenuButtonSuperscript />

      <MenuDivider />

      <MenuButtonTextColor
        defaultTextColor={theme.palette.text.primary}
        swatchColors={[
          { value: "#000000", label: "Black" },
          { value: "#ffffff", label: "White" },
          { value: "#888888", label: "Grey" },
          { value: "#ff0000", label: "Red" },
          { value: "#ff9900", label: "Orange" },
          { value: "#ffff00", label: "Yellow" },
          { value: "#00d000", label: "Green" },
          { value: "#0000ff", label: "Blue" },
        ]}
      />

      <MenuButtonHighlightColor
        swatchColors={[
          { value: "#595959", label: "Dark grey" },
          { value: "#dddddd", label: "Light grey" },
          { value: "#ffa6a6", label: "Light red" },
          { value: "#ffd699", label: "Light orange" },
          // Plain yellow matches the browser default `mark` like when using Cmd+Shift+H
          { value: "#ffff00", label: "Yellow" },
          { value: "#99cc99", label: "Light green" },
          { value: "#90c6ff", label: "Light blue" },
          { value: "#8085e9", label: "Light purple" },
        ]}
      />

      <MenuDivider />

      <MenuButtonEditLink />

      <MenuDivider />

      <MenuSelectTextAlign />

      <MenuDivider />

      <MenuButtonOrderedList />

      <MenuButtonBulletedList />

      <MenuButtonTaskList />

      {/* On touch devices, we'll show indent/unindent buttons, since they're
      unlikely to have a keyboard that will allow for using Tab/Shift+Tab. These
      buttons probably aren't necessary for keyboard users and would add extra
      clutter. */}
      {isTouchDevice() && (
        <>
          <MenuButtonIndent />

          <MenuButtonUnindent />
        </>
      )}

      <MenuDivider />

      <MenuButtonBlockquote />

      <MenuDivider />

      <MenuButtonCode />

      <MenuButtonCodeBlock />

      <MenuDivider />

      <MenuButtonImageUpload
        onUploadFiles={(files) =>
          // For the sake of a demo, we don't have a server to upload the files
          // to, so we'll instead convert each one to a local "temporary" object
          // URL. This will not persist properly in a production setting. You
          // should instead upload the image files to your server, or perhaps
          // convert the images to bas64 if you would like to encode the image
          // data directly into the editor content, though that can make the
          // editor content very large.
          files.map((file) => ({
            src: URL.createObjectURL(file),
            alt: file.name,
          }))
        }
      />

      <MenuDivider />

      <MenuButtonHorizontalRule />

      <MenuButtonAddTable />

      <MenuDivider />

      <MenuButtonRemoveFormatting />

      <MenuDivider />

      <MenuButtonUndo />
      <MenuButtonRedo />
    </MenuControlsContainer>
  );
}

export function EditorReadOnly({ value }) {
  const extensions = useExtensions({
    placeholder: "Add your own content here...",
  });
  return (
    <RichTextReadOnly
      content={value}
      extensions={extensions}
    />
  )
}

export function Editor({ placeholder, disableStickyMenuBar, disableStickyFooter = false, initialContent, onSave, onUpdate }) {
  const extensions = useExtensions({
    placeholder: placeholder,
  });
  const rteRef = useRef(null);
  const [isEditable, setIsEditable] = useState(true);
  const [showMenuBar, setShowMenuBar] = useState(true);
  const [submittedContent, setSubmittedContent] = useState(initialContent);

  const handleUpdate = useCallback(({ editor }) => {
    if (onUpdate) {
      onUpdate(editor.getHTML());
    }
  }, [onUpdate]);

  const handleNewImageFiles = useCallback(
    (files, insertPosition) => {
      if (!rteRef.current?.editor) {
        return;
      }

      // For the sake of a demo, we don't have a server to upload the files to,
      // so we'll instead convert each one to a local "temporary" object URL.
      // This will not persist properly in a production setting. You should
      // instead upload the image files to your server, or perhaps convert the
      // images to bas64 if you would like to encode the image data directly
      // into the editor content, though that can make the editor content very
      // large. You will probably want to use the same upload function here as
      // for the MenuButtonImageUpload `onUploadFiles` prop.
      const attributesForImageFiles = files.map((file) => ({
        src: URL.createObjectURL(file),
        alt: file.name,
      }));

      insertImages({
        images: attributesForImageFiles,
        editor: rteRef.current.editor,
        position: insertPosition,
      });
    },
    [],
  );

  // Allow for dropping images into the editor
  const handleDrop =
    useCallback(
      (view, event, _slice, _moved) => {
        if (!(event instanceof DragEvent) || !event.dataTransfer) {
          return false;
        }

        const imageFiles = fileListToImageFiles(event.dataTransfer.files);
        if (imageFiles.length > 0) {
          const insertPosition = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })?.pos;

          handleNewImageFiles(imageFiles, insertPosition);

          // Return true to treat the event as handled. We call preventDefault
          // ourselves for good measure.
          event.preventDefault();
          return true;
        }

        return false;
      },
      [handleNewImageFiles],
    );

  // Allow for pasting images
  const handlePaste =
    useCallback(
      (_view, event, _slice) => {
        if (!event.clipboardData) {
          return false;
        }

        const pastedImageFiles = fileListToImageFiles(
          event.clipboardData.files,
        );
        if (pastedImageFiles.length > 0) {
          handleNewImageFiles(pastedImageFiles);
          // Return true to mark the paste event as handled. This can for
          // instance prevent redundant copies of the same image showing up,
          // like if you right-click and copy an image from within the editor
          // (in which case it will be added to the clipboard both as a file and
          // as HTML, which Tiptap would otherwise separately parse.)
          return true;
        }

        // We return false here to allow the standard paste-handler to run.
        return false;
      },
      [handleNewImageFiles],
    );

  return (
    <RichTextEditor
      ref={rteRef}
      extensions={extensions}
      content={submittedContent}
      editable={isEditable}
      editorProps={{ handleDrop, handlePaste }}
      onUpdate={handleUpdate}
      renderControls={() => <EditorMenuControls />}
      RichTextFieldProps={{
        // The "outlined" variant is the default (shown here only as
        // example), but can be changed to "standard" to remove the outlined
        // field border from the editor
        variant: "outlined",
        MenuBarProps: {
          hide: !showMenuBar,
          disableSticky: disableStickyMenuBar,
        },
        // Below is an example of adding a toggle within the outlined field
        // for showing/hiding the editor menu bar, and a "submit" button for
        // saving/viewing the HTML content
        footer: !!disableStickyFooter ? (<></>) : (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              borderTopStyle: "solid",
              borderTopWidth: 1,
              borderTopColor: (theme) => theme.palette.divider,
              py: 1,
              px: 1.5,
            }}
          >
            <MenuButton
              value="formatting"
              tooltipLabel={
                showMenuBar ? "Hide formatting" : "Show formatting"
              }
              size="small"
              onClick={() => {
                setShowMenuBar((currentState) => !currentState);
              }}
              selected={showMenuBar}
              IconComponent={TextFieldsIcon}
            />

            <MenuButton
              value="formatting"
              tooltipLabel={
                isEditable
                  ? "Prevent edits (use read-only mode)"
                  : "Allow edits"
              }
              size="small"
              onClick={() => {
                setIsEditable((currentState) => !currentState);
              }}
              selected={!isEditable}
              IconComponent={isEditable ? LockIcon : LockOpenIcon}
            />

            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSubmittedContent(rteRef.current?.editor?.getHTML() ?? "");
                onSave(rteRef.current?.editor?.getHTML() ?? "");
              }}
            >
              Save
            </Button>
          </Stack>
        ),
      }}
      sx={{
        // An example of how editor styles can be overridden. In this case,
        // setting where the scroll anchors to when jumping to headings. The
        // scroll margin isn't built in since it will likely vary depending on
        // where the editor itself is rendered (e.g. if there's a sticky nav
        // bar on your site).
        "& .ProseMirror": {
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            scrollMarginTop: showMenuBar ? 50 : 0,
          },
        },
      }}
    >
      {() => (
        <>
          <LinkBubbleMenu />
          <TableBubbleMenu />
        </>
      )}
    </RichTextEditor>
  );
}

/*
<Typography variant="h5" sx={{ mt: 5 }}>
  Saved result:
</Typography>

{submittedContent ? (
  <>
    <pre style={{ marginTop: 10, overflow: "auto", maxWidth: "100%" }}>
      <code>{submittedContent}</code>
    </pre>

    <Box mt={3}>
      <Typography variant="overline" sx={{ mb: 2 }}>
        Read-only saved snapshot:
      </Typography>

      <RichTextReadOnly
        content={submittedContent}
        extensions={extensions}
      />
    </Box>
  </>
) : (
  <>
    Press “Save” above to show the HTML markup for the editor content.
    Typically you’d use a similar <code>editor.getHTML()</code> approach
    to save your data in a form.
  </>
)}
*/