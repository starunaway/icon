import { getIcons } from '@/api';
import { redirect } from 'next/navigation';
interface DetailProps {
  params: {
    name?: string;
  };
}

import { getIconDetail } from '@/api';
import IconList from './IconList';
import IconDetail from './IconDetail';

export default async function Home(props: DetailProps) {
  const { name } = props.params;

  let icon;
  if (name) {
    try {
      icon = await getIconDetail(name!);
    } catch (e) {
      redirect('/');
    }
  }
  const iconList = await getIcons();
  return (
    <div className="mx-[10%]">
      <IconDetail icon={icon}></IconDetail>
      <IconList iconList={iconList.content || []}></IconList>
    </div>
  );
}
