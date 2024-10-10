


interface ChevronProps {
  className?: string;
  direction: 'up' | 'down' | 'left' | 'right';
  onClick?: (direction: "up" | "down" | "left" | "right", e: React.MouseEvent) => void;
}
export const Chevron = ({ className, direction, onClick }: ChevronProps) => {

  const click = (e: React.MouseEvent) => {
    if(onClick) {
      onClick(direction, e);
    }
  }

  return (
    <svg onClick={click} className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      {direction === 'up' && <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />}
      {direction === 'down' && <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />}
      {direction === 'left' && <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />}
      {direction === 'right' && <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />}
    </svg>
  )
}