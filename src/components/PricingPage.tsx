import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Users, 
  Shield, 
  ArrowRight, 
  Sparkles,
  Bot,
  Mic,
  Eye,
  Target,
  BarChart3,
  Headphones,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface PricingPageProps {
  onGetStarted: () => void;
  onContactSales: () => void;
  onBackToAuth?: () => void;
}

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechFlow Inc",
    content: "Bapto AI has revolutionized how our team handles complex workflows. The step-by-step guidance is incredibly accurate.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=transparent"
  },
  {
    name: "Marcus Rodriguez",
    role: "UX Designer", 
    company: "DesignLab",
    content: "The ChatGPT 4o-mini integration makes screen analysis incredibly precise. It's like having an AI assistant that truly understands what I'm working on.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=transparent"
  },
  {
    name: "Emily Watson",
    role: "Operations Director",
    company: "StartupHub",
    content: "Team collaboration features have streamlined our onboarding process. New employees get up to speed 3x faster with Bapto AI guidance.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily&backgroundColor=transparent"
  }
];

const companyLogos = [
  { name: "TechFlow", logo: "🚀" },
  { name: "DesignLab", logo: "🎨" },
  { name: "StartupHub", logo: "💡" },
  { name: "DataCorp", logo: "📊" },
  { name: "CloudTech", logo: "☁️" },
  { name: "InnovateCo", logo: "⚡" }
];

