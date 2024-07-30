import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { CopyPlus } from 'lucide-react';

interface HeaderProps {
  title: string;
  user?: {
    id: string;
    name: string;
    avatar_url: string;
  };
}
const Header = (props: HeaderProps) => {
  const { title, user } = props;
  return (
    <div className="z-999 top-0 shadow flex items-center justify-between h-[56px] px-4 sticky ">
      <div>
        <Link href="/">
          <h1 className="cursor-pointer">{title}</h1>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/detail" className="hover:text-[#3b82f6]">
          <CopyPlus />
        </Link>

        <Avatar>
          <Avatar>
            <AvatarImage src={user?.avatar_url || 'https://github.com/shadcn.png'} />
            <AvatarFallback>{user?.name}</AvatarFallback>
          </Avatar>
        </Avatar>
      </div>
    </div>
  );
};
export default Header;
