import { useAsync } from 'react-use';
import { createService } from '@/helpers/github/browser';
import useAuth from './useAuth';

/**
 *  Hook to fetch a repository
 */
export default function useRepository(owner: string, name: string) {
  const { user } = useAuth();
  return useAsync(async () => createService(undefined, user?.__access_token).repository(owner, name), [user]);
}
