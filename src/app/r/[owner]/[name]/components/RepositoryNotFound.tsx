import { Alert } from '@heroui/react';
import { IconError404 } from '@tabler/icons-react';

/**
 *  Repository not found component
 */
import { memo } from 'react';

const RepositoryNotFound = memo(function RepositoryNotFound() {
  return (
    <div className="flex w-full h-1/2 items-center justify-center max-sm:px-4">
      <Alert
        icon={<IconError404 />}
        title="Sorry, couldn't fetch the repository"
        description={
          <div className="w-full text-justify">
            The repository you are looking for does not exist or you may not have access.
            <br />
            Please make sure to follow the format <strong>owner/name</strong>
          </div>
        }
        classNames={{
          base: 'w-auto grow-0 px-8 max-sm:px-2 max-sm:flex-col max-sm:items-center',
          alertIcon: 'w-8 h-8',
          iconWrapper: 'm-auto w-12 h-12 m-4',
          title: 'text-lg max-sm:text-center font-bold mb-2',
          description: 'items-center'
        }}
      />
    </div>
  );
});

export default RepositoryNotFound;