import styles from '../styles/home.module.css'
import { cn } from '@/utilities/ui'

export default function HomeHero() {
  const experienceText = [
    'Co-Founder',
    'Creative Director',
    'Web Designer',
    'Brand Designer',
    'Product Design',
    'Design Engineer',
  ]

  const skillsText = [
    'Brand Identity Development',
    'Visual Identity Design',
    'Web Design',
    'Web Development',
    'Product Stategy',
    'Product Design',
    'Design Engineer',
    '3D Modeling & Rendering',
  ]

  return (
    <section className="relative w-full overflow-hidden">
      {/* Skills text behind (lower z-index, starts at 25vh) */}
      <div className="absolute top-[40vh] z-0 w-full">
        <div className={cn(styles['marquee-top'], 'flex flex-row gap-12 font-mono')}>
          {[...skillsText, ...skillsText].map((text, index) => (
            <div key={index} className={styles.marqueeItem}>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Video */}
      <div className="relative z-10 flex justify-center py-24">
        <video
          className="w-[30vh] rounded-sm object-cover"
          src="/media/intro-test.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

      {/* Experience text in front (higher z-index, slightly below the skills text) */}
      <div className="absolute top-[50vh] z-20 w-full">
        <div className={cn(styles.marquee, 'flex flex-row items-center gap-12 font-mono')}>
          {[...experienceText, ...experienceText].map((text, index) => (
            <div key={index} className={styles.marqueeItem}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
