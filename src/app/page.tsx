import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import ServicesSection from '@/components/ServicesSection'
import GallerySection from '@/components/GallerySection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#65222A]">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      <Footer />
    </main>
  )
}