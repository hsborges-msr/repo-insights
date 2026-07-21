import dayjs from 'dayjs';
import { EChartsOption } from 'echarts';
import { lazy, Suspense } from 'react';

const ReactECharts = lazy(() => import('echarts-for-react'));

import countBy from 'lodash-es/countBy';
import orderBy from 'lodash-es/orderBy';
import { useMemo } from 'react';
import { User } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';
import IntlNumberFormat from '@/helpers/intl/number';
import { SocialPlatforms } from '@/helpers/social';

/**
 * Scatter chart showing followers vs following for each actor.
 *
 * @param actors List of ActorInfo items used as the dataset
 * @param className Optional CSS className applied to the chart container
 */
function FollowersFollowingChart({ actors, className }: { actors: ActorInfo[]; className?: string }) {
  return (
    <ReactECharts
      className={className}
      option={
        {
          grid: { left: 70, top: 20, right: 25, bottom: 45 },
          dataset: {
            dimensions: ['followers', 'following'],
            source: actors.map((s) => {
              return {
                user: (s as User).login,
                followers: (s as User).followers_count,
                following: (s as User).following_count
              };
            })
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            formatter: (params: unknown) => {
              const p = params as Array<{ data: { user?: string; followers?: number; following?: number } }>;
              return `<b>${p[0].data.user}</b> <br/> Followers: ${IntlNumberFormat(p[0].data.followers ?? 0)} <br/> Following: ${IntlNumberFormat(
                p[0].data.following ?? 0
              )}`;
            }
          },
          xAxis: {
            type: 'value',
            name: 'Followers',
            nameLocation: 'middle',
            nameGap: 25,
            nameTextStyle: { fontWeight: 'bold' }
          },
          yAxis: {
            type: 'value',
            name: 'Following',
            nameLocation: 'middle',
            nameGap: 50,
            nameTextStyle: { fontWeight: 'bold' }
          },
          series: [
            {
              name: 'Followers vs Following',
              type: 'scatter',
              symbolSize: 5
            }
          ]
        } satisfies EChartsOption
      }
    />
  );
}

/**
 * Bar chart aggregating account ages (years since creation).
 *
 * @param actors List of ActorInfo items used to compute account ages
 * @param className Optional CSS className applied to the chart container
 */
function AccountAgeChart({ actors, className }: { actors: ActorInfo[]; className?: string }) {
  const grouped = useMemo(
    () =>
      Object.entries(countBy(actors, (s) => dayjs(Date.now()).diff((s as User).created_at, 'year') + 1)).map(
        ([age, count], index) => ({ age: index === 0 ? `<${age}` : age, count })
      ),
    [actors]
  );

  return (
    <ReactECharts
      className={className}
      option={
        {
          grid: { left: 45, top: 20, right: 25, bottom: 45 },
          dataset: [
            {
              dimensions: ['age', 'count'],
              source: grouped
            }
          ],
          tooltip: {
            trigger: 'item',
            formatter: (params: unknown) => {
              const p = params as { value: { age?: string; count?: number } };
              return `<b>${p.value.age} year(s):</b> ${IntlNumberFormat(p.value.count ?? 0)} users`;
            }
          },
          xAxis: {
            type: 'category',
            name: 'Account age (years)',
            nameLocation: 'middle',
            nameGap: 25,
            nameTextStyle: { fontWeight: 'bold' }
          },
          yAxis: {
            type: 'value'
          },
          series: [{ type: 'bar' }]
        } satisfies EChartsOption
      }
    />
  );
}

/**
 * Horizontal bar chart showing availability of social platforms among actors.
 *
 * @param actors List of ActorInfo items used to compute social availability
 * @param className Optional CSS className applied to the chart container
 */
function AvailabilityChart({ actors, className }: { actors: ActorInfo[]; className?: string }) {
  const data = useMemo(
    () =>
      orderBy(
        Object.keys(SocialPlatforms)
          .map((key) => ({
            key,
            count: actors.filter((s) => (s as User).social_accounts?.[key]).length || 0
          }))
          .filter((s) => s.count > 0),
        'count',
        'asc'
      ),
    [actors]
  );

  return (
    <ReactECharts
      className={className}
      option={
        {
          grid: { left: 25, top: 20, right: 25, bottom: 45 },
          dataset: [
            {
              dimensions: ['key', 'count'],
              source: data
            }
          ],
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params: unknown) => {
              const p = (params as Array<{ value: { key?: string; count?: number } }>)[0];
              return `<b>${p.value.key}:</b> ${IntlNumberFormat(p.value.count ?? 0)} users`;
            }
          },
          xAxis: {
            type: 'value',
            name: 'Social accounts found',
            nameLocation: 'middle',
            nameGap: 25,
            nameTextStyle: { fontWeight: 'bold' },
            splitLine: {
              lineStyle: { type: 'dashed' }
            }
          },
          yAxis: {
            type: 'category',
            axisLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          },
          series: [
            {
              type: 'bar',
              stack: 'total',
              label: {
                show: true,
                position: 'middle',
                formatter: '{@key}: {@count}'
              }
            }
          ]
        } satisfies EChartsOption
      }
    />
  );
}

/**
 * Dashboard of repository actor statistics (multiple charts).
 *
 * @param props.actors List of ActorInfo used across the charts
 */
export default function RepositoryStatistics(props: { actors: ActorInfo[] }) {
  return (
    <div className="w-full flex max-sm:flex-col gap-x-2">
      <Suspense fallback={<div className="w-1/3 h-80 bg-gray-100 animate-pulse" />}>
        <FollowersFollowingChart {...props} className="w-1/3 h-80 max-sm:w-full max-sm:h-56!" />
      </Suspense>
      <Suspense fallback={<div className="w-1/3 h-80 bg-gray-100 animate-pulse" />}>
        <AccountAgeChart {...props} className="w-1/3 h-80 max-sm:w-full max-sm:h-56!" />
      </Suspense>
      <Suspense fallback={<div className="w-1/3 h-80 bg-gray-100 animate-pulse" />}>
        <AvailabilityChart {...props} className="w-1/3 h-80 max-sm:w-full max-sm:h-56!" />
      </Suspense>
    </div>
  );
}