const faqs = [
  {
    question: "How does Bapto AI's screen analysis work?",
    answer: "Bapto AI uses ChatGPT 4o-mini's advanced multimodal AI to analyze your screen in real-time. It combines computer vision, OCR text extraction, and UI element detection to understand exactly what's on your screen and provide contextual guidance."
  },
  {
    question: "Is my screen data secure and private?",
    answer: "Absolutely. Your screen data is processed securely through OpenAI's ChatGPT API and is never stored permanently. All analysis happens in real-time, and we follow strict privacy protocols to protect your information."
  },
  {
    question: "Can I use Bapto AI with any application?",
    answer: "Yes! Bapto AI works with any application or website visible on your screen. Whether you're using design software, productivity tools, web applications, or system interfaces, Bapto AI can provide intelligent guidance."
  },
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes 10 screen analysis sessions per month, basic text-to-speech voice output, and access to core AI guidance features. It's perfect for trying out Bapto AI and light usage."
  },
  {
    question: "How does team collaboration work?",
    answer: "Team plans include shared workspaces, collaborative task scripting, real-time voice bot assistance, and detailed usage analytics. Team members can share guidance sessions and build reusable automation scripts together."
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades will take effect at the end of your current billing cycle. No long-term commitments required."
  }
];

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted, onContactSales, onBackToAuth }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Free Plan",
      subtitle: "Starter",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for trying out Bapto AI's capabilities",
      features: [
        "10 screen analysis sessions/month",
        "Basic TTS voice output",
        "Core AI guidance features",
        "Standard response time",
        "Community support"
      ],
      limitations: [
        "No automation features",
        "No team collaboration",
        "Limited voice quality"
      ],
      cta: "Get Started for Free",
      popular: false,
      gradient: "from-gray-600 to-gray-700"
    },
    {
      name: "Pro Plan", 
      subtitle: "Most Popular",
      price: { monthly: 29, annual: 24 },
      description: "Unlimited power for professionals and power users",
      features: [
        "Unlimited screen analysis sessions",
        "High-quality TTS voice",
        "Cursor & keyboard automation",
        "Priority AI processing",
        "Advanced OCR & UI detection",
        "Step-by-step guidance mode",
        "Voice input & commands",
        "Priority support"
      ],
      limitations: [],
      cta: "Upgrade to Pro",
      popular: true,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Team Plan",
      subtitle: "Enterprise Ready", 
      price: { monthly: 99, annual: 79 },
      description: "Everything in Pro plus team collaboration and insights",
      features: [
        "Everything in Pro Plan",
        "Team collaboration workspace",
        "Task scripting & automation",
        "Real-time voice bot assistant",
        "Usage analytics & insights",
        "Team member management",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-blue-500 to-cyan-500"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back to Auth Button */}
      {onBackToAuth && (
        <button
          onClick={onBackToAuth}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 hover:scale-105 border border-white/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-screen filter blur-xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-screen filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full mix-blend-screen filter blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-slide-in-up">
            <img 
              src="/Untitled design (7).png" 
              alt="Bapto AI Logo"
              className="w-16 h-16 rounded-2xl shadow-lg"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold text-white">Bapto AI</h1>
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">ChatGPT 4o-mini</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="gradient-text-bw">Intelligent Screen Guidance</span>
            <br />
            <span className="text-white">for Everyone</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            Transform how you work with AI-powered screen analysis, step-by-step guidance, and intelligent automation. 
            Powered by ChatGPT 4o-mini for unmatched accuracy and understanding.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
            <span className={`text-sm ${!isAnnual ? 'text-white font-medium' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                isAnnual ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                isAnnual ? 'left-8' : 'left-1'
              }`} />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white font-medium' : 'text-gray-400'}`}>
              Annual
              <span className="ml-1 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">Save 20%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 animate-slide-in-up ${
                plan.popular 
                  ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20' 
                  : 'glass-effect-bw border border-white/20'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    {plan.subtitle}
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-white">
                      ${isAnnual ? plan.price.annual : plan.price.monthly}
                    </span>
                    <span className="text-gray-400">
                      {plan.price.monthly === 0 ? '' : `/${isAnnual ? 'month' : 'month'}`}
                    </span>
                  </div>
                  {isAnnual && plan.price.monthly > 0 && (
                    <p className="text-sm text-green-400 mt-2">
                      Save ${(plan.price.monthly - plan.price.annual) * 12}/year
                    </p>
                  )}
                </div>

                <button
                  onClick={plan.name === 'Team Plan' ? onContactSales : onGetStarted}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      : 'bg-white hover:bg-gray-100 text-black'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white mb-3">What's included:</h4>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.length > 0 && (
                  <>
                    <h4 className="font-semibold text-gray-400 mb-3 mt-6">Not included:</h4>
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-center gap-3">
                        <X className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Feature Comparison</h2>
          <p className="text-xl text-gray-400">See exactly what's included in each plan</p>
        </div>

        <div className="glass-effect-bw rounded-2xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-6 text-white font-semibold">Features</th>
                  <th className="text-center p-6 text-white font-semibold">Free</th>
                  <th className="text-center p-6 text-white font-semibold bg-gradient-to-r from-purple-900/20 to-pink-900/20">Pro</th>
                  <th className="text-center p-6 text-white font-semibold">Team</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Screen Analysis Sessions', free: '10/month', pro: 'Unlimited', team: 'Unlimited' },
                  { feature: 'AI Voice Quality', free: 'Basic', pro: 'High Quality', team: 'High Quality' },
                  { feature: 'Automation Features', free: '❌', pro: '✅', team: '✅' },
                  { feature: 'Priority Processing', free: '❌', pro: '✅', team: '✅' },
                  { feature: 'Team Collaboration', free: '❌', pro: '❌', team: '✅' },
                  { feature: 'Usage Analytics', free: '❌', pro: '❌', team: '✅' },
                  { feature: 'Custom Integrations', free: '❌', pro: '❌', team: '✅' },
                  { feature: 'Support Level', free: 'Community', pro: 'Priority', team: 'Dedicated' }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-6 text-gray-300">{row.feature}</td>
                    <td className="p-6 text-center text-gray-400">{row.free}</td>
                    <td className="p-6 text-center text-purple-300 bg-gradient-to-r from-purple-900/10 to-pink-900/10">{row.pro}</td>
                    <td className="p-6 text-center text-blue-300">{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-400">Join thousands of professionals already using Bapto AI</p>
        </div>

        <div className="relative">
          <div className="glass-effect-bw rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevTestimonial}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full border-2 border-white/20"
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-white">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-400">{testimonials[currentTestimonial].role}</p>
                    <p className="text-purple-300">{testimonials[currentTestimonial].company}</p>
                  </div>
                </div>
                <blockquote className="text-lg text-gray-300 italic leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
              </div>
              
              <button
                onClick={nextTestimonial}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-purple-500' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Company Logos */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-8">Trusted by teams at</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <span className="text-2xl">{company.logo}</span>
                <span className="font-medium">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-400">Everything you need to know about Bapto AI</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="glass-effect-bw rounded-lg border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <div className={`transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="glass-effect-bw rounded-2xl p-12 text-center border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Workflow?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals using Bapto AI to work smarter, faster, and more efficiently with AI-powered guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Get Started for Free
              </button>
              
              <button
                onClick={onContactSales}
                className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 border border-white/30 flex items-center justify-center gap-2"
              >
                <Headphones className="w-5 h-5" />
                Contact Sales
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              No credit card required • Start with 10 free sessions • Upgrade anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};