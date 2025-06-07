import Navigation from '@/components/Navigation';
import Hero3D from '@/components/Hero3D';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Zap, 
  Shield, 
  Database, 
  Activity, 
  Code, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <Hero3D />

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="neon-purple">Revolutionary</span> Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of automation testing with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Dynamic Scraping */}
            <Card className="glass-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Globe className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Dynamic Web Scraping</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Intelligent extraction of HTML structures and CSS selectors from any website
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Real-time DOM analysis</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Selector optimization</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Element validation</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Script Generation */}
            <Card className="glass-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Code className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">AI Script Generation</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Generate precise Puppeteer automation scripts based on user stories
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Context-aware scripting</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Error handling included</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Adaptive logic</li>
                </ul>
              </CardContent>
            </Card>

            {/* State Management */}
            <Card className="glass-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">State Management</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Maintain test execution state across multiple automation steps
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Session persistence</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Multi-step workflows</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Progress tracking</li>
                </ul>
              </CardContent>
            </Card>

            {/* Authentication Handling */}
            <Card className="glass-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Smart Auth Handling</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Dynamically handle authenticated and non-authenticated websites
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Credential management</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />OAuth support</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Session handling</li>
                </ul>
              </CardContent>
            </Card>

            {/* Real-time Reports */}
            <Card className="glass-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Comprehensive Reports</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Detailed success/failure reports with screenshots and logs
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Visual evidence</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Performance metrics</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Error analysis</li>
                </ul>
              </CardContent>
            </Card>

            {/* Database Integration */}
            <Card className="glass-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                    <Database className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Data Persistence</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Store test configurations, results, and historical data
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Test history</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Configuration storage</li>
                  <li><CheckCircle className="w-4 h-4 text-green-400 inline mr-2" />Analytics ready</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="neon-green">Intelligent</span> Workflow
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how TestWeaver transforms your Jira tickets into comprehensive automated tests
            </p>
          </div>

          <div className="relative">
            {/* Workflow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1: Webhook */}
              <div className="text-center animate-slide-up">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 neon-blue">Jira Webhook</h3>
                <p className="text-gray-400 text-sm">
                  Receive ticket data including user stories, test URLs, and credentials
                </p>
              </div>

              {/* Step 2: Scraping */}
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 neon-purple">Web Scraping</h3>
                <p className="text-gray-400 text-sm">
                  Extract HTML structure and identify interactive elements with Puppeteer
                </p>
              </div>

              {/* Step 3: AI Analysis */}
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 neon-green">AI Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Groq LLM analyzes user story and generates appropriate automation scripts
                </p>
              </div>

              {/* Step 4: Execution */}
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <span className="text-2xl font-bold">4</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 neon-blue">Test Execution</h3>
                <p className="text-gray-400 text-sm">
                  Execute automation scripts and generate comprehensive test reports
                </p>
              </div>
            </div>

            {/* Connecting Lines */}
            <div className="hidden lg:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-600 via-green-500 to-cyan-500 opacity-30"></div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="integration" className="py-20 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="neon-purple">Seamless</span> Integration
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with your existing tools and workflows effortlessly
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Integration Features */}
            <div className="space-y-8 animate-slide-up">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Jira Webhook Integration</h3>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Automatic trigger when new tickets are created or updated
                  </p>
                  <div className="code-block">
                    <code className="text-green-400">
                      POST /webhook/jira<br />
                      Content-Type: application/json
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                      <Bot className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Groq LLM API</h3>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Powered by advanced language models for intelligent test generation
                  </p>
                  <div className="code-block">
                    <code className="text-cyan-400">
                      Model: meta-llama/llama-4-scout-17b-16e-instruct
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tech Stack Visualization */}
            <div className="grid grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Card className="glass-card text-center hover-lift">
                <CardContent className="p-6">
                  <Code className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Node.js</h4>
                  <p className="text-gray-400 text-sm">TypeScript Backend</p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center hover-lift">
                <CardContent className="p-6">
                  <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">React</h4>
                  <p className="text-gray-400 text-sm">Modern Frontend</p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center hover-lift">
                <CardContent className="p-6">
                  <Bot className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Puppeteer</h4>
                  <p className="text-gray-400 text-sm">Headless Automation</p>
                </CardContent>
              </Card>

              <Card className="glass-card text-center hover-lift">
                <CardContent className="p-6">
                  <Database className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">PostgreSQL</h4>
                  <p className="text-gray-400 text-sm">Data Storage</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-600/10 to-green-500/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="neon-blue">Revolutionize</span><br />
            Your Testing Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of automation testing with AI-powered intelligence
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="btn-cyber group">
              <Bot className="w-5 h-5 mr-2" />
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" size="lg" className="btn-outline">
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
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TestWeaver</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered automation testing platform that transforms your Jira tickets into comprehensive test scripts.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400">
                  <Github className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400">
                  <Linkedin className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
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
};

export default Home;
