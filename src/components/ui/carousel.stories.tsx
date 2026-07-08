import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card, CardContent } from './card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'

const meta = {
  title: 'UI/Carousel',
  component: Carousel,
  tags: ['autodocs'],
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

const slides = ['One', 'Two', 'Three', 'Four', 'Five']

export const Default: Story = {
  render: () => (
    <div className="px-12">
      <Carousel className="w-72">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-3xl">{slide}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}

export const MultipleSlides: Story = {
  render: () => (
    <div className="px-12">
      <Carousel className="w-md" opts={{ align: 'start' }}>
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem className="basis-1/3" key={slide}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-4">
                  <span className="font-semibold text-xl">{slide}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}
