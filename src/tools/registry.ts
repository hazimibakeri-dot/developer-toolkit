import type { ComponentType } from 'react';
import { Base64Tool } from './Base64Tool';
import { HashTool } from './HashTool';
import { JsonTool } from './JsonTool';
import { TextCaseTool } from './TextCaseTool';
import { TimestampTool } from './TimestampTool';
import type { ToolProps } from './types';
import { UrlTool } from './UrlTool';
import { UuidTool } from './UuidTool';

export interface ToolDefinition {
  id: string;
  title: string;
  /** Short label for the navigation. */
  label: string;
  component: ComponentType<ToolProps>;
}

export const TOOLS = [
  { id: 'json', title: 'JSON formatter and validator', label: 'JSON', component: JsonTool },
  { id: 'uuid', title: 'UUID generator', label: 'UUID', component: UuidTool },
  { id: 'timestamp', title: 'Timestamp converter', label: 'Timestamp', component: TimestampTool },
  { id: 'text-case', title: 'Text case converter', label: 'Text case', component: TextCaseTool },
  { id: 'url', title: 'URL encoder and decoder', label: 'URL encode', component: UrlTool },
  { id: 'base64', title: 'Base64 encoder and decoder', label: 'Base64', component: Base64Tool },
  { id: 'hash', title: 'Hash generator', label: 'Hash', component: HashTool },
] as const satisfies readonly ToolDefinition[];

export type ToolId = (typeof TOOLS)[number]['id'];
export const TOOL_IDS: readonly ToolId[] = TOOLS.map((tool) => tool.id);
