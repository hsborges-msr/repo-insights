import { Spinner } from '@heroui/react';
import { HTMLAttributes, memo } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 *  Loading component
 */
const Loading = memo(function Loading(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={twMerge('flex w-full h-full justify-center items-center text-2xl', props.className)}>
      <Spinner color="default" label="Loading ..." />
    </div>
  );
});

export default Loading;