import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  HeartIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import designSystem from '../../styles/designSystem';

const EnhancedFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "AI Trip Planner", href: "/plan-next-level-trip", icon: SparklesIcon },
        { name: "My Trips", href: "/my-trips", icon: MapPinIcon },
        { name: "Destinations", href: "/destinations", icon: GlobeAltIcon },
        { name: "Travel Guide", href: "/guide", icon: UserGroupIcon }
      ]
    },
    {
      title: "Features",
      links: [
        { name: "Smart Itineraries", href: "#", icon: SparklesIcon },
        { name: "Budget Planning", href: "#", icon: CurrencyRupeeIcon },
        { name: "AI Chatbot", href: "#", icon: ChatBubbleLeftRightIcon },
        { name: "Real-time Updates", href: "#", icon: ShieldCheckIcon }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "/contact" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Twitter", href: "#", icon: "🐦" },
    { name: "Instagram", href: "#", icon: "📸" },
    { name: "Facebook", href: "#", icon: "📘" },
    { name: "LinkedIn", href: "#", icon: "💼" }
  ];

  const stats = [
    { number: "50+", label: "Destinations" },
    { number: "10K+", label: "Happy Travelers" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Stats Section */}
        <div className="border-b border-white/10 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by Travelers Worldwide
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                Join thousands of happy travelers who have discovered their perfect trips with our AI-powered platform.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/70 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              
              {/* Brand Section */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">TripCraft</h3>
                      <p className="text-sm text-white/60">AI Trip Planner</p>
                    </div>
                  </div>
                  
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Experience the future of travel planning with our AI-powered platform. 
                    Create personalized itineraries, discover hidden gems, and make every journey unforgettable.
                  </p>

                  {/* Social Links */}
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                      >
                        <span className="text-lg">{social.icon}</span>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Footer Links */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {footerSections.map((section, sectionIndex) => (
                    <motion.div
                      key={sectionIndex}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <h4 className="text-lg font-semibold mb-6">{section.title}</h4>
                      <ul className="space-y-4">
                        {section.links.map((link, linkIndex) => {
                          const Icon = link.icon;
                          return (
                            <li key={linkIndex}>
                              <Link
                                to={link.href}
                                className="flex items-center text-white/70 hover:text-white transition-colors duration-300 group"
                              >
                                {Icon && (
                                  <Icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="group-hover:translate-x-1 transition-transform">
                                  {link.name}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10 py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-white/70 mb-6">
                Get the latest travel tips, destination guides, and exclusive offers delivered to your inbox.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  Subscribe
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center text-white/60 mb-4 md:mb-0"
              >
                <span>© {currentYear} TripCraft. Made with</span>
                <HeartIcon className="w-4 h-4 mx-1 text-red-400" />
                <span>for travelers worldwide.</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-center space-x-6 text-sm text-white/60"
              >
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
