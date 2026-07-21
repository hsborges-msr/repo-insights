import { Select, SelectItem } from '@heroui/react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utcTime from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { EChartsOption } from 'echarts';
import { lazy, Suspense } from 'react';

const ReactECharts = lazy(() => import('echarts-for-react'));

import countBy from 'lodash-es/countBy';
import groupBy from 'lodash-es/groupBy';
import mapValues from 'lodash-es/mapValues';
import { useEffect, useMemo, useState } from 'react';
import { useBoolean } from 'react-use';
import { Release, Stargazer } from '@/core';

dayjs.extend(utcTime);
dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);
dayjs.extend(advancedFormat);

/**
 * Line chart visualizing stargazer activity over time with optional release markers.
 *
 * - Supports absolute or cumulative series, multiple granularities and linear/log scales
 *
 * @param stargazers Array of Stargazer events (starred_at)
 * @param releases Optional list of releases used to mark events on the chart
 */
export function StargazersGraph({ stargazers, releases }: { stargazers: Stargazer[]; releases?: Release[] }) {
  const [type, setType] = useState<'absolute' | 'cumulative'>('absolute');
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const [scale, setScale] = useState<'linear' | 'log'>('linear');
  const [showMax, setShowMax] = useBoolean(true);
  const [showAvg, setShowAvg] = useBoolean(true);
  const [showReleases, setShowReleases] = useBoolean(true);

  useEffect(() => setGranularity(stargazers.length > 5000 ? 'month' : 'week'), [stargazers]);

  useEffect(() => {
    setShowMax(type !== 'cumulative');
    setShowAvg(type !== 'cumulative');
  }, [setShowAvg, setShowMax, type]);

  const releasesSeries = useMemo(
    () =>
      mapValues(
        groupBy(releases || [], (r) => {
          const d = dayjs(r.published_at).utc();
          if (granularity === 'week') return d.format('wo/YYYY');
          if (granularity === 'month') return d.format('MMM/YYYY');
          if (granularity === 'year') return d.format('YYYY');
          else return d.format('DD/MMM/YYYY');
        }),
        (k) => k.map((r) => r.name)
      ),
    [releases, granularity]
  );

  const series = useMemo(() => {
    let data: Array<{ date: string; stargazers: number }> = Object.entries(
      countBy(stargazers, (s) => {
        const d = dayjs(s.starred_at).utc();
        if (granularity === 'week') return d.format('wo/YYYY');
        if (granularity === 'month') return d.format('MMM/YYYY');
        if (granularity === 'year') return d.format('YYYY');
        else return d.format('DD/MMM/YYYY');
      })
    ).map(([date, count]) => ({ date, stargazers: count }));

    if (type === 'cumulative') {
      data = data.reduce(
        (acc, { date, stargazers: count }, index) => [
          ...acc,
          { date, stargazers: index === 0 ? count : count + acc[index - 1].stargazers }
        ],
        [] as typeof data
      );
    }

    return data;
  }, [stargazers, type, granularity]);

  return (
    <div className="flex max-sm:flex-col gap-2">
      <Suspense fallback={<div className="h-full! grow bg-gray-100 animate-pulse" />}>
        <ReactECharts
          className="h-full! grow"
          option={
            {
              grid: { left: 40, top: 20, right: 20, bottom: 20 },
              tooltip: {
                trigger: 'axis'
              },
              dataset: {
                dimensions: ['date', 'stargazers'],
                source: series
              },
              xAxis: {
                type: 'category',
                axisTick: { show: true }
              },
              yAxis: scale === 'linear' ? { type: 'value' } : { type: 'log', logBase: 2 },
              series: [
                {
                  name: 'Stargazers',
                  type: 'line',
                  showSymbol: false,
                  markLine: {
                    animation: false,
                    label: { show: true, position: 'insideEndTop' },
                    lineStyle: { type: 'dashed', opacity: 0.5 },
                    data: [
                      showAvg && type === 'absolute' ? { type: 'median' as const, name: 'Median' } : null,
                      showMax && type === 'absolute' ? { type: 'max' as const, name: 'Max' } : null
                    ].filter((m) => m !== null)
                  },
                  markPoint: {
                    tooltip: {
                      trigger: 'item',
                      formatter: `<b>Releases:</b> {b}`,
                      borderColor: 'transparent'
                    },
                    data: showReleases
                      ? Object.entries(releasesSeries).map(([date, releases]) => ({
                          symbol:
                            'image://data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgd2lkdGg9IjI0IiAgaGVpZ2h0PSIyNCIgIHZpZXdCb3g9IjAgMCAyNCAyNCIgIGZpbGw9ImN1cnJlbnRDb2xvciIgIGNsYXNzPSJpY29uIGljb24tdGFibGVyIGljb25zLXRhYmxlci1maWxsZWQgaWNvbi10YWJsZXItdGFnIj48cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTEuMTcyIDJhMyAzIDAgMCAxIDIuMTIxIC44NzlsNy43MSA3LjcxYTMuNDEgMy40MSAwIDAgMSAwIDQuODIybC01LjU5MiA1LjU5MmEzLjQxIDMuNDEgMCAwIDEgLTQuODIyIDBsLTcuNzEgLTcuNzFhMyAzIDAgMCAxIC0uODc5IC0yLjEyMXYtNS4xNzJhNCA0IDAgMCAxIDQgLTR6bS0zLjY3MiAzLjVhMiAyIDAgMCAwIC0xLjk5NSAxLjg1bC0uMDA1IC4xNWEyIDIgMCAxIDAgMiAtMiIgLz48L3N2Zz4=',
                          symbolSize: 15,
                          symbolRotate: 90,
                          symbolOffset: ['50%', '-50%'],
                          itemStyle: { color: 'red', borderColor: 'red', opacity: 0.5 },
                          symbolKeepAspect: true,
                          name:
                            releases.slice(0, 3).join(', ') + (releases.length > 3 ? ` (+${releases.length - 3})` : ''),
                          yAxis: series.find((s) => s.date === date)?.stargazers || 0,
                          xAxis: date
                        }))
                      : []
                  }
                }
              ]
            } satisfies EChartsOption
          }
        />
      </Suspense>
      <div className="flex flex-col justify-center sm:w-48 sm:gap-4 sm:mt-[-2em] max-sm:grid max-sm:grid-cols-2 max-sm:gap-2 max-sm:mx-4">
        <Select
          label="Series"
          labelPlacement="outside"
          size="sm"
          selectedKeys={[type]}
          onSelectionChange={(keys) => keys.currentKey && setType(keys.currentKey as typeof type)}
        >
          <SelectItem key="absolute">Absolute</SelectItem>
          <SelectItem key="cumulative">Cumulative</SelectItem>
        </Select>
        <Select
          label="Granularity"
          labelPlacement="outside"
          size="sm"
          selectedKeys={[granularity]}
          onSelectionChange={(keys) => keys.currentKey && setGranularity(keys.currentKey as typeof granularity)}
        >
          <SelectItem key="day">Daily</SelectItem>
          <SelectItem key="week">Weekly</SelectItem>
          <SelectItem key="month">Monthly</SelectItem>
          <SelectItem key="year">Yearly</SelectItem>
        </Select>
        <Select
          label="Scale"
          labelPlacement="outside"
          size="sm"
          selectedKeys={[scale]}
          onSelectionChange={(keys) => keys.currentKey && setScale(keys.currentKey as typeof scale)}
        >
          <SelectItem key="linear">Linear</SelectItem>
          <SelectItem key="log">Log</SelectItem>
        </Select>
        <Select
          label="References"
          labelPlacement="outside"
          size="sm"
          multiple
          selectionMode="multiple"
          selectedKeys={[showAvg && 'avg', showMax && 'max', showReleases && 'releases'].filter(Boolean) as string[]}
          onSelectionChange={(keys) => {
            const set = keys as Set<string>;
            setShowAvg(set.has('avg'));
            setShowMax(set.has('max'));
            setShowReleases(set.has('releases'));
          }}
        >
          <SelectItem key="avg">Avg</SelectItem>
          <SelectItem key="max">Max</SelectItem>
          <SelectItem key="releases">Releases</SelectItem>
        </Select>
      </div>
    </div>
  );
}