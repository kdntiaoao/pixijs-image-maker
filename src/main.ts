import { Application, Sprite, Assets } from 'pixi.js'
import cupImage from '@/assets/images/cup.png'
import doveImage from '@/assets/images/dove.png'
import './style.css'

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new Application({
  view: document.querySelector('#canvas') as HTMLCanvasElement,
  width: 400,
  height: 300,
  // autoDensity: true,
  // resizeTo: window,
  // powerPreference: 'high-performance',
  backgroundColor: 0x1099bb,
})

const texture = await Assets.load(cupImage)

const cup = new Sprite(texture)
const cupAspectRatio = cup.width / cup.height

cup.width = 100
cup.height = cup.width / cupAspectRatio

cup.x = app.renderer.width / 2
cup.y = app.renderer.height / 2

cup.anchor.x = 0.5
cup.anchor.y = 0.5

const doveTexture = await Assets.load(doveImage)

const dove = new Sprite(doveTexture)
const doveAspectRatio = dove.width / dove.height

dove.width = 100
dove.height = dove.width / doveAspectRatio

dove.x = app.renderer.width / 4
dove.y = app.renderer.height / 4

dove.anchor.x = 0.5
dove.anchor.y = 0.5

app.stage.addChild(cup, dove)

const animate = (deltaTime: number) => {
  cup.rotation += deltaTime / 100
  dove.rotation -= deltaTime / 100
}

app.ticker.add(animate)

// app.ticker.remove(animate)
