import { Alert } from '@heroui/react';
import { IconFaceIdError, IconShieldLock } from '@tabler/icons-react';

/**
 *  RepositoryError component
 */
type KnownError = { status?: number; message?: string } & Record<string, unknown>;

const RepositoryError = function RepositoryError(props: { error: unknown }) {
  const err = props.error as KnownError | undefined;
  if (err?.status === 401) {
    return (
      <div className="flex w-full h-1/2 items-center justify-center max-sm:px-4">
        <Alert
          icon={<IconShieldLock />}
          title="Sorry, authentication is required."
          description={
            <div className="w-full text-justify">
              To collect data from GitHub, we need an access token.
              <br />
              But dont worry, we store it locally on your browser only.
              <br />
              You can authorize the application by clicking on &quot;Sign In&quot; to continue.
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
  }

  const message = err?.message ?? 'An unexpected error occurred.';

  return (
    <div className="flex w-full h-full items-center justify-center">
      <Alert
        color="danger"
        icon={<IconFaceIdError />}
        title={message}
        description={process.env.NODE_ENV === 'development' ? JSON.stringify(props.error, null, 2) : message}
        classNames={{
          base: 'w-auto grow-0 px-8',
          alertIcon: 'w-8 h-8',
          iconWrapper: 'm-auto w-12 h-12 m-4',
          title: 'text-lg font-bold mb-2',
          description: 'items-center'
        }}
      />
    </div>
  );
};

export default RepositoryError;