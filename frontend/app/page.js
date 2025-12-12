import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, Users, Shield } from 'lucide-react'
import yangLogo from '../frontend/assets/yanglogo.jpg'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src={yangLogo} alt="YangConnect HealthPortal logo" className="h-8 w-8 rounded-full object-cover ring-2 ring-primary ring-offset-1" />
              <span className="ml-2 text-xl font-bold text-primary">YangConnect Health Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/services" className="text-neutral-dark hover:text-primary transition-colors">Services</Link>
              <Link href="/about" className="text-neutral-dark hover:text-primary transition-colors">About Us</Link>
              <Link href="/login" className="btn-outline">Login</Link>
              <Link href="/admin/login" className="text-neutral-dark hover:text-primary transition-colors text-sm">Admin</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary-light py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Compassionate Care, Seamlessly Booked
            </h1>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Your health is our priority. Book appointments, connect with your care team, and manage your wellness journey all in one place.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/login" className="btn-accent text-lg">
                Get Started
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </Link>
              <Link href="/services" className="btn-outline border-white text-white hover:bg-white hover:text-primary text-lg">
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 Access</h3>
              <p className="text-neutral-dark">Manage your appointments and health records anytime, anywhere.</p>
            </div>
            <div className="card text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Care Team</h3>
              <p className="text-neutral-dark">Connect with board-certified physicians and specialists.</p>
            </div>
            <div className="card text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-neutral-dark">Your health information is protected with industry-leading security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">What Our Patients Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <p className="text-neutral-dark mb-4">&ldquo;The online booking system is so convenient. I can schedule appointments in minutes!&rdquo;</p>
              <p className="font-semibold">- Caya J.</p>
            </div>
            <div className="card">
              <p className="text-neutral-dark mb-4">&ldquo;Being able to see my doctor or nurse&apos;s availability directly has been a game-changer for my care.&rdquo;</p>
              <p className="font-semibold">- Jaren A.</p>
            </div>
            <div className="card">
              <p className="text-neutral-dark mb-4">&ldquo;The portal makes managing my family&apos;s healthcare so much easier.&rdquo;</p>
              <p className="font-semibold">- Ian F.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">YangConnect HealthPortal</h3>
              <p className="text-white/80">Compassionate care at your fingertips.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/80">
                <li><Link href="/services" className="hover:text-white">Services</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-white/80">Phone: 09658422748</p>
              <p className="text-white/80">Email: yangconnect@gmail.com</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <p className="text-white/80">Mon-Fri: 8AM-5PM</p>
              <p className="text-white/80">Sat: 9AM-2PM</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/80">
            <p>&copy; 2025 YangConnect Health Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

