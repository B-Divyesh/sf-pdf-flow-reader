export type ReaderTheme = 'cream' | 'white' | 'dark' | 'contrast';
export type ReaderFont = 'serif' | 'sans' | 'hyper';

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  wordSpacing: number;
  theme: ReaderTheme;
  font: ReaderFont;
  measure: number;
}

export interface FlowBlock {
  id: string;
  page: number;
  text: string;
  kind: 'heading' | 'paragraph';
  level?: number;
}

export interface SavedDocument {
  id: string;
  name: string;
  pageCount: number;
  blocks: FlowBlock[];
  confidence: number;
  confidenceNotes: string[];
  currentBlock: number;
  settings: ReaderSettings;
  updatedAt: number;
  createdAt: number;
}

export const defaultSettings: ReaderSettings = {
  fontSize: 22,
  lineHeight: 1.65,
  wordSpacing: 0.06,
  theme: 'cream',
  font: 'serif',
  measure: 66
};
