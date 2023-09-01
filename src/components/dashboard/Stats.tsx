import { createStyles, Group, Paper, SimpleGrid, Text, rem } from '@mantine/core';
import {
  IconUserCheck,
  IconUser,
  IconUsers,
  IconClock,
} from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  value: {
    fontSize: rem(34),
    fontWeight: 600,
    lineHeight: 1,
    display: "inline-block"
  },

  diff: {
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },

  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: 'uppercase',
  },
}));

const icons = {
  user: IconUser,
  voted: IconUserCheck,
  candidate: IconUsers,
  time: IconClock,
};

export interface StatsGridProps {
  data: { title: string; icon: keyof typeof icons; value?: number; min?: number }[];
}

export default function Stats({ data }: StatsGridProps) {
  const { classes } = useStyles();

  const stats = data.map((stat) => {
    const Icon = icons[stat.icon];

    return (
      <Paper withBorder p="lg" radius="md" key={stat.title}>
        <Group position="apart">
          <Text size="xs" color="dimmed" className={classes.title}>
            {stat.title}
          </Text>
          <Icon className={classes.icon} size="1.4rem" stroke={1.5} />
        </Group>
        <div className="block">
          {stat.min ?
            <>
              {stat.value !== 0 &&
                <>
                  <Text className={classes.value} mt={25}>{stat.value && stat.value}</Text>
                  <span className='pl-[6px] text-base pr-2.5'>h</span>
                </>
              }
              <Text className={classes.value} mt={25}>
                {stat.value === 0 ? stat.min :
                  stat.value && stat.min - (60 * stat.value)
                }
              </Text>
              <span className='pl-[6px] text-base'>m</span>
            </> :
            <Text className={classes.value} mt={25}>{stat.value && !isNaN(stat.value) ? stat.value : 0}</Text>
          }
        </div>
      </Paper>
    );
  });

  return (
    <>
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: 'md', cols: 2 },
          { maxWidth: 'xs', cols: 1 },
        ]}
      >
        {stats}
      </SimpleGrid>
    </>
  );
}