// Adapter types for the small subset of ECharts features we use
import type { EChartsOption as _EChartsOption } from 'echarts';

// Re-export the full option type for callers that import it from the library
export type EChartsOption = _EChartsOption;

// Tighten formatter callback shapes used in this repo.
export type TooltipFormatterParams = Array<{
  data: Record<string, unknown> & {
    user?: string;
    followers?: number;
    following?: number;
    age?: string;
    count?: number;
  };
}>;

export type TooltipFormatter = (params: TooltipFormatterParams | { value: unknown } | unknown) => string;

declare module 'echarts' {
  // Export the adapter types so consumers can import from 'src/types/echarts.d.ts'
  export type EChartsOption = _EChartsOption;
}
