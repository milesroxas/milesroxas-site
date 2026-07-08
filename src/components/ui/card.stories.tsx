import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A short supporting description for the card.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Card content goes here. Compose header, content, and footer as needed.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Confirm</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Get in touch</CardTitle>
        <CardDescription>Send a message and I will get back to you.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-form-name">Name</Label>
          <Input id="card-form-name" placeholder="Jane Doe" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-form-email">Email</Label>
          <Input id="card-form-email" placeholder="jane@example.com" type="email" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Send</Button>
      </CardFooter>
    </Card>
  ),
}
