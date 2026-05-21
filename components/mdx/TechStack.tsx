import { Pill } from '@/components/ui/primitives/Pill';

type TechStackProps = {
  items: string[];
};

export function TechStack({ items }: TechStackProps) {
  return (
    <ul className="my-6 flex flex-wrap gap-2 not-prose">
      {items.map((t) => (
        <li key={t}>
          <Pill>{t}</Pill>
        </li>
      ))}
    </ul>
  );
}
