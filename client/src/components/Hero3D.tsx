import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Globe, Shield } from 'lucide-react';

const Hero3D = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Apply subtle 3D transform to floating cards
      const cards = hero.querySelectorAll('.hero-card');
      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        const intensity = (index + 1) * 0.5;
        element.style.transform = `
          translateY(-20px) 
          rotateX(${y * intensity}deg) 
          rotateY(${x * intensity}deg)
          translateZ(20px)
        `;
      });
    };

    hero.addEventListener('mousemove', handleMouseMove);

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section 
      ref={heroRef}
      className="min-h-screen flex items-center justify-center relative pt-16 perspective-1000"
    >
      <div className="hero-glow absolute inset-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main Hero Content */}
        <div className="animate-float">
          <Badge variant="outline" className="mb-6 border-cyan-500 text-cyan-400">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Automation Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="neon-blue">AI-Powered</span><br />
            <span className="text-gradient">
              Automation Testing
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            TestWeaver revolutionizes web testing with intelligent AI agents that understand your Jira tickets 
            and automatically generate comprehensive test automation scripts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button size="lg" className="btn-cyber">
              <Bot className="w-5 h-5 mr-2" />
              Start Automating Now
            </Button>
            
            <Button variant="outline" size="lg" className="btn-outline">
              <Globe className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Floating 3D Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* AI Agent Card */}
          <div 
            className="hero-card feature-card animate-float"
            style={{ animationDelay: '0s' }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 neon-blue">Smart AI Agent</h3>
            <p className="text-gray-400">Powered by Groq LLM for intelligent test script generation</p>
          </div>

          {/* Webhook Integration Card */}
          <div 
            className="hero-card feature-card animate-float"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 neon-purple">Jira Integration</h3>
            <p className="text-gray-400">Seamless webhook integration with Jira for automated triggers</p>
          </div>

          {/* Automation Card */}
          <div 
            className="hero-card feature-card animate-float"
            style={{ animationDelay: '1s' }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 neon-green">Headless Testing</h3>
            <p className="text-gray-400">Puppeteer-powered automation for reliable testing</p>
          </div>
        </div>

        {/* Workflow Steps Indicator */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-sm font-bold animate-pulse-glow">
                  {step}
                </div>
                {index < 3 && (
                  <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero3D;
