"use client";
import { BoldItalicUnderlineToggles, ChangeCodeMirrorLanguage, codeBlockPlugin, codeMirrorPlugin, ConditionalContents, CreateLink, diffSourcePlugin, imagePlugin, InsertCodeBlock, InsertImage, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, ListsToggle, MDXEditor, tablePlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
// InitializedMDXEditor.tsx
import type { ForwardedRef } from 'react'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  type MDXEditorMethods,
  type MDXEditorProps
} from '@mdxeditor/editor'
import './dark-editor.css';
import { basicDark } from "cm6-theme-basic-dark"


import React from 'react';
import { useTheme } from 'next-themes';
import { Separator } from '@radix-ui/react-dropdown-menu';

interface Props {
  value: string;
  fieldChange: (value: string) => void;
  editorRef: ForwardedRef<MDXEditorMethods> | null;
}

const Editor = ({ value, editorRef, fieldChange }: Props) => {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? [basicDark] : [];
  return (
    <MDXEditor
      className='background-light800_dark200 light-border-2 markdown-editor dark-editor w-full border grid'
      markdown={value}
      onChange={fieldChange}
      ref={editorRef}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        imagePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            js: 'JavaScript',
            jsx: 'JavaScript React',
            ts: 'TypeScript',
            tsx: 'TypeScript React',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            css: 'CSS',
            html: 'HTML',
            json: 'JSON',
            "": "unspecified",
          },
          autoLoadLanguageSupport: true,
          codeMirrorExtensions: theme
        }),
        diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),//Will create a diff view of the markdown splits of the editor and selector.
        toolbarPlugin({
          toolbarContents: () => (
            <ConditionalContents
              options={[
                {
                  when: (editor) => editor?.editorType === 'codeblock',
                  contents: () => <ChangeCodeMirrorLanguage />
                },
                {
                  fallback: () => (
                    <>
                      <UndoRedo />
                      <Separator />
                      <BoldItalicUnderlineToggles />
                      <Separator />
                      <CreateLink />
                      <InsertImage />
                      <Separator />
                      <ListsToggle />
                      <Separator />
                      <InsertTable />
                      <InsertThematicBreak />
                      <InsertCodeBlock />
                    </>
                  )
                }
              ]}
            />
          )
        })
      ]}
    />
  );
};

export default Editor;
