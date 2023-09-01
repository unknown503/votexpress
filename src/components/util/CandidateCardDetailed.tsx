import { getAge, getInitialNameLetters } from '@/lib/util';
import { Avatar, Text, Button, Paper, HoverCard } from '@mantine/core';

interface CandidateCardDetailedProps {
  pic: string;
  name: string;
  group: string;
  birth_day: number;
  proposals: string;
  isSelected?: boolean
}

export function CandidateCardDetailed({ isSelected, pic, name, group, birth_day, proposals }: CandidateCardDetailedProps) {
  return (
    <Paper
      radius="md"
      p="lg"
      shadow="md"
      className={`capitalize ${isSelected ? "border-2 !border-green-300" : "border border-gray-200"}`}
    >
      <Avatar src={pic} size={120} radius="sm" color="dark" mx="auto" className='uppercase'>
        {getInitialNameLetters(name)}
      </Avatar>
      <Text ta="center" fz="lg" weight={500} mt="md">
        {name}
      </Text>
      <Text ta="center" c="dimmed" fz="sm">
        {group} • {getAge(birth_day)} años
      </Text>
      <div className="mt-5">
        {proposals === "" ? <Button disabled fullWidth>Sin propuestas</Button> :
          <HoverCard shadow="md">
            <HoverCard.Target>
              <Button fullWidth variant="default">Ver propuestas</Button>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <Text size="sm" className="whitespace-pre-line">
                <ul className="list-disc ml-6 text-left">
                  {proposals.split("\n").map((proposal: string, i: number) =>
                    <li key={i} className="whitespace-pre-line break-words">{proposal}</li>
                  )}
                </ul>
              </Text>
            </HoverCard.Dropdown>
          </HoverCard>
        }
      </div>
    </Paper>
  );
}

