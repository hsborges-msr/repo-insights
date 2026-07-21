import { Button, ButtonProps } from '@heroui/react';
import { IconBrandGithubFilled } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import queryString from 'query-string';
import { memo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { env } from '@/helpers/env/browser';

/**
 * SignInButton component that redirects users to GitHub OAuth.
 *
 * - Builds the OAuth URL from GH_CLIENT_ID and the current location
 */
const SignInButton = memo(function SignInButton(props: ButtonProps) {
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    const origin = window.location.origin;
    const url = `${env.GH_OAUTH_URL}?${queryString.stringify({
      client_id: env.GH_CLIENT_ID,
      redirect_uri: `${origin}${pathname}`,
      scope: env.GH_OAUTH_SCOPE
    })}`;
    window.location.href = url;
  };

  return (
    <Button
      {...props}
      variant="flat"
      disableAnimation
      startContent={<IconBrandGithubFilled className="w-6 h-6 text-gray-800" />}
      className={twMerge('font-bold text-gray-800', props.className)}
      disabled={isLoading || props.disabled}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    >
      {isLoading ? 'Signing in...' : 'Sign In'}
    </Button>
  );
});

export default SignInButton;