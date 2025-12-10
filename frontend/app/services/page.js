import Link from 'next/link'
import Image from 'next/image'
import { Stethoscope, Syringe, Sparkles } from 'lucide-react'
import yangLogo from '../../frontend/assets/yanglogo.jpg'

const services = [
  {
    icon: Stethoscope,
    title: 'Consultation & Primary Care',
    description: 'Comprehensive primary care services for all ages, including routine check-ups, and preventive care.',
  },
  {
    icon: Sparkles,
    title: 'Teeth Cleaning',
    description: 'Gentle preventive dental cleanings focused on comfort, hygiene, and overall oral health.',
  },
  {
    icon: Syringe,
    title: 'Vaccination',
    description: 'Up-to-date immunizations delivered with clear guidance to keep you and your family protected.',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image src={yangLogo} alt="YangConnect HealthPortal logo" className="h-8 w-8 rounded-full object-cover" />
              <span className="ml-2 text-xl font-bold text-primary">YangConnect HealthPortal</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-neutral-dark hover:text-primary transition-colors">Home</Link>
              <Link href="/services" className="text-primary font-semibold">Services</Link>
              <Link href="/about" className="text-neutral-dark hover:text-primary transition-colors">About Us</Link>
              <Link href="/login" className="btn-outline">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary-light py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Comprehensive healthcare services tailored to meet your needs
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="card hover:scale-105 transition-transform duration-200">
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-neutral-dark">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Ready to Get Started?</h2>
          <p className="text-neutral-dark mb-8">
            Book an appointment with one of our specialists today
          </p>
          <Link href="/login" className="btn-primary text-lg">
            Book Appointment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 YangConnect HealthPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

