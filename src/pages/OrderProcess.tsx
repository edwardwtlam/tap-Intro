import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Wrench, Truck, Smartphone } from 'lucide-react';

export default function OrderProcess() {
  const steps = [
    {
      number: 1,
      title: 'Order Online',
      description: 'Browse and customize your Tapdex card. Select design, information, and features you want. Complete your order securely online.',
      icon: ShoppingCart,
    },
    {
      number: 2,
      title: 'We Setup For You',
      description: 'Our team configures your card with your profile information and customization. Everything is personalized to your needs.',
      icon: Wrench,
    },
    {
      number: 3,
      title: 'Free Shipping',
      description: 'Your card ships to you completely free, worldwide. No hidden charges. Track your package from our warehouse to your door.',
      icon: Truck,
    },
    {
      number: 4,
      title: 'Tap & Connect',
      description: 'Receive your card and start sharing instantly. Tap to share your profile — and update it anytime. New job? New number? Log in, edit, done. Lifetime free.',
      icon: Smartphone,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-24">
          {/* Header Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <Link to="/" className="flex items-center gap-2">
              <img src="/tapdex-logo.svg" alt="Tapdex" className="w-64 h-64 object-contain" />
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              How to Get Your
              <br />
              <span className="text-sky-400">Tapdex Card</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              A simple 4-step process to get your NFC digital business card. Order online, we set it up, free shipping, and start connecting instantly.
            </p>
          </div>

          {/* Order Flow Visual */}
          <div className="mb-20">
            <img
              src="/Order_Flow.png"
              alt="Order Process Flow"
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
            />
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative group bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-8 hover:border-sky-500/50 transition-all duration-300"
                >
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/30 transition-colors">
                    <span className="text-sky-400 font-bold text-lg">{step.number}</span>
                  </div>

                  <div className="mb-6">
                    <div className="w-16 h-16 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4 group-hover:bg-sky-500/20 transition-colors">
                      <Icon size={32} className="text-sky-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  </div>

                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Timeline View */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Process Timeline</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-500 to-gray-700" />

              {/* Timeline items */}
              <div className="space-y-12">
                {[
                  {
                    title: 'Order Placed',
                    desc: 'Your order is received and confirmed',
                    time: 'Immediate',
                  },
                  {
                    title: 'Setup & Configuration',
                    desc: 'We personalize your card with your details',
                    time: '1-2 Business Days',
                  },
                  {
                    title: 'Quality Check',
                    desc: 'Final review before dispatch',
                    time: '1 Business Day',
                  },
                  {
                    title: 'Shipped',
                    desc: 'Card ships with free international shipping',
                    time: '3-7 Business Days',
                  },
                  {
                    title: 'Delivered',
                    desc: 'Receive and activate your Tapdex card',
                    time: 'Ready to Use',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="md:flex items-center">
                    <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                      <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6 hover:border-sky-500/50 transition-all">
                        <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                        <p className="text-gray-400 text-sm mb-3">{item.desc}</p>
                        <p className="text-sky-400 font-medium text-sm">{item.time}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex md:justify-center">
                      <div className="w-4 h-4 rounded-full bg-sky-500 border-4 border-gray-950 relative z-10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: 'How long does delivery take?',
                  a: 'Setup takes 2-3 business days, then 3-7 business days for delivery worldwide. All shipping is free.',
                },
                {
                  q: 'Can I customize my card design?',
                  a: 'Yes! Choose from templates or create a custom design during checkout. Our team helps bring your vision to life.',
                },
                {
                  q: 'What information can I include?',
                  a: 'Add your name, title, phone, email, social media, website, and more. Update all of it anytime for free — lifetime data management included.',
                },
                {
                  q: 'Can I update my info after receiving the card?',
                  a: 'Yes — and it\'s free forever! Log into your dashboard anytime to change your details. The NFC card always links to your latest profile. No reprints, no fees.',
                },
                {
                  q: 'Is shipping really free?',
                  a: 'Yes, completely free worldwide shipping with every order. No hidden fees.',
                },
                {
                  q: 'Do I need an app?',
                  a: 'No app needed to share. Recipients just tap your card with their phone. No special software required.',
                },
                {
                  q: 'Can I reorder more cards?',
                  a: 'Absolutely! Order additional cards anytime with the same design or create new designs.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6 hover:border-sky-500/50 transition-all"
                >
                  <h3 className="font-semibold text-white mb-3">{faq.q}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Tapdex — Three Pillars */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Tapdex</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Data Security',
                  desc: 'Your personal data stays yours. No centralized platform sharing, no data selling. Your profile, your control — powered by secure Supabase infrastructure.',
                },
                {
                  title: 'Eco-Friendly',
                  desc: 'Crafted from certified sustainable materials with international eco-certification. Fully biodegradable. No more printing boxes of paper cards that end up in landfill. One card, zero waste, forever.',
                },
                {
                  title: 'Lifetime · Free Shipping',
                  desc: 'One-time purchase. Free worldwide delivery. Lifetime free data management — update your info anytime. No subscription, no hidden fees.',
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-8 text-center hover:border-sky-500/50 transition-all"
                >
                  <h3 className="text-lg font-bold text-white mb-3">{pillar.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative bg-gradient-to-r from-sky-500/20 to-cyan-500/20 border border-sky-500/50 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-4 max-w-xl mx-auto">
              Join professionals using Tapdex to connect instantly — with <span className="text-sky-400 font-semibold">lifetime free data management</span>.
            </p>
            <p className="text-gray-500 text-sm mb-8 max-w-xl mx-auto">
              Change jobs? New phone number? Update your profile anytime, anywhere. No reprint fees. No expiry. Forever.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Order Your Card Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/tapdex-logo.svg" alt="Tapdex" className="w-40 h-40 object-contain" />
          </div>
          <p className="text-xs text-gray-500">www.tapdex.com</p>
        </div>
      </footer>
    </div>
  );
}
