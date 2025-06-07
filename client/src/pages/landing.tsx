import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MatrixBackground from '@/components/MatrixBackground';
import ThreeBackground from '@/components/ThreeBackground';
import { 
  Bot, 
  Webhook, 
  Cog, 
  Brain, 
  Shield, 
  ChartLine, 
  Database,
  Zap,
  Rocket,
  Play,
  Github
} from 'lucide-react';
import { SiReact, SiNodedotjs, SiMongodb, SiTypescript } from 'react-icons/si';

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Smart AI Agent",
      description: "Powered by Groq LLM for intelligent test script generation",
      gradient: "from-cyan-400 to-purple-600"
    },
    {
      icon: <Webhook className="w-8 h-8" />,
      title: "Jira Integration", 
      description: "Seamless webhook integration with Jira for automated triggers",
      gradient: "from-purple-600 to-emerald-400"
    },
    {
      icon: <Cog className="w-8 h-8" />,
      title: "Headless Testing",
      description: "Puppeteer-powered automation for reliable testing",
      gradient: "from-emerald-400 to-cyan-400"
    }
  ];

  const detailedFeatures = [
    {
      icon: <Brain className="w-6 h-6 text-cyan-400" />,
      title: "Dynamic Web Scraping",
      description: "Intelligent extraction of HTML structures and CSS selectors from any website",
      points: ["Real-time DOM analysis", "Selector optimization", "Element validation"]
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: "AI Script Generation",
      description: "Generate precise Puppeteer automation scripts based on user stories",
      points: ["Context-aware scripting", "Error handling included", "Adaptive logic"]
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      title: "Smart Auth Handling",
      description: "Dynamically handle authenticated and non-authenticated websites",
      points: ["Credential management", "OAuth support", "Session handling"]
    },
    {
      icon: <ChartLine className="w-6 h-6 text-cyan-400" />,
      title: "Comprehensive Reports",
      description: "Detailed success/failure reports with screenshots and logs",
      points: ["Visual evidence", "Performance metrics", "Error analysis"]
    }
  ];

  const techStack = [
    { icon: <SiNodedotjs className="w-8 h-8 text-green-400" />, name: "Node.js", desc: "TypeScript Backend" },
    { icon: <SiReact className="w-8 h-8 text-blue-400" />, name: "React", desc: "Modern Frontend" },
    { icon: <Bot className="w-8 h-8 text-purple-400" />, name: "Puppeteer", desc: "Headless Automation" },
    { icon: <Database className="w-8 h-8 text-emerald-400" />, name: "PostgreSQL", desc: "Data Storage" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Effects */}
      <MatrixBackground />
      <ThreeBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-cyan-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                TestWeaver
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
              <a href="#workflow" className="hover:text-cyan-400 transition-colors">Workflow</a>
              <a href="#integration" className="hover:text-cyan-400 transition-colors">Integration</a>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative pt-16">
        <div className="absolute inset-0 bg-gradient-radial from-cyan-400/10 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,217,255,0.5)]">AI-Powered</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-emerald-400 bg-clip-text text-transparent">
                Automation Testing
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              TestWeaver revolutionizes web testing with intelligent AI agents that understand your Jira tickets 
              and automatically generate comprehensive test automation scripts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-lg px-8 py-4"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Automating Now
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 hover:border-cyan-400 hover:text-cyan-400 text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Floating Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`bg-black/40 backdrop-blur-lg border-gray-800 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/20 hover:-translate-y-2 animate-float`}
                style={{ animationDelay: `${index * 0.5}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]">Revolutionary</span> Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of automation testing with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {detailedFeatures.map((feature, index) => (
              <Card 
                key={index}
                className="bg-black/40 backdrop-blur-lg border-gray-800 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-400/20"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center mr-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">Intelligent</span> Workflow
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how TestWeaver transforms your Jira tickets into comprehensive automated tests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Workflow Steps */}
            {[
              { number: "1", title: "Jira Webhook", desc: "Receive ticket data including user stories, test URLs, and credentials", color: "cyan" },
              { number: "2", title: "Web Scraping", desc: "Extract HTML structure and identify interactive elements with Puppeteer", color: "purple" },
              { number: "3", title: "AI Analysis", desc: "Groq LLM analyzes user story and generates appropriate automation scripts", color: "emerald" },
              { number: "4", title: "Test Execution", desc: "Execute automation scripts and generate comprehensive test reports", color: "cyan" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-r from-${step.color}-400 to-${step.color}-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-${step.color}-400/50`}>
                  <span className="text-2xl font-bold">{step.number}</span>
                </div>
                <h3 className={`text-xl font-semibold mb-2 text-${step.color}-400`}>{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
            
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 via-emerald-400 to-cyan-400 opacity-30"></div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="integration" className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-purple-400 drop-shadow-[0_0_20px_rgba(124,58,237,0.5)]">Modern</span> Tech Stack
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with cutting-edge technologies for maximum performance and reliability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <Card 
                key={index}
                className="bg-black/40 backdrop-blur-lg border-gray-800 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/20 text-center"
              >
                <CardContent className="p-6">
                  <div className="mb-4">{tech.icon}</div>
                  <h4 className="text-lg font-semibold mb-2">{tech.name}</h4>
                  <p className="text-gray-400 text-sm">{tech.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-emerald-400/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,217,255,0.5)]">Revolutionize</span>
            <br />
            Your Testing Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of automation testing with AI-powered intelligence
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-lg px-8 py-4"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-600 hover:border-cyan-400 hover:text-cyan-400 text-lg px-8 py-4"
            >
              <Github className="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TestWeaver</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered automation testing platform that transforms your Jira tickets into comprehensive test scripts.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#workflow" className="hover:text-white transition-colors">Workflow</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TestWeaver. All rights reserved. Powered by AI, Built for the Future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
