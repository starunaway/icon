import IconCard from '@/components/icon-card';
import { IconContent } from '@/types';
import Link from 'next/link';

export default function IconList(props: { iconList: IconContent[] }) {
  const { iconList } = props;
  return (
    <div className="flex flex-wrap gap-4">
      {iconList.map((icon) => {
        return (
          <Link href={`/detail/${icon.name}`} key={icon.name}>
            <IconCard
              showName={false}
              className="w-[72px] h-[72px] p-2 rounded-lg  border"
              {...icon}
            ></IconCard>
          </Link>
        );
      })}
    </div>
  );
}
