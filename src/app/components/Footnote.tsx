import { IconBrandLinkedin, IconBrandTwitter, IconHeartFilled, IconMail } from '@tabler/icons-react';
import Link from 'next/link';
import { ComponentPropsWithoutRef, memo } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 *  Footnote component
 */
const Footnote = memo(function Footnote(props: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={twMerge(props.className, 'flex justify-center items-center gap-1 text-sm max-sm:text-xs py-4')}
    >
      © 2024-present
      <span className="mx-2 max-sm:mx-0">|</span> Made with
      <span className="text-red-500">
        <IconHeartFilled size={16} />
      </span>
      by
      <Link href="https://github.com/hsborges" target="_blank" className="font-bold">
        hsborges
      </Link>
      <span className="mx-2 max-sm:mx-0">|</span>
      <span className="flex items-center gap-1">
        Contacts:
        <Link href={`mailto:hudsonsilbor@gmail.com`} target="_blank">
          <IconMail size={16} />
        </Link>
        <Link href="https://x.com/hudsonsilbor" target="_blank">
          <IconBrandTwitter size={16} />
        </Link>
        <Link href="https://linkedin.com/in/hudsonsilbor" target="_blank">
          <IconBrandLinkedin size={16} />
        </Link>
      </span>
    </div>
  );
});

export default Footnote;
