import { PageHeader } from "@/components/dashboard/PageHeader";

export interface JourneyHeroProps {
  title: string;
  duration: string;
  status: string;
  createdDate: string;
}

export function JourneyHero({
  title,
  duration,
  status,
  createdDate,
}: JourneyHeroProps) {
  const eyebrow = `${status} • ${duration}`;
  const description = `Created on ${createdDate}`;

  return (
    <PageHeader
      eyebrow={eyebrow}
      title={title}
      description={description}
    />
  );
}
