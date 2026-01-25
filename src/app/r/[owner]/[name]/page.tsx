'use client';

import flatten from 'lodash-es/flatten';
import groupBy from 'lodash-es/groupBy';
import mapValues from 'lodash-es/mapValues';
import orderBy from 'lodash-es/orderBy';
import { Alert, Button, Skeleton, Spinner } from '@heroui/react';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import numeral from 'numeral';
import { useEffect, useMemo } from 'react';
import { useBoolean } from 'react-use';
import { Actor, Reaction, User } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';
import useAuth from '@/hooks/useAuth';
import useRepository from '@/hooks/useRepository';
import useResources from '@/hooks/useResources';
import Loading from './components/Loading';
import { PageSection } from './components/PageSection';
import RepositoryError from './components/RepositoryError';
import { RepositoryHeader } from './components/RepositoryHeader';
import RepositoryHighlights from './components/RepositoryHighlights';
import RepositoryNotFound from './components/RepositoryNotFound';
import RepositoryStatistics from './components/RepositoryStatistics';
import RepositoryTable from './components/RepositoryTable';
import { StargazersGraph } from './components/StargazersGraph';

/**
 *  Page component for a repository
 */
export default function Repository() {
  const { user } = useAuth();
  const params = useParams<{ owner: string; name: string }>();

  const [paused, setPaused] = useBoolean(true);

  const repo = useRepository(params.owner, params.name);
  const stars = useResources(params.owner, params.name, 'stargazers', paused);
  const releases = useResources(params.owner, params.name, 'releases', paused);
  const watchers = useResources(params.owner, params.name, 'watchers', paused);

  useEffect(() => setPaused(false), [setPaused]);

  const users = useMemo<ActorInfo[]>(() => {
    const starred: ActorInfo[] = (stars.value || []).map((s) => ({
      ...(s.user as User),
      events: [{ type: 'starred', date: s.starred_at }]
    }));

    const watched: ActorInfo[] = (watchers.value || []).map((s) => ({
      ...(s.user as User),
      events: [{ type: 'watching', date: new Date(0) }]
    }));

    const released = (releases.value || [])
      .map((r) => (r.author ? { ...r.author, events: [{ type: 'release', date: r.created_at }] } : null))
      .filter((a) => a !== null) as ActorInfo[];

    const reacted = flatten(
      (releases.value || []).map((r) => {
        return ((r.reactions || []) as Reaction[])?.map(
          (ra) =>
            ({
              ...(ra.user as Actor),
              events: [{ type: 'reaction', date: ra.created_at }]
            }) satisfies ActorInfo
        );
      })
    );

    const merged = Object.values(groupBy([...starred, ...released, ...watched, ...reacted], 'id')).map((rest) => ({
      ...rest.at(0),
      events: orderBy(flatten(rest.map((e) => e.events)), 'date', 'desc')
    }));

    return orderBy(merged, 'events.[0].date', 'desc') as ActorInfo[];
  }, [stars.value, releases.value, watchers.value]);

  const progress = useMemo(
    () =>
      mapValues(
        {
          stargazers: stars.hasMore ? (stars.value?.length || 0) / (repo.value?.stargazers_count || 0) : 1,
          releases: releases.hasMore ? (releases.value?.length || 0) / (repo.value?.releases_count || 0) : 1,
          watchers: watchers.hasMore ? (watchers.value?.length || 0) / (repo.value?.watchers_count || 0) : 1
        },
        (v) => numeral(Math.min(1, v)).format('0.[00]%')
      ),
    [repo, stars, releases, watchers]
  );

  const hasMore = useMemo(() => stars.hasMore || releases.hasMore || watchers.hasMore, [stars, releases, watchers]);
  const isLoading = useMemo(
    () => repo.loading || stars.loading || releases.loading || watchers.loading,
    [repo, stars, releases, watchers]
  );
  const error = useMemo(
    () => repo.error || stars.error || releases.error || watchers.error,
    [repo, stars, releases, watchers]
  );

  if (repo.loading) {
    return <Loading className="-mt-12" />;
  } else {
    if (error) return <RepositoryError error={error} />;
    if (!repo.value) return <RepositoryNotFound />;

    return (
      <div className="flex flex-col gap-8">
        <RepositoryHeader repo={repo.value} className="mt-8" />

        {hasMore && (
          <Alert
            color="default"
            title={
              isLoading
                ? 'Collecting data ...'
                : `Data collection stopped ${(!user && '(sign in first to continue)') || ''}`
            }
            icon={isLoading ? <Spinner color="default" size="sm" /> : <IconPlayerPauseFilled stroke={2} />}
            description={
              <span className="max-sm:text-xs">
                Stargazers: {progress.stargazers} | Releases: {progress.releases} | Watchers: {progress.watchers}
              </span>
            }
            endContent={
              isLoading ? (
                <Button color="default" size="md" variant="flat" onPress={() => setPaused(true)}>
                  <IconPlayerPauseFilled size="1.2em" className="font-lg" />
                  Pause
                </Button>
              ) : (
                <Button color="default" size="md" variant="flat" onPress={() => setPaused(false)} isDisabled={!user}>
                  <IconPlayerPlayFilled size="1.2em" className="font-lg" />
                  Resume
                </Button>
              )
            }
            variant="flat"
          />
        )}

        <Skeleton isLoaded={!!users.length}>
          <RepositoryHighlights actors={users} />
        </Skeleton>

        <Skeleton isLoaded={!!stars.value?.length}>
          <PageSection title="Stars History">
            <StargazersGraph stargazers={stars.value || []} releases={releases.value} />
          </PageSection>
        </Skeleton>

        <Skeleton isLoaded={!!users.length}>
          <PageSection title="Users Overview">
            <RepositoryStatistics actors={users} />
          </PageSection>
        </Skeleton>

        <Skeleton isLoaded={!!users.length}>
          <RepositoryTable actors={users} />
        </Skeleton>
      </div>
    );
  }
}
