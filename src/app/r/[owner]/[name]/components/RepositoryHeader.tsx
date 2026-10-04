import { Avatar, Divider, Link } from '@heroui/react';
import {
  Icon,
  IconExclamationCircle,
  IconEyeFilled,
  IconGitBranch,
  IconGitCommit,
  IconGitFork,
  IconGitPullRequest,
  IconSignRightFilled,
  IconStarFilled,
  IconTagFilled
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Repository } from '@/entities/Repository';
import IntlNumberFormat from '@/helpers/intl/number';

/**
 * Repository header showing repo owner, name and quick stats.
 *
 * @param repo Repository object with counts and owner information
 * @param className Optional CSS className to apply to the root container
 */
export function RepositoryHeader({ repo, className }: { repo: Repository; className?: string }) {
  const details: Array<{ Icon: Icon; label: string; value?: number }> = useMemo(
    () => [
      { Icon: IconStarFilled, label: 'Stargazers', value: repo.stargazers_count },
      { Icon: IconEyeFilled, label: 'Watchers', value: repo.watchers_count },
      { Icon: IconGitFork, label: 'Forks', value: repo.fork_count },
      { Icon: IconExclamationCircle, label: 'Issues', value: repo.issues_count },
      { Icon: IconGitPullRequest, label: 'Pull Requests', value: repo.pull_requests_count },
      { Icon: IconTagFilled, label: 'Releases', value: repo.releases_count },
      { Icon: IconGitCommit, label: 'Commits', value: repo.commits_count },
      { Icon: IconGitBranch, label: 'Branches', value: repo.branches_count },
      { Icon: IconSignRightFilled, label: 'Milestones', value: repo.milestones_count }
    ],
    [repo]
  );

  return (
    <div className={twMerge('flex max-sm:flex-col items-center justify-center gap-1', className)}>
      <div className="flex items-center justify-center gap-1">
        <Avatar src={repo.owner.avatar_url} alt={repo.description} className="w-20 h-20" />
        <div className="flex flex-col font-extrabold">
          <Link
            className="text-xl text-gray-500"
            href={`https://github.com/${repo.owner.login}`}
            isExternal
            color="foreground"
            disableAnimation
          >
            {repo.owner.login}
          </Link>
          <Link
            className="text-3xl mt-[-.25em]"
            href={`https://github.com/${repo.name_with_owner}`}
            isExternal
            color="foreground"
            disableAnimation
          >
            {repo.name}
          </Link>
        </div>
      </div>
      <Divider orientation="vertical" className="h-16 mx-4 max-sm:rotate-90 max-sm:h-4" />
      <div className="text-sm sm:grid sm:grid-rows-3 sm:grid-flow-col sm:gap-x-5 flex justify-center flex-wrap gap-x-4 max-sm:px-2">
        {details.map(
          ({ Icon, label, value }) =>
            value !== undefined && (
              <span key={label} className="flex gap-2">
                <span className="flex justify-center items-center gap-1 text-gray-500">
                  <Icon size="1em" /> {label}:
                </span>
                <span className="font-medium">{IntlNumberFormat(value)}</span>
              </span>
            )
        )}
      </div>
    </div>
  );
}