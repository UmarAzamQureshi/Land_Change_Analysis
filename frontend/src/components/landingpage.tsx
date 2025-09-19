import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toggleTheme } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import {
  TreePine,
  BarChart3,
  Satellite,
  Globe,
  TrendingUp,
  Users,
  Database,
  MapPin,
  Activity,
  Leaf,
  Eye,
} from "lucide-react"
import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import lulc2024 from "@/assets/lulc_2024.jpg"

export default function LandingPage() {
  const navigate = useNavigate()
  const [authed, setAuthed] = React.useState(!!localStorage.getItem("access_token"))
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | undefined>(undefined)

  React.useEffect(() => {
    if (!carouselApi) return
    const intervalId = window.setInterval(() => {
      try {
        carouselApi.scrollNext()
      } catch {}
    }, 3000)
    return () => window.clearInterval(intervalId)
  }, [carouselApi])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    setAuthed(false)
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <TreePine className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Land Change</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Button variant="outline" size="sm" onClick={toggleTheme} className="bg-transparent">
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
                <span className="ml-2">Theme</span>
              </Button>

              <a
                href="/features"
                
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#data"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Data
              </a>
              <a
                href="#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              {authed ? (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/6">
      <div className="absolute inset-0">
          <video className="w-full h-full object-cover opacity-95" src="/video.mp4" autoPlay loop muted playsInline />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Satellite className="w-3 h-3 mr-1" />
              Land Use / Land Cover Intelligence
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              See how landscapes change over time — clearly and confidently
            </h1>
            <p className="text-xl text-foreground text-pretty mb-8 max-w-2xl mx-auto">
              We analyze multi-year satellite rasters to map LULC classes, quantify year-over-year change, and surface
              actionable insights on deforestation, urban growth, and vegetation dynamics.
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

      {/* Stats Section (Carousel) */}
      <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Carousel opts={{ loop: true }} setApi={setCarouselApi}>
          <CarouselContent>
            <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
              <div className="text-center bg-white/0 backdrop-blur-md border border-white/20 shadow-lg rounded-lg p-8 h-full flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-primary mb-2">2017–2024</div>
                <div className="text-sm text-muted-foreground">
                  Multi-year LULC Coverage
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
              <div className="text-center bg-white/0 backdrop-blur-md border border-white/20 shadow-lg rounded-lg p-8 h-full flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-primary mb-2">8+</div>
                <div className="text-sm text-muted-foreground">
                  Distinct LULC Classes
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
              <div className="text-center bg-white/0 backdrop-blur-md border border-white/20 shadow-lg rounded-lg p-8 h-full flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
                <div className="text-sm text-muted-foreground">
                  Interactive Map Rendering
                </div>
              </div>
            </CarouselItem>
            <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
              <div className="text-center bg-white/0 backdrop-blur-md border border-white/20 shadow-lg rounded-lg p-8 h-full flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-primary mb-2">GeoJSON</div>
                <div className="text-sm text-muted-foreground">
                  Export & API Access
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">What you can do today</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Explore class maps per year, compare changes, and drill into the numbers all in your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Interactive LULC Map</CardTitle>
                <CardDescription>
                  Toggle yearly layers (2017–2024), view class legends, and explore regions with smooth pan/zoom.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Change Detection</CardTitle>
                <CardDescription>
                  Compare any two years to quantify gains/losses by class and highlight hotspots of change.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Class Statistics</CardTitle>
                <CardDescription>
                  Get per-class area summaries, time series, and shareable charts that explain the trends.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>PostGIS</CardTitle>
                <CardDescription>
                  Server-side spatial processing runs in PostGIS — reprojection, clipping, spatial joins, and
                  class-area aggregation — with results exported as lightweight GeoJSON layers for fast delivery
                  in the app.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Satellite className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Raster-backed Insights</CardTitle>
                <CardDescription>
                  Results are derived from year-specific LULC rasters and exported as lightweight vector layers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Reliable, Fast API</CardTitle>
                <CardDescription>
                  Backed by FastAPI with static GeoJSON delivery for responsive maps and consistent results.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Visualization Preview */}
      <section id="data" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">
              What our data shows — at a glance
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Land change is complex. We make it clear: which classes are growing or shrinking, where changes cluster,
              and how patterns evolve year over year.
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
            <div
              className="aspect-video rounded-lg relative bg-cover bg-center"
              style={{ backgroundImage: `url(${lulc2024})` }}
            >
              {/* Full overlay */}
              <div className="absolute inset-0 bg-background/20 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center text-center p-4">
                <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interactive Land Change Map</h3>
                <p className="textS-foreground max-w-md">
                  Explore yearly LULC layers, class statistics, and change summaries with a single click.
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/mapanalysis">Launch Analysis</Link>
                </Button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-primary-foreground">
            <Leaf className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">Built for clarity and action</h2>
            <p className="text-xl opacity-90 text-pretty max-w-2xl mx-auto mb-8">
              Whether you are monitoring conservation outcomes or planning urban growth, our tools turn satellite data
              into clear, defensible evidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link to="/mapanalysis">
                  <Users className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent" asChild
              >
                <Link to="/landingpage#features">Learn More</Link>
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
                  <a href="/features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>              
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
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
