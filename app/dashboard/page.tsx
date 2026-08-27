'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight, Sparkles, MessageSquare, Share2 } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground">Manage your AI-powered Etsy tools and credits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => window.location.href='/dashboard/listing'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Listing Generator</CardTitle>
            <Sparkles className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create SEO-optimized titles, descriptions, and tags for your Etsy products in seconds.
            </p>
            <div className="flex items-center text-sm font-medium text-primary">
              Open Tool <ArrowRight className="ml-2 h-4 w-4" />
            </div >
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => window.location.href='/dashboard/messages'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Message Assistant</CardTitle>
            <MessageSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate professional and friendly replies to customer inquiries and reviews.
            </p>
            <div className="flex items-center text-sm font-medium text-primary">
              Open Tool <ArrowRight className="ml-2 h-4 w-4" />
            </div >
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => window.location.href='/dashboard/social'}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Social Media Posts</CardTitle>
            <Share2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create eye-catching captions and hashtags for Instagram, Pinterest, and TikTok.
            </p>
            <div className="flex items-center text-sm font-medium text-primary">
              Open Tool <ArrowRight className="ml-2 h-4 w-4" />
            </div >
          </CardContent>
        </Card>
      </div >
    </div >
  )
}