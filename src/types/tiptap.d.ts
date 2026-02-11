declare module '@tiptap/extension-blockquote';
declare module '@tiptap/extension-bold';
declare module '@tiptap/extension-bullet-list';
declare module '@tiptap/extension-code';
declare module '@tiptap/extension-code-block';
declare module '@tiptap/extension-color';
declare module '@tiptap/extension-document';
declare module '@tiptap/extension-dropcursor';
declare module '@tiptap/extension-font-family';
declare module '@tiptap/extension-gapcursor';
declare module '@tiptap/extension-hard-break';
declare module '@tiptap/extension-highlight';
declare module '@tiptap/extension-history';
declare module '@tiptap/extension-horizontal-rule';
declare module '@tiptap/extension-italic';
declare module '@tiptap/extension-link';
declare module '@tiptap/extension-list-item';
declare module '@tiptap/extension-mention';
declare module '@tiptap/extension-ordered-list';
declare module '@tiptap/extension-paragraph';
declare module '@tiptap/extension-placeholder';
declare module '@tiptap/extension-strike';
declare module '@tiptap/extension-subscript';
declare module '@tiptap/extension-superscript';
declare module '@tiptap/extension-table/cell';
declare module '@tiptap/extension-table/header';
declare module '@tiptap/extension-table/row';
declare module '@tiptap/extension-task-item';
declare module '@tiptap/extension-task-list';
declare module '@tiptap/extension-text';
declare module '@tiptap/extension-text-align';
declare module '@tiptap/extension-text-style';
declare module '@tiptap/extension-underline';

declare module 'prosemirror-model';
declare module 'prosemirror-state';
declare module 'prosemirror-view';
declare module 'prosemirror-transform';

declare module 'teaful' {
    export default function createStore<T>(initial: T, onUpdate?: (ctx: { store: any, prevStore: any }) => void): { useStore: any, getStore: any, setStore: any, withStore: any };
}

declare module '@google/genai' {
    export class GoogleGenAI {
        constructor(options: any);
        [key: string]: any;
    }
    export type GoogleGenAIOptions = any;
    export type LiveConnectConfig = any;
    export type LiveServerMessage = any;
    export type LiveClientToolResponse = any;
    export type Part = any;
    export type LiveServerContent = any;
    export type LiveServerToolCall = any;
    export type LiveServerToolCallCancellation = any;
    export type Session = any;
    export type Chat = any;
    export type LiveCallbacks = any;
    export type Content = any;
    export type LiveClientEventTypes = any;
}
