import Hero from '@/components/home/Hero'
import SearchBar from '@/components/home/SearchBar'
import FeaturedProperties from '@/components/home/FeaturedProperties'
import Benefits from '@/components/home/Benefits'
import HowItWorks from '@/components/home/HowItWorks'
import CTA from '@/components/home/CTA'

export default function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <FeaturedProperties />
      <Benefits />
      <HowItWorks />
      <CTA />
    </>
  )
}