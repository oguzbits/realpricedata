"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, TrendingUp, Package } from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

interface Product {
  category: string
  cheaperOption: {
    name: string
    totalPrice: number
    unitPrice: number
    quantity: number
    unit: string
  }
  betterOption: {
    name: string
    totalPrice: number
    unitPrice: number
    quantity: number
    unit: string
  }
}

const products: Record<string, Product> = {
  storage: {
    category: "Storage",
    cheaperOption: {
      name: "2TB SSD",
      totalPrice: 179.99,
      unitPrice: 89.99,
      quantity: 2,
      unit: "TB"
    },
    betterOption: {
      name: "4TB SSD",
      totalPrice: 299.99,
      unitPrice: 74.99,
      quantity: 4,
      unit: "TB"
    }
  },
  protein: {
    category: "Protein Powder",
    cheaperOption: {
      name: "2kg Whey",
      totalPrice: 39.99,
      unitPrice: 19.99,
      quantity: 2,
      unit: "kg"
    },
    betterOption: {
      name: "5kg Whey",
      totalPrice: 79.99,
      unitPrice: 15.99,
      quantity: 5,
      unit: "kg"
    }
  },
  detergent: {
    category: "Laundry Detergent",
    cheaperOption: {
      name: "50 Load Pack",
      totalPrice: 14.99,
      unitPrice: 0.30,
      quantity: 50,
      unit: "loads"
    },
    betterOption: {
      name: "150 Load Pack",
      totalPrice: 34.99,
      unitPrice: 0.23,
      quantity: 150,
      unit: "loads"
    }
  }
}

export function SavingsCalculator() {
  const [selectedProduct, setSelectedProduct] = useState("storage")
  const product = products[selectedProduct]

  const calculateYearlySavings = () => {
    const purchases = 2 // Assume buying twice per year
    const cheaperYearly = product.cheaperOption.totalPrice * purchases
    const betterYearly = (product.betterOption.totalPrice / product.betterOption.quantity) * product.cheaperOption.quantity * purchases
    return (cheaperYearly - betterYearly).toFixed(2)
  }

  const chartData = [
    {
      name: "Cheaper Total",
      value: product.cheaperOption.totalPrice,
      unitPrice: product.cheaperOption.unitPrice,
      type: "cheaper"
    },
    {
      name: "Better Value",
      value: product.betterOption.totalPrice,
      unitPrice: product.betterOption.unitPrice,
      type: "better"
    }
  ]

  return (
    <section className="container px-4 mx-auto py-12">
      <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-background/95 to-background/50 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50" />
        
        <div className="p-8 md:p-12 relative z-10">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">
              <Calculator className="h-3 w-3 mr-1" />
              Interactive Calculator
            </Badge>
            <h2 className="text-3xl font-bold mb-4">See Your Potential Savings</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Compare the cheapest total price vs. the best unit price. Small differences add up to big savings.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex justify-center">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-[280px] h-12 border-primary/20 bg-background/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="storage">💾 Storage (SSD/HDD)</SelectItem>
                  <SelectItem value="protein">🏋️ Protein Powder</SelectItem>
                  <SelectItem value="detergent">🧺 Laundry Detergent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Cheaper Option */}
              <Card className="relative overflow-hidden bg-card/50 border-red-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Cheaper Total Price</p>
                      <h3 className="text-lg font-semibold">{product.cheaperOption.name}</h3>
                    </div>
                    <Badge variant="outline" className="border-red-500/30 text-red-500">
                      Not best value
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Total Price:</span>
                      <span className="text-2xl font-bold">${product.cheaperOption.totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Unit Price:</span>
                      <span className="text-xl font-bold text-red-500">
                        ${product.cheaperOption.unitPrice}/{product.cheaperOption.unit.slice(0, -1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span>{product.cheaperOption.quantity} {product.cheaperOption.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Better Option */}
              <Card className="relative overflow-hidden bg-card/50 border-emerald-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Best Unit Price</p>
                      <h3 className="text-lg font-semibold">{product.betterOption.name}</h3>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Total Price:</span>
                      <span className="text-2xl font-bold">${product.betterOption.totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Unit Price:</span>
                      <span className="text-xl font-bold text-emerald-500">
                        ${product.betterOption.unitPrice}/{product.betterOption.unit.slice(0, -1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span>{product.betterOption.quantity} {product.betterOption.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Savings Summary */}
            <Card className="bg-linear-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Projected Yearly Savings</p>
                      <p className="text-xs text-muted-foreground">(Based on 2 purchases/year)</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-4xl font-bold text-primary">${calculateYearlySavings()}</p>
                    <p className="text-sm text-emerald-500 font-medium">
                      {(((product.cheaperOption.unitPrice - product.betterOption.unitPrice) / product.cheaperOption.unitPrice) * 100).toFixed(0)}% better value per unit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
