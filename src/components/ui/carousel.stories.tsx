import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Card, CardContent } from './card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'

const meta = {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Carousel>

export default meta

type Story = StoryObj<typeof meta>

const slides = Array.from({ length: 5 }, (_, i) => i + 1)

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="font-semibold text-4xl">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const MultipleSlides: Story = {
  render: () => (
    <Carousel opts={{ align: 'start' }} className="w-full max-w-sm">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide} className="basis-1/3">
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="font-semibold text-2xl">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Carousel orientation="vertical" className="w-full max-w-xs">
      <CarouselContent className="h-48">
        {slides.map((slide) => (
          <CarouselItem key={slide}>
            <Card>
              <CardContent className="flex h-40 items-center justify-center p-6">
                <span className="font-semibold text-3xl">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

/**
 * `viewportClassName` styles embla's viewport rather than the track: the
 * Carousel block's stack deck sets `overflow-visible` there so the boards
 * either side stay in view past the column.
 */
export const VisibleOverflow: Story = {
  render: () => (
    <Carousel opts={{ align: 'center' }} className="w-full max-w-xs">
      <CarouselContent viewportClassName="overflow-visible">
        {slides.map((slide) => (
          <CarouselItem key={slide} className="basis-4/5">
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="font-semibold text-4xl">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

/** Arrow keys step the rail while focus is inside it. */
export const Keyboard: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const previous = canvas.getByRole('button', { name: 'Previous slide' })
    await expect(previous).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }))
    await waitFor(() => expect(previous).toBeEnabled())
    previous.focus()
    await userEvent.keyboard('{ArrowLeft}')
    await waitFor(() => expect(previous).toBeDisabled())
  },
}
