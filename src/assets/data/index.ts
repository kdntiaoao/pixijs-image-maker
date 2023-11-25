import dogImage from '@/assets/images/dog.png'
import cherryBlossomImage from '@/assets/images/cherry-blossom.png'
import cupImage from '@/assets/images/cup.png'
import doveImage from '@/assets/images/dove.png'
import kettleImage from '@/assets/images/kettle.png'
import potImage from '@/assets/images/pot.png'
import bg01Image from '@/assets/images/bg01.jpg'
import bg02Image from '@/assets/images/bg02.jpg'
import bg03Image from '@/assets/images/bg03.jpg'

export const OBJECT_IMAGES = {
  img01: { img: dogImage, alt: 'dog' },
  img02: { img: cherryBlossomImage, alt: 'cherry-blossom' },
  img03: { img: cupImage, alt: 'cup' },
  img04: { img: doveImage, alt: 'dove' },
  img05: { img: kettleImage, alt: 'kettle' },
  img06: { img: potImage, alt: 'pot' },
} as const

export const BG_IMAGES = {
  bg01: bg01Image,
  bg02: bg02Image,
  bg03: bg03Image,
} as const
