import type { Ref } from 'react';

export interface ToolProps {
  title: string;
  /** Receives focus when the user switches to this tool. */
  headingRef?: Ref<HTMLHeadingElement>;
}
