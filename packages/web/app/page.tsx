import { getIcons } from '@/api';
import { IconContent } from '@/types';
import IconPage from './_component/IconPage';
// import dayjs from 'dayjs';

export default async function Home(props: any) {
  const data = await getIcons();

  let tags: string[] = [];

  const colorIcons: IconContent[] = [];
  const normalIcons: IconContent[] = [];

  const tagIcons: Record<string, IconContent[]> = {};

  data.content.forEach((item) => {
    if (item.label === 'color') {
      colorIcons.push(item);
    }

    if (item.label === 'normal') {
      normalIcons.push(item);
    }

    (item.tag || []).forEach((t) => {
      if (!tags.includes(t)) {
        tags.push(t);
      }
      if (tagIcons[t]) {
        tagIcons[t].push(item);
      } else {
        tagIcons[t] = [item];
      }
    });

    if (!item.tag?.length) {
      if (tagIcons['未分类']) {
        tagIcons['未分类'].push(item);
      } else {
        tagIcons['未分类'] = [item];
      }
    }
  });

  const colorIcon = data.content.filter((item) => item.label === 'color');

  const normalIcon = data.content.filter((item) => item.label === 'normal');

  tags.unshift('全部', '标准', '彩色');
  tags.push('未分类');

  const icons = {
    全部: data.content,
    标准: normalIcon,
    彩色: colorIcon,
    ...tagIcons,
  };

  return (
    <div className=" w-full h-full">
      <IconPage tags={tags} icons={icons}></IconPage>
    </div>
  );
}
