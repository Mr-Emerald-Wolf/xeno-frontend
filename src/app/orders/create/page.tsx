'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"

export default function CreateOrderPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const orderData = {
      customerId: Number(session?.user?.id), // Use the customerId from session
      orderDate: formData.get('orderDate'),
      revenue: Number(formData.get('revenue')),
      cost: Number(formData.get('cost'))
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      router.push('/orders')
    } catch (err) {
      setError('An error occurred while creating the order. Please try again.')
      console.log(err);
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return <div>You need to be logged in to create an order.</div> // Handle case where session is not available
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Optionally, hide or pre-fill customerId */}
          <div className="space-y-2">
            <Label htmlFor="orderDate">Order Date</Label>
            <Input id="orderDate" name="orderDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="revenue">Revenue</Label>
            <Input id="revenue" name="revenue" type="number" step="0.01" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <Input id="cost" name="cost" type="number" step="0.01" required />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
