import Hero from '@/components/home/Hero';
import FeaturesCards from '@/components/home/Features';
import FaqSimple from '@/components/home/FAQ';
import { Box } from '@mantine/core';
import SimpleFeatures from '@/components/home/SimpleFeatures';

export default function Home() {

  return (
    <>
      <Hero />
      <Box mt={"3rem"}>
        <FeaturesCards />
      </Box>
      <SimpleFeatures />
      <FaqSimple />
    </>
  );
}