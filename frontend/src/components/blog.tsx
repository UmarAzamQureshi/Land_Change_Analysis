"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toggleTheme } from "@/lib/utils"
import { Moon, Sun, Search, Calendar, Clock, User, ArrowRight, TreePine, Filter, Tag } from "lucide-react"
import React from "react"
import { Link } from "react-router-dom"

// Mock blog data
const blogPosts = [
  {
    id: 1,
    title: "Tracking Deforestation in the Amazon: 2024 Analysis",
    excerpt:
      "Our latest satellite analysis reveals concerning trends in Amazon deforestation rates, with new hotspots emerging in previously protected areas.",
    author: "Dr. Sarah Chen",
    date: "2024-03-15",
    readTime: "8 min read",
    category: "Research",
    tags: ["Deforestation", "Amazon", "Satellite Data"],
    image: "/placeholder-nkg4y.png",
  },
  {
    id: 2,
    title: "Urban Expansion Patterns: A Global Perspective",
    excerpt:
      "How cities worldwide are growing and what it means for sustainable development. Analysis of urban sprawl patterns from 2017-2024.",
    author: "Prof. Michael Rodriguez",
    date: "2024-03-10",
    readTime: "12 min read",
    category: "Urban Planning",
    tags: ["Urban Growth", "Sustainability", "Global Analysis"],
    image: "/placeholder-ayhr1.png",
  },
  {
    id: 3,
    title: "Machine Learning in Land Cover Classification",
    excerpt:
      "Exploring how AI and machine learning are revolutionizing the accuracy and speed of land use classification from satellite imagery.",
    author: "Dr. Emily Watson",
    date: "2024-03-05",
    readTime: "10 min read",
    category: "Technology",
    tags: ["Machine Learning", "AI", "Classification"],
    image: "/placeholder-blm7l.png",
  },
  {
    id: 4,
    title: "Climate Change Impact on Vegetation Patterns",
    excerpt:
      "Understanding how changing climate conditions are affecting vegetation distribution and health across different ecosystems.",
    author: "Dr. James Park",
    date: "2024-02-28",
    readTime: "15 min read",
    category: "Climate",
    tags: ["Climate Change", "Vegetation", "Ecosystem"],
    image: "/placeholder-p1evu.png",
  },
  {
    id: 5,
    title: "Coastal Erosion Monitoring with Satellite Data",
    excerpt:
      "How satellite technology is helping us track and predict coastal changes, providing crucial data for coastal management strategies.",
    author: "Dr. Lisa Thompson",
    date: "2024-02-20",
    readTime: "9 min read",
    category: "Environmental",
    tags: ["Coastal Erosion", "Monitoring", "Satellite"],
    image: "/placeholder-tgbhd.png",
  },
  {
    id: 6,
    title: "Agricultural Land Use Optimization",
    excerpt:
      "Leveraging LULC data to help farmers and policymakers make informed decisions about sustainable agricultural practices.",
    author: "Dr. Robert Kim",
    date: "2024-02-15",
    readTime: "11 min read",
    category: "Agriculture",
    tags: ["Agriculture", "Optimization", "Sustainability"],
    image: "/placeholder-ixavy.png",
  },
]

const categories = ["All", "Research", "Technology", "Urban Planning", "Climate", "Environmental", "Agriculture"]

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [visiblePosts, setVisiblePosts] = React.useState(3)

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const loadMorePosts = () => {
    setVisiblePosts((prev) => Math.min(prev + 3, filteredPosts.length))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <TreePine className="h-8 w-8 text-primary" />
              <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                Land Change
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Button variant="outline" size="sm" onClick={toggleTheme} className="bg-transparent">
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
                <span className="ml-2">Theme</span>
              </Button>

              <Link
                to="/features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link to="/blog" className="text-sm font-medium text-primary font-semibold">
                Blog
              </Link>
              <Link
                to="/#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <Badge variant="secondary" className="mb-6">
              <TreePine className="w-3 h-3 mr-1" />
              Insights & Research
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">Land Change Blog</h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
              Discover the latest insights, research findings, and technological advances in land use and land cover
              analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles, topics, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="transition-all duration-200"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {filteredPosts.slice(0, visiblePosts).map((post, index) => (
                    <Card
                      key={post.id}
                      className="group border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(post.date).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="w-3 h-3 mr-1" />
                            {post.author}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {post.readTime}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {visiblePosts < filteredPosts.length && (
                  <div className="text-center">
                    <Button
                      onClick={loadMorePosts}
                      size="lg"
                      variant="outline"
                      className="animate-pulse-glow bg-transparent"
                    >
                      Load More Articles
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center animate-slide-in-left">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-8">
              Get the latest insights and research findings delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input placeholder="Enter your email" type="email" className="flex-1" />
              <Button className="sm:w-auto">Subscribe</Button>
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
                    Pricing
                  </a>
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
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                <Link to="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
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
