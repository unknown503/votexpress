import { getAge, getInitialNameLetters } from "@/lib/util";
import { Avatar, Button, Paper, Popover, Text } from "@mantine/core";
import { HTMLAttributes } from "react";

interface CandidateCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string,
  pic: string,
  group: string,
  proposals: string,
  selected: boolean
  birth_day: number;
}

export default function CandidateCard({ name, pic, group, selected, proposals, birth_day, ...props }: CandidateCardProps) {
  const age = getAge(birth_day)

  return (
    <div
      className={`${selected ? "bg-gray-200 selection:bg-transparent !border-gray-300 !shadow-lg border-[1.9px]" :
        "border border-gray-200 hover:bg-gray-100 hover:border-gray-300"} 
        p-6 rounded-md hover:shadow-lg focus:border-white shadow-md transition cursor-pointer`}
      {...props}
    >
      <div className="grid sm:flex sm:items-center gap-y-3 gap-x-4 select-none">
        <div className="flex justify-center items-center">
          <Avatar src={pic} variant="light" size={112} color="dark" radius="sm" className="uppercase">
            {getInitialNameLetters(name)}
          </Avatar>
        </div>

        <div className="flex flex-col h-full justify-center text-center md:text-left">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 capitalize">
            {name}
          </h3>
          <p className="mt-1 text-xs capitalize text-gray-500">
            {group}
          </p>
          {age !== 0 &&
            <p className="mt-1 text-xs capitalize text-gray-500">
              {age} años
            </p>
          }
        </div>
      </div>
      <div className="mt-5">
        {proposals === "" ? <Button disabled fullWidth>Sin propuestas</Button> :
          <Popover shadow="md">
            <Popover.Target>
              <Button fullWidth variant="default">Ver propuestas</Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm" className="whitespace-pre-line">
                <ul className="list-disc ml-6 text-left">
                  {proposals.split("\n").map((proposal: string, i: number) =>
                    <li key={i} className="whitespace-pre-line break-words">{proposal}</li>
                  )}
                </ul>
              </Text>
            </Popover.Dropdown>
          </Popover>
        }
      </div>
    </div>
  )
}
