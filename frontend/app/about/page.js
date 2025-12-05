import Link from 'next/link'
import Image from 'next/image'
import { Target, Eye, Users } from 'lucide-react'
import yangLogo from '../../frontend/assets/yanglogo.jpg'

export default function AboutPage() {
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
              <Link href="/services" className="text-neutral-dark hover:text-primary transition-colors">Services</Link>
              <Link href="/about" className="text-primary font-semibold">About Us</Link>
              <Link href="/login" className="btn-outline">Login</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary-light py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Committed to providing exceptional healthcare with compassion and innovation
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="card">
              <Target className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-neutral-dark leading-relaxed">
                To provide accessible, high-quality healthcare that empowers our patients to live healthier lives. 
                We are dedicated to delivering compassionate care with the latest medical advancements and 
                personalized attention to each patient&apos;s unique needs.
              </p>
            </div>
            <div className="card">
              <Eye className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-neutral-dark leading-relaxed">
                To be the leading healthcare provider in our community, recognized for excellence in patient care, 
                innovation in medical practices, and commitment to improving health outcomes. We envision a future 
                where healthcare is seamless, accessible, and centered around the patient experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Dr. John Kevin Javinez', role: 'Chief Medical Officer', specialty: 'Cardiology' },
              { name: 'Dr. Rhealyn Rose Ellazar', role: 'Director of Pediatrics', specialty: 'Pediatrics' },
              { name: 'Dr. Pinky Baluran', role: 'Head of Dermatology', specialty: 'Dermatology' },
            ].map((leader, index) => (
              <div key={index} className="card text-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{leader.name}</h3>
                <p className="text-primary font-medium mb-1">{leader.role}</p>
                <p className="text-neutral-dark text-sm">{leader.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facility Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Our Facilities</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'RHU', address: 'Sitio Ubos, Poblacion, Cordova, Cebu', hours: 'Mon-Fri: 8AM-5PM' },
              
            ].map((facility, index) => (
              <div key={index} className="card">
                <h3 className="text-xl font-semibold mb-3">{facility.name}</h3>
                <p className="text-neutral-dark mb-2">{facility.address}</p>
                <p className="text-primary font-medium">{facility.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 YangConnect HealthPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

