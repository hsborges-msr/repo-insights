'use client';

import {
  Avatar,
  Badge,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarProps
} from '@heroui/react';
import { IconCloudDownload, IconLogout, IconSearch } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo } from 'react';
import { useToggle } from 'react-use';
import { twMerge } from 'tailwind-merge';
import useAuth from '@/hooks/useAuth';
import CacheManager from './CacheManager';
import SignInButton from './SignInButton';

/**
 * App header with navigation, search and authentication controls.
 *
 * - Shows a search input (on non-home pages), user dropdown when signed in, and sign-in button otherwise
 */
export default function Header(props: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user, signIn, signOut } = useAuth();

  const isHome = useMemo(() => pathname === '/', [pathname]);

  const [showCacheManager, toggleCacheManager] = useToggle(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const redirectTo = searchParams.get('redirectTo');
    if (token) signIn(token).then(() => router.push(redirectTo || pathname));
  }, [pathname, router, searchParams, signIn]);

  return (
    <Suspense>
      {showCacheManager && <CacheManager isOpen={showCacheManager} onClose={toggleCacheManager} />}
      <Navbar
        position={isHome ? 'static' : 'sticky'}
        {...props}
        maxWidth="full"
        isBordered={!isHome}
        className={twMerge(props.className, 'm-0')}
        classNames={{ wrapper: 'p-0 m-0 max-sm:p-4' }}
      >
        <NavbarBrand>
          <Badge
            content="Beta"
            classNames={{ badge: 'bg-red-400 text-white font-bold text-xs px-2 translate-x-12' }}
            variant="flat"
          >
            <Link href="/" className="hover:opacity-100">
              <span className="flex items-center gap-1">
                <Image
                  src="/images/logo-colored.png"
                  alt="RepoAnalyzer"
                  loading="eager"
                  width={100}
                  height={100}
                  className="w-8 h-8"
                />
                <span className="text-[1.5rem] text-gray-500 tracking-wide">
                  <strong>Repo</strong>Insights
                </span>
              </span>
            </Link>
          </Badge>
        </NavbarBrand>
        {!isHome && (
          <NavbarContent justify="center" className="max-sm:hidden">
            <Input
              placeholder="Search (e.g., octokit/rest.js)"
              startContent={<IconSearch size={18} />}
              type="search"
              className="w-80"
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                const name: string = (event.target as HTMLInputElement).value;
                if (!name.match(/^.+\/.+$/)) return alert('Invalid repository name');
                router.push(`/r/${name}`);
              }}
            />
          </NavbarContent>
        )}
        <NavbarContent justify="end">
          <NavbarItem>
            {user ? (
              <Dropdown placement="bottom">
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    src={`https://github.com/${user.login}.png`}
                    name={user.login}
                    className="max-sm:w-10 max-sm:h-auto"
                  />
                </DropdownTrigger>
                <DropdownMenu variant="flat" disabledKeys={['info']}>
                  <DropdownSection showDivider>
                    <DropdownItem key="info" onPress={signOut} classNames={{ title: 'text-center' }}>
                      Logged as <strong>{user.login}</strong> <br />
                    </DropdownItem>
                  </DropdownSection>
                  <DropdownSection showDivider>
                    <DropdownItem
                      key="cache"
                      onPress={toggleCacheManager}
                      startContent={<IconCloudDownload size={'1rem'} />}
                    >
                      Cached data
                    </DropdownItem>
                  </DropdownSection>
                  <DropdownItem key="logout" onPress={signOut} startContent={<IconLogout size={'1rem'} />}>
                    Log out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <SignInButton />
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </Suspense>
  );
}
