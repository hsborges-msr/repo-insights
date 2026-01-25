import { twMerge } from 'tailwind-merge';

/**
 *  PageSection component
 */
export const PageSection = function PageSection(props: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge('w-full flex gap-2 max-sm:gap-1', props.className)}>
      <span className="bg-gray-500 [writing-mode:vertical-lr] -rotate-180 text-center text-white font-bold px-2">
        {props.title}
      </span>
      <span className="grow">{props.children}</span>
    </div>
  );
};
