import {
  Icon,
  IconBrandBluesky,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandMastodon,
  IconBrandNpm,
  IconBrandReddit,
  IconBrandTwitch,
  IconBrandX,
  IconBrandYoutube,
  IconLetterH,
  IconWorldWww
} from '@tabler/icons-react';

export const SocialPlatforms: Record<string, { Icon: Icon; url?: string }> = {
  instagram: { Icon: IconBrandInstagram, url: 'https://instagram.com' },
  twitter: { Icon: IconBrandX, url: 'https://twitter.com' },
  facebook: { Icon: IconBrandFacebook, url: 'https://facebook.com' },
  youtube: { Icon: IconBrandYoutube, url: 'https://youtube.com' },
  linkedin: { Icon: IconBrandLinkedin, url: 'https://linkedin.com' },
  mastodon: { Icon: IconBrandMastodon, url: 'https://mastodon.com' },
  bluesky: { Icon: IconBrandBluesky, url: 'https://bluesky.com' },
  npm: { Icon: IconBrandNpm, url: 'https://npm.com' },
  twitch: { Icon: IconBrandTwitch, url: 'https://twitch.com' },
  reddit: { Icon: IconBrandReddit, url: 'https://reddit.com' },
  hometown: { Icon: IconLetterH, url: 'https://digipres.club' },
  generic: { Icon: IconWorldWww }
};