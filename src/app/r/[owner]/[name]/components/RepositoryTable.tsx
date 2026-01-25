import {
  Checkbox,
  Divider,
  Pagination,
  Select,
  SelectItem,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User as UserAvatar
} from '@heroui/react';
import { IconDownload, IconMail } from '@tabler/icons-react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeFormat from 'dayjs/plugin/relativeTime';
import countBy from 'lodash-es/countBy';
import orderBy from 'lodash-es/orderBy';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useBoolean } from 'react-use';
import { DATE_FORMATS, PAGINATION } from '@/constants';
import { Actor, User } from '@/core';
import { ActorInfo } from '@/entities/ActorInfo';
import IntlNumberFormat from '@/helpers/intl/number';
import { SocialPlatforms } from '@/helpers/social';

dayjs.extend(localizedFormat);
dayjs.extend(relativeFormat);

/**
 * Table view for repository actors (stargazers/watchers).
 *
 * - Displays paginated results with sortable columns and optional details
 * - Supports exporting the current actor list as JSON
 *
 * @param props.actors Array of ActorInfo objects to render
 */
export default function RepositoryTable({ actors }: { actors: ActorInfo[] }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [descriptor, setDescriptor] = useState<SortDescriptor[]>([]);
  const [showDetails, setShowDetails] = useBoolean(false);

  const items = useMemo(() => {
    const orderedItems = descriptor
      ? orderBy(
          actors || [],
          descriptor.map((desc) =>
            desc.column === 'events'
              ? (e: Actor & { events?: Array<Record<string, unknown>> }) => e.events?.length || 0
              : (e: Actor & Record<string, unknown>) => e[desc.column as keyof Actor] ?? ''
          ),
          descriptor.map((desc) => (desc.direction === 'ascending' ? 'asc' : 'desc'))
        )
      : actors;
    const start = (page - 1) * perPage;
    return orderedItems.slice(start, start + perPage) || [];
  }, [actors, descriptor, page, perPage]);

  return (
    <Table
      isCompact
      isStriped
      removeWrapper
      sortDescriptor={descriptor.at(0)}
      onSortChange={({ column, direction }) =>
        setDescriptor([
          { column, direction: column !== descriptor.at(0)?.column ? 'descending' : direction },
          ...descriptor.filter((d) => d.column !== column)
        ])
      }
      bottomContent={
        <div className="flex max-sm:flex-col-reverse max-sm:gap-4 w-full justify-between max-sm:justify-center px-4 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div>
              <strong>Total:</strong> {IntlNumberFormat(actors.length)}
            </div>
            <Divider orientation="vertical" className="h-4" />
            <Checkbox
              size="sm"
              classNames={{ label: 'text-sm text-gray-500 ml-[-5px]' }}
              disabled
              defaultChecked={showDetails}
              onValueChange={(selected) => setShowDetails(selected)}
            >
              Show details
            </Checkbox>
            <Divider orientation="vertical" className="h-4" />
            <Link
              className="flex gap-1 text-sm text-gray-500"
              href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(actors))}`}
              target="_blank"
              download={`users-data-${Date.now()}.json`}
            >
              <IconDownload className="w-4 h-auto" /> Download
            </Link>
          </div>
          <Pagination
            isCompact
            showControls
            showShadow
            size="sm"
            page={page}
            total={Math.ceil(actors.length / perPage)}
            onChange={(p) => setPage(p)}
          />
          <div className="flex w-36 max-sm:hidden">
            <Select
              label="Per page"
              variant="underlined"
              size="sm"
              defaultSelectedKeys={new Set([`${perPage}`])}
              onSelectionChange={(values) => setPerPage(Number(values.currentKey || `${PAGINATION.DEFAULT_PAGE_SIZE}`))}
            >
              {PAGINATION.PAGE_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt}>{opt}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      }
      className="overflow-x-auto overflow-y-hidden pb-4"
    >
      <TableHeader>
        <TableColumn align="center" key="login" allowsSorting>
          USER
        </TableColumn>
        <TableColumn align="center" key="events" allowsSorting>
          ACTIONS
        </TableColumn>
        <TableColumn align="center" key="followers_count" allowsSorting>
          FOLLOWERS
        </TableColumn>
        <TableColumn align="center" key="following_count" allowsSorting>
          FOLLOWING
        </TableColumn>
        <TableColumn align="center" key="created_at" allowsSorting>
          ACCOUNT AGE
        </TableColumn>
        <TableColumn align="center" key="company" allowsSorting>
          COMPANY
        </TableColumn>
        <TableColumn align="center" key="location" allowsSorting>
          LOCATION
        </TableColumn>
        <TableColumn align="center" key="social">
          SOCIAL
        </TableColumn>
        <TableColumn align="center" key="is_hireable" allowsSorting hidden={!showDetails}>
          HIREABLE
        </TableColumn>
        <TableColumn align="center" key="is_github_star" allowsSorting hidden={!showDetails}>
          STAR
        </TableColumn>
        <TableColumn align="center" key="is_campus_expert" allowsSorting hidden={!showDetails}>
          EXPERT
        </TableColumn>
      </TableHeader>
      <TableBody emptyContent="No stargazers found" loadingContent={<Spinner label="Loading..." />}>
        {items.map((item) => {
          const user = item as User;
          return (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex gap-3 items-center">
                  <UserAvatar
                    avatarProps={{ size: 'sm', src: user.avatar_url, className: 'max-sm:w-7 max-sm:h-7' }}
                    description={user.name?.slice(0, 20)}
                    name={<Link target="_blank" href={`https://github.com/${user.login}`}>{`@${user.login}`}</Link>}
                  />
                </div>
              </TableCell>
              <TableCell>
                {Object.entries(countBy(item.events, 'type'))
                  .map(([event, count]) => `${event}: ${count}`)
                  .map(([event, count]) => (
                    <div key={event} className="text-xs">
                      {event}: {count}
                    </div>
                  ))}
              </TableCell>
              <TableCell>{IntlNumberFormat(user.followers_count)}</TableCell>
              <TableCell>{IntlNumberFormat(user.following_count)}</TableCell>
              <TableCell>
                <abbr title={`Created at ${dayjs(user.created_at).format(DATE_FORMATS.LONG)}`}>
                  {dayjs(user.created_at).fromNow(true)}
                </abbr>
              </TableCell>
              <TableCell>{user.company}</TableCell>
              <TableCell>{user.location}</TableCell>
              <TableCell>
                <div className="flex gap-2 justify-center">
                  {user.social_accounts &&
                    Object.entries(user.social_accounts).map(([name, value]) => {
                      if (!SocialPlatforms[name]) return null;
                      const { Icon, url } = SocialPlatforms[name];

                      return (
                        <span key={name} className="flex justify-center items-center text-xm">
                          <Link href={`${url ? `${url}/` : ''}${value}`} target="_blank">
                            <Icon size="1.25em" />
                          </Link>
                        </span>
                      );
                    })}
                  {user.email && (
                    <span className="flex justify-center items-center text-xm">
                      <Link href={`mailto:${user.email}`} target="_blank">
                        <IconMail size="1.25em" />
                      </Link>
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell hidden={!showDetails}>
                <Checkbox isSelected={user.is_hireable} isDisabled size="sm" color="default" />
              </TableCell>
              <TableCell hidden={!showDetails}>
                <Checkbox isSelected={user.is_github_star} isDisabled size="sm" color="default" />
              </TableCell>
              <TableCell hidden={!showDetails}>
                <Checkbox isSelected={user.is_campus_expert} isDisabled size="sm" color="default" />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
