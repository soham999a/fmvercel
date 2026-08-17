import Link from 'next/link';
import { useRef, useState } from 'react';
import { LogIn, LogOut, User, Award, Crown, Camera, Loader2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const AVATAR_COLORS = [
  'bg-rose-600', 'bg-violet-600', 'bg-blue-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-pink-600', 'bg-cyan-600', 'bg-indigo-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function UserAvatar({ user, size = 'h-9 w-9' }: { user: { photoURL: string | null; displayName: string | null; email: string | null }; size?: string }) {
  const name = user.displayName || user.email?.split('@')[0] || 'U';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const colorClass = getAvatarColor(name);

  if (user.photoURL) {
    return (
      <div className={`${size} relative`}>
        <img
          src={user.photoURL}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            const fallback = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <span
          className={`${size} ${colorClass} absolute inset-0 hidden items-center justify-center rounded-full text-xs font-bold text-white`}
        >
          {initials}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`${size} ${colorClass} flex items-center justify-center rounded-full text-xs font-bold text-white`}
    >
      {initials}
    </span>
  );
}

export function Header() {
  const { user, signOut, loading, updateProfilePhoto } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      await updateProfilePhoto(file);
      toast.success('Profile photo updated');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:pl-24 md:pr-8">
        <Link href="/" className="press flex items-center">
          <div className="overflow-hidden rounded-md border border-primary/80 p-0.5 shadow-[0_0_12px_rgba(184,146,74,0.25)]">
            <img
              src="/hertz-logo-dark.png"
              alt="Hertz — Your Home of Radio"
              className="hidden h-9 w-auto object-contain dark:block"
            />
            <img
              src="/hertz-logo-light.png"
              alt="Hertz — Your Home of Radio"
              className="block h-9 w-auto object-contain dark:hidden"
            />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!loading &&
            (user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="press flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-primary/40 transition-all hover:border-primary hover:shadow-[0_0_12px_rgba(184,146,74,0.3)]">
                    <UserAvatar user={user} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <UserAvatar user={user} size="h-12 w-12" />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }}
                          disabled={uploading}
                          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          {uploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          ) : (
                            <Camera className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                    <Camera className="mr-2 h-4 w-4" />
                    {uploading ? 'Uploading…' : 'Change photo'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/rewards" className="cursor-pointer">
                      <Award className="mr-2 h-4 w-4 text-primary" />
                      Rewards
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/premium" className="cursor-pointer">
                      <Crown className="mr-2 h-4 w-4 text-primary" />
                      Premium
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Saved Stations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth" aria-label="Sign in">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              </Button>
            ))}
          <ThemeToggle />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />
    </header>
  );
}
