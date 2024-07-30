'use client';

import { IconContent } from '@/types';
import { useState } from 'react';
import Link from 'next/link';
import IconCard from '@/components/icon-card';
import clsx from 'clsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { copyText } from '@/lib/utils';
import toast from 'react-hot-toast';

interface IconPageProps {
  tags: string[];
  icons: Record<string, IconContent[]>;
}

export default function IconPage(props: IconPageProps) {
  const { tags, icons } = props;
  const [tag, setTag] = useState<string>(tags[0]);

  const [renderIcons, setRenderIcons] = useState<IconContent[]>(icons[tag]);

  const [searchValue, setSearchValue] = useState<string>('');
  const permission = [];

  const handleClick = (name: string) => () => {
    copyText(name);
    toast.success('复制成功');
  };

  const calcRenderIcons = (curTag: string, curSearch: string) => {
    if (searchValue) {
      const searchIcon = icons[curTag].filter((icon) => {
        return icon.name.includes(curSearch);
      });
      setRenderIcons(searchIcon);
    } else {
      setRenderIcons(icons[curTag] || []);
    }
  };
  const handleSearch = () => {
    calcRenderIcons(tag, searchValue);
  };

  return (
    <div className="flex gap-12 relative h-full w-full">
      <div className="w-[160px] pt-16 pl-16 absolute top-0">
        {tags.map((t) => {
          return (
            <p
              key={t}
              className={clsx(
                'px-2 py-1 text-lg mb-2 font-semibold text-center rounded-lg cursor-pointer',
                'hover:bg-secondary hover:text-secondary-foreground',
                tag === t && 'bg-primary text-primary-foreground '
              )}
              onClick={() => {
                setTag(t);
                calcRenderIcons(t, searchValue);
              }}
            >
              {t}
            </p>
          );
        })}
      </div>

      <div className="pl-[160px]  pt-4 w-full flex flex-col">
        <div className="flex w-full px-20 ">
          <div className="flex-1 relative flex items-center group">
            <Input
              className="rounded-e-none "
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            ></Input>
            <XCircle
              className="absolute right-4 hidden group-hover:block"
              onClick={() => {
                setSearchValue('');
                calcRenderIcons(tag, '');
              }}
            />
          </div>

          <Button onClick={handleSearch} className="rounded-s-none">
            Search
          </Button>
        </div>

        <div className="overflow-y-auto  w-full h-full flex-1">
          <div className=" w-full px-20 flex-1 py-4 grid gap-4 grid-cols-4  xl:grid-cols-5 2xl:grid-cols-6 gap-8">
            {renderIcons.map((item) => {
              if (permission?.length > 0) {
                return (
                  <Link key={item.name} href={`/detail/${item.name}`}>
                    <IconCard key={item.name} {...item}></IconCard>
                  </Link>
                );
              } else {
                return (
                  <IconCard onClick={handleClick(item.name)} key={item.name} {...item}></IconCard>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
