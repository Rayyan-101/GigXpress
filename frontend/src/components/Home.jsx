import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Shield, MapPin, Star, TrendingUp, Users, 
  CheckCircle, Clock, DollarSign, Award, ChevronRight,
  Menu, X, PlayCircle, ArrowRight
} from 'lucide-react';
import { useNavigate } from "react-router-dom";


const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Event Volunteer",
      image: "https://i.pravatar.cc/150?img=1",
      rating: 5,
      text: "GigXpress helped me earn ₹15,000 last month while managing my college schedule. The payment system is super secure!"
    },
    {
      name: "Rahul Verma",
      role: "Event Organizer",
      image: "https://i.pravatar.cc/150?img=3",
      rating: 5,
      text: "Found reliable volunteers for my wedding event in just 2 days. The KYC verification gives me peace of mind."
    },
    {
      name: "Anita Desai",
      role: "Marketing Volunteer",
      image: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      text: "The platform is so easy to use! I love the location-based job matching. Found gigs right in my neighborhood."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Escrow Payments",
      description: "Your payments are held securely until work is verified. Get paid safely every time."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "KYC Verified Users",
      description: "Work with confidence. All users are KYC verified ensuring trust and accountability."
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Location-Based Matching",
      description: "Find gigs near you. Our smart algorithm matches you with opportunities in your area."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Rating & Review System",
      description: "Build your reputation. Two-way ratings help maintain quality and trust."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Flexible Work Schedule",
      description: "Work on your terms. Choose gigs that fit your schedule and earn when it suits you."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Proof of Work Verification",
      description: "Upload proof of completed work for quick approval and guaranteed payment."
    }
  ];

  const categories = [
    { name: "Event Management", icon: "🎪", count: "120+ Gigs" },
    { name: "Marketing", icon: "📢", count: "85+ Gigs" },
    { name: "Hospitality", icon: "🍽️", count: "95+ Gigs" },
    { name: "Technical", icon: "💻", count: "70+ Gigs" },
    { name: "Creative Arts", icon: "🎨", count: "60+ Gigs" },
    { name: "Logistics", icon: "🚚", count: "50+ Gigs" }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up & Verify",
      description: "Create your account and complete KYC verification in minutes",
      icon: <Users className="w-8 h-8" />
    },
    {
      step: "2",
      title: "Find Perfect Gigs",
      description: "Browse location-based opportunities matching your skills",
      icon: <MapPin className="w-8 h-8" />
    },
    {
      step: "3",
      title: "Apply & Get Selected",
      description: "Submit applications and get hired by verified organizers",
      icon: <CheckCircle className="w-8 h-8" />
    },
    {
      step: "4",
      title: "Complete & Earn",
      description: "Finish the work, upload proof, and receive secure payments",
      icon: <DollarSign className="w-8 h-8" />
    }
  ];

  const stats = [
    { number: "500+", label: "Active Gigs" },
    { number: "2,000+", label: "Volunteers" },
    { number: "98%", label: "Success Rate" },
    { number: "₹50L+", label: "Paid Out" }
  ];


const [isOpen, setIsOpen] = useState(false);


  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Briefcase className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                GigXpress
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition">How It Works</a>
              <a href="#categories" className="text-gray-700 hover:text-indigo-600 font-medium transition">Categories</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium transition">Reviews</a>
              <button className="text-indigo-600 hover:text-indigo-700 font-semibold transition">Login</button>
              <div className="relative">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition shadow-lg"
                >
                  Get Started
                </button>


              </div>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Features</a>
              <a href="#how-it-works" className="block py-2 text-gray-700 hover:text-indigo-600 font-medium">How It Works</a>
              <a href="#categories" className="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Categories</a>
              <button className="block w-full text-left py-2 text-indigo-600 font-semibold">Login</button>
              <button className="w-full px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Your Gateway to<br />
                <span className="text-yellow-300">Event-Based</span><br />
                Opportunities
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Connect organizers with skilled volunteers. Find gigs, work flexibly, and earn securely with our escrow-protected platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-xl flex items-center justify-center gap-2">
                  <TrendingUp size={20} />
                  Start Earning Today
                </button>
                <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition flex items-center justify-center gap-2">
                  <PlayCircle size={20} />
                  Watch Demo
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300">{stat.number}</div>
                    <p className="text-white/80 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=600&fit=crop" 
                alt="Team" 
                className="rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">GigXpress?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to find, manage, and complete event-based gigs successfully
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                    {step.icon}
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -z-10">
                    <div className="text-8xl font-bold text-gray-100">{step.step}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-4 text-indigo-300">
                    <ChevronRight size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Popular Categories</h2>
            <p className="text-xl text-gray-600">Explore opportunities across various fields</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-indigo-600 font-semibold">{category.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied users</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
              <div className="flex items-center gap-6 mb-6">
                <img 
                  src={testimonials[activeTestimonial].image} 
                  alt={testimonials[activeTestimonial].name}
                  className="w-20 h-20 rounded-full border-4 border-white"
                />
                <div>
                  <h4 className="text-2xl font-bold">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-white/80">{testimonials[activeTestimonial].role}</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xl leading-relaxed">{testimonials[activeTestimonial].text}</p>
              
              <div className="flex gap-2 justify-center mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeTestimonial ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of users earning through flexible gig work</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-xl flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={24} />
                <span className="text-xl font-bold">GigXpress</span>
              </div>
              <p className="text-gray-400">Your trusted platform for event-based opportunities</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <p className="text-gray-400">Follow us on social media</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 GigXpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;