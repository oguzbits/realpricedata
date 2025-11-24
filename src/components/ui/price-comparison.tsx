"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Check, ArrowRight } from "lucide-react"
import { useState } from "react"

export function PriceComparison() {
  return (
    <section className="container px-4 mx-auto py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Traditional vs. Unit Price Shopping</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Side-by-side comparison showing why unit pricing reveals better value.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border shadow-2xl">
        <div className="grid md:grid-cols-2 divide-x divide-border/50">
          {/* Before - Traditional Shopping */}
          <div className="bg-muted/20 p-8 relative">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="border-border text-muted-foreground">
                <X className="h-3 w-3 mr-1" />
                Traditional
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold mb-6 mt-8">Total Price Focus</h3>
            
            <div className="space-y-4">
              <Card className="bg-background/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">2TB SSD</p>
                      <p className="text-xs text-muted-foreground">Brand A</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-500">$179.99</p>
                      <Badge variant="secondary" className="mt-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Cheapest!
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Hidden: $89.99/TB</p>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/50 opacity-60">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">4TB SSD</p>
                      <p className="text-xs text-muted-foreground">Brand B</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$299.99</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Hidden: $74.99/TB</p>
                </CardContent>
              </Card>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p>Missing the better value option</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p>Paying 20% more per TB</p>
                </div>
              </div>
            </div>
          </div>

          {/* After - Smart Shopping with BestPrices */}
          <div className="bg-linear-to-br from-primary/5 to-background p-8 relative">
            <div className="absolute top-4 right-4">
              <Badge className="bg-linear-to-r from-primary to-purple-600 border-0">
                <Check className="h-3 w-3 mr-1" />
                Smart Way
              </Badge>
            </div>
            
            <h3 className="text-xl font-bold mb-6 mt-8">BestPrices Unit Shopping</h3>
            
            <div className="space-y-4">
              <Card className="bg-background/50 border-border/50 opacity-60">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">2TB SSD</p>
                      <p className="text-xs text-muted-foreground">Brand A</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$179.99</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-red-500">$89.99/TB</p>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-primary/30 ring-2 ring-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">4TB SSD</p>
                      <p className="text-xs text-muted-foreground">Brand B</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$299.99</p>
                      <Badge className="mt-1 bg-primary/10 text-primary border-primary/20">
                        Best Value
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-primary">$74.99/TB ⭐</p>
                </CardContent>
              </Card>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="font-medium">Found the best unit value</p>
                </div>
                <div className="flex items-start gap-2 text-sm mt-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="font-medium">Saving 20% per TB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-friendly summary */}
        <div className="bg-linear-to-r from-primary/10 to-purple-500/10 p-6 border-t border-primary/20 md:hidden">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <span>Traditional Shopping</span>
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-primary">Smart Shopping</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-lg font-semibold text-primary">
          BestPrices automatically shows unit prices so you never overpay again.
        </p>
      </div>
    </section>
  )
}
