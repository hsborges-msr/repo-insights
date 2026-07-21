'use client';

import { Card, Image, Input, User } from '@heroui/react';
import { IconSearch } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useAsync } from 'react-use';

type SearchResponse = {
  items: Array<{
    id: number;
    name: string;
    full_name: string;
    stargazers_count: string;
    forks_count: string;
    updated_at: string;
    owner: { login: string; avatar_url: string };
  }>;
};

/**
 *  Home page
 */
export default function Home() {
  const router = useRouter();

  const [name, setName] = useState('');

  const samples = useAsync<() => Promise<SearchResponse | null>>(async () => {
    const res = await fetch(
      'https://api.github.com/search/repositories?q="" stars:2000..3000&sort=updated&order=desc&per_page=5'
    );
    return res.ok ? res.json() : null;
  }, []);

  const find = useCallback(() => {
    if (!name) return alert('Please enter a repository name');
    else if (!name.match(/^.+\/.+$/)) return alert('Invalid repository name');
    else router.push(`/r/${name}`);
  }, [name, router]);

  return (
    <div className="h-full w-full flex flex-col items-center gap-8 mt-10">
      <div className="text-[3rem] max-sm:text-[2.25rem] text-center font-black text-gray-600 w-220 max-sm:w-[95vw] leading-tight">
        Discover the developers powering your favorite GitHub project
      </div>
      <div className="text-[1.5rem] max-sm:text-[1.15rem] text-gray-400 text-center w-160 max-sm:w-[85vw]">
        Insights on Stars, Watchers, Tags, Releases, and the Developers Behind Them
      </div>
      <div className="mb-12 max-sm:mb-6 flex flex-col items-center gap-4">
        <Input
          placeholder="Find by name (e.g., octokit/octokit.js)"
          endContent={<IconSearch className="text-gray-600 cursor-pointer w-6 h-auto" onClick={find} />}
          type="search"
          className="w-140 max-sm:w-88 my-2"
          value={name}
          onValueChange={(value) => setName(value)}
          classNames={{
            base: 'text-gray-600',
            input: 'text-center text-gray-300 text-[1.15rem] max-sm:text-[1rem]',
            inputWrapper: 'border-2 border-gray-300 rounded-full p-4 max-sm:p-2'
          }}
          onKeyDown={(event) => event.key === 'Enter' && find()}
        />
        {samples.value && (
          <div className="flex flex-col items-center gap-6 w-140 max-sm:w-88">
            <span className="text-sm text-gray-400 italic underline">or explore some examples</span>
            <div className="text-center flex gap-2 flex-wrap justify-center px-1">
              {samples.value.items.map((repo) => (
                <span key={repo.id}>
                  <Link href={`/r/${repo.full_name}`}>
                    <User
                      name={repo.owner.login}
                      description={repo.name}
                      avatarProps={{ src: repo.owner.avatar_url, className: 'h-6 w-6' }}
                      classNames={{ base: 'border gap-1 px-4 py-1' }}
                    />
                  </Link>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <Card isHoverable classNames={{ base: 'shadow-inner shadow-xl shadow-gray-400' }}>
          <Image src="/images/octokit_octokit_js.jpg" alt="" className="max-w-180 w-[90vw] h-auto" />
        </Card>
      </div>
    </div>
  );
}