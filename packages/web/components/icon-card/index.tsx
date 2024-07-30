import { clsx } from 'clsx';
import { MouseEventHandler } from 'react';

interface IconProps {
  name: string;
  svg: string;
  showName?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export default function IconCard(props: IconProps) {
  const { name, svg, showName = true, className, onClick } = props;

  return (
    <div
      className={clsx(
        'h-[80px] p-4 flex flex-col items-center justify-center text-3xl gap-2 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          className={`anticon fill-current inline-block h-[1em] w-[1em] overflow-hidden outline-none `}
        >
          <use xlinkHref={`#icon-${name}`} fill="currentColor" />
        </svg>
      </div>

      {showName && <span className="text-xs text-muted-foreground">{name}</span>}
    </div>
  );
}
