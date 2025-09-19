"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toggleTheme } from "@/lib/utils"
import {
  Moon,
  Sun,
  TreePine,
  MapPin,
  TrendingUp,
  BarChart3,
  Database,
  Satellite,
  Activity,
  Globe,
  Eye,
  Layers,
  Download,
  Share2,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"
import React from "react"
import { Link } from "react-router-dom"

const features = [
  {
    icon: MapPin,
    title: "Interactive LULC Mapping",
    description: "Explore detailed land use and land cover maps with intuitive pan, zoom, and layer controls.",
    details: [
      "Multi-year layer comparison (2017-2024)",
      "Real-time map rendering",
      "Custom region selection",
      "High-resolution satellite imagery",
    ],
    category: "mapping",
  },
  {
    icon: TrendingUp,
    title: "Change Detection Analytics",
    description: "Quantify and visualize land cover changes over time with advanced analytical tools.",
    details: [
      "Year-over-year change analysis",
      "Hotspot identification",
      "Trend visualization",
      "Statistical significance testing",
    ],
    category: "analytics",
  },
  {
    icon: BarChart3,
    title: "Statistical Reporting",
    description: "Generate comprehensive reports with area calculations and trend analysis.",
    details: [
      "Per-class area summaries",
      "Time series analysis",
      "Exportable charts and graphs",
      "Custom report generation",
    ],
    category: "reporting",
  },
  {
    icon: Database,
    title: "PostGIS Integration",
    description: "Leverage powerful spatial database capabilities for complex geospatial operations.",
    details: ["Spatial joins and queries", "Geometric operations", "Data reprojection", "Optimized performance"],
    category: "data",
  },
  {
    icon: Satellite,
    title: "Satellite Data Processing",
    description: "Access and process multi-spectral satellite imagery with advanced algorithms.",
    details: ["Multi-sensor data fusion", "Cloud masking", "Atmospheric correction", "Quality assessment"],
    category: "data",
  },
  {
    icon: Activity,
    title: "Real-time API",
    description: "Integrate land change data into your applications with our robust API.",
    details: [
      "RESTful API endpoints",
      "Real-time data access",
      "Webhook notifications",
      "Rate limiting and authentication",
    ],
    category: "integration",
  },
]

const useCases = [
  {
    title: "Forest Conservation",
    description: "Monitor deforestation and forest degradation in real-time",
    icon: TreePine,
    metrics: ["95% accuracy", "Daily updates", "Global coverage"],
  },
  {
    title: "Urban Planning",
    description: "Track urban expansion and infrastructure development",
    icon: Globe,
    metrics: ["City-scale analysis", "Historical trends", "Growth predictions"],
  },
  {
    title: "Agricultural Monitoring",
    description: "Analyze crop patterns and agricultural land use changes",
    icon: Layers,
    metrics: ["Seasonal tracking", "Crop classification", "Yield estimation"],
  },
  {
    title: "Climate Research",
    description: "Study environmental changes and climate impact assessment",
    icon: Activity,
    metrics: ["Long-term trends", "Climate indicators", "Impact modeling"],
  },
]

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = React.useState("mapping")
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentDemo, setCurrentDemo] = React.useState(0)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)

  const filteredFeatures = features.filter((feature) => feature.category === activeTab)

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDemo((prev) => (prev + 1) % 4)
      }, 3000)
      if (videoRef.current) {
        videoRef.current.play().catch(() => {})
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <TreePine className="h-8 w-8 text-primary" />
              <Link to="/landingpage" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                Land Change
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Button variant="outline" size="sm" onClick={toggleTheme} className="bg-transparent">
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
                <span className="ml-2">Theme</span>
              </Button>

              <Link to="/features" className="text-sm font-medium text-primary font-semibold">
                Features
              </Link>
              <Link
                to="/blog"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>

              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-24">
      <div className="absolute inset-0">
          <video className="w-full h-full object-cover opacity-95" src="/video.mp4" autoPlay loop muted playsInline />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Satellite className="w-3 h-3 mr-1" />
              Platform Features
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
            Powerful Tools for Land Change Analysis
            </h1>
            <p className="text-xl text-foreground text-pretty mb-8 max-w-2xl mx-auto">
            Discover comprehensive features designed to make land use and land cover analysis accessible, accurate,
            and actionable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/mapanalysis">
                  <Globe className="w-5 h-5 mr-2" />
                  Launch Analysis
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
                <Link to="/mapanalysis">
                  <Eye className="w-5 h-5 mr-2" />
                  Preview the Data
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
              <p className="text-muted-foreground text-lg">Interactive demonstration of our core capabilities</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isPlaying ? "secondary" : "default"}
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "Pause" : "Play"} Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPlaying(false)
                      setCurrentDemo(0)
                      if (videoRef.current) {
                        videoRef.current.pause()
                        videoRef.current.currentTime = 0
                      }
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentDemo === index ? "bg-primary w-8" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  src="/use.mp4"
                  muted
                  playsInline
                  controls={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Tabs Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">Comprehensive Feature Set</h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                Everything you need for professional land change analysis, from data processing to visualization.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-12">
                <TabsTrigger value="mapping" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Mapping
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="reporting" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Reporting
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {filteredFeatures.map((feature, index) => (
                    <Card
                      key={feature.title}
                      className="group border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {feature.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                        <Button
                          variant="ghost"
                          className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">Real-World Applications</h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                See how organizations worldwide use our platform to drive meaningful change.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {useCases.map((useCase, index) => (
                <Card
                  key={useCase.title}
                  className="text-center border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-in-left"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <useCase.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{useCase.title}</CardTitle>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {useCase.metrics.map((metric, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Platform Performance</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="text-4xl font-bold text-primary mb-2">&lt;2s</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
              Join thousands of researchers, planners, and conservationists using our platform to make data-driven
              decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                <Users className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Share2 className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <TreePine className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Land Change</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Empowering global forest conservation through transparent, timely land change insights.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm">
                  LinkedIn
                </Button>
                <Button variant="ghost" size="sm">
                  GitHub
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>  
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Land Change. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
