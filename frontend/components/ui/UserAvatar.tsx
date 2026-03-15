import Image from 'next/image';
import { User } from '@/lib/types';

interface Props {
  user: Partial<User>;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 32, md: 48, lg: 96 };

export function UserAvatar({ user, size = 'md' }: Props) {
  const px = sizes[size];
  if (user.avatar) {
    return (
      <a
        href={user.avatar}
        target="_blank"
        rel="noopener noreferrer"
        title={user.name ? `${user.name}'s profile photo` : 'Profile photo'}
        className="relative avatar-crop shrink-0 block"
        style={{ width: px, height: px }}
      >
        <Image
          src={user.avatar}
          alt={user.name ? `${user.name}'s profile photo` : 'Profile photo'}
          fill
          sizes={`${px}px`}
          loading="lazy"
          decoding="async"
          data-nimg="fill"
        />
      </a>
    );
  }
  return (
    <div
      className="rounded-full bg-sky-500 flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: px, height: px, fontSize: px * 0.4 }}
    >
      {(user.name || 'U').charAt(0).toUpperCase()}
    </div>
  );
}
