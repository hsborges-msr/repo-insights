import { Button, ButtonProps } from '@heroui/react';
import { IconBrandGithubFilled } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import queryString from 'query-string';
import { memo, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { env } from '@/helpers/env/browser';

/**
 *  SignInButton component
 */
const SignInButton = memo(function SignInButton(props: ButtonProps) {
  const pathname = usePathname();

  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  return (
    <Button
      {...props}
      as="a"
      variant="flat"
      disableAnimation
      startContent={<IconBrandGithubFilled className="w-6 h-6 text-gray-800" />}
      className={twMerge('font-bold text-gray-800', props.className)}
      href={`https://github.com/login/oauth/authorize?${queryString.stringify({
        client_id: env.GH_CLIENT_ID,
        redirect_uri: `${origin}${pathname}`,
        scope: 'public_repo read:user user:email read:org'
      })}`}
    >
      Sign In
    </Button>
  );
});

export default SignInButton;
