import { Metadata } from 'next';

type Props = {
  params: Promise<{ owner: string; name: string }>;
};

/**
 *  Generate metadata for the repository layout
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, name } = await params;

  return {
    title: `${owner}/${name} | RepoInsights`
  };
}

/**
 *  Repository layout component
 */
export default async function RepositoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}