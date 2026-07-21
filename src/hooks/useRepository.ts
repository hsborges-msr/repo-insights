import { useAsync } from 'react-use';
import { createService } from '@/helpers/github/browser';
import useAuth from './useAuth';

/**
 * Hook to fetch repository metadata.
 *
 * - Uses the current authenticated user token (if any) to create the GitHub service
 * - Returns an AsyncState from `react-use` with the repository value when available
 *
 * @param owner Repository owner (user or org)
 * @param name Repository name
 */
export default function useRepository(owner: string, name: string) {
  const { user } = useAuth();
  return useAsync(async () => createService(undefined, user?.__access_token).repository(owner, name), [user]);
}