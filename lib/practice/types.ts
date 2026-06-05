export type PracticeCategory =
  | "array"
  | "function"
  | "async"
  | "react"
  | "oop";

export type PracticeDifficulty = "easy" | "medium" | "hard";

export interface PracticeProblemMeta {
  id: string;
  title: string;
  category: PracticeCategory;
  difficulty: PracticeDifficulty;
  tags?: string[];
  entry: string; // relative path to source, e.g., "problems/array-fill/code.js"
  updatedAt?: string;
}

export interface PracticeProblem extends PracticeProblemMeta {
  code: string; // file content from disk
  prompt?: string; // optional prompt.md content
  lang: "javascript" | "jsx";
}

export interface PracticeManifest {
  problems: PracticeProblemMeta[];
}

export default PracticeProblemMeta;
