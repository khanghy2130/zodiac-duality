import _p5_ from "p5"

import Render from "./Render"
import Gameplay from "./Gameplay"

import createButtons from "./createButtons"
import { allLanguages, Language, Translation, translations } from "./locales"
import { GameState } from "../logic"

export default class GameClient {
  // rescaled mouse position (0 to 500 width)
  mx: number
  my: number
  touchCountdown: number
  isPressing: boolean
  translatedTexts: Translation

  constructor() {
    this.mx = 0
    this.my = 0
    this.touchCountdown = 0
    this.isPressing = false
    this.translatedTexts = translations["en"]

    const render = new Render(this)
    const gameplay = new Gameplay(this)

    let globalFont: _p5_.Font | undefined

    const sketch = (p5: _p5_) => {
      p5.preload = () => {
        render.sheet = p5.loadImage("/assets/sheet.webp")
        render.sheetEles = p5.loadImage("/assets/elementsSheet.webp")
        render.sheetAnimals = p5.loadImage("/assets/animalsSheet.webp")
        render.sheetAbilities = p5.loadImage("/assets/abilitySheet.webp")
        globalFont = p5.loadFont("/assets/font.ttf")
      }

      const getCanvasSize = () => {
        const HEIGHT_RATIO = 1.7
        const CANVAS_WIDTH = Math.min(
          window.innerWidth,
          window.innerHeight / HEIGHT_RATIO
        )
        return [CANVAS_WIDTH, CANVAS_WIDTH * HEIGHT_RATIO]
      }

      p5.windowResized = () => {
        const [w, h] = getCanvasSize()
        p5.resizeCanvas(w, h)
      }

      p5.setup = () => {
        const [w, h] = getCanvasSize()
        p5.createCanvas(
          w,
          h,
          p5.P2D,
          document.getElementById("game-canvas") as HTMLCanvasElement
        )

        // p5 configs
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.rectMode(p5.CENTER)
        p5.imageMode(p5.CENTER)
        p5.angleMode(p5.DEGREES)
        p5.strokeJoin(p5.ROUND)
        p5.frameRate(30)
        if (globalFont) p5.textFont(globalFont)

        // connect instances
        render.p5 = p5
        render.gameplay = gameplay
        gameplay.render = render

        createButtons(this, p5, gameplay, render)
        const game: GameState = {
          round: 1,
          players: [
            {
              id: ".",
              prevYinPts: 0,
              prevYangPts: 0,
              yinPts: 0,
              yangPts: 0,
              collection: [
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
              ],
            },
          ],
        }
        const yourPlayerId = "."

        gameplay.gs = game
        gameplay.myPlayerId = yourPlayerId
        gameplay.setViewingPlayer(yourPlayerId)

        gameplay.startScoringPhase()

        // set language
        const savedLang = localStorage.getItem("lang") as Language
        if (allLanguages.includes(savedLang))
          gameplay.gc.translatedTexts = translations[savedLang]
        // open language modal if haven't set before
        else gameplay.openLangModal()
      }

      p5.draw = () => {
        // rescale canvas and mouse position
        this.mx = (p5.mouseX * 500) / p5.width
        this.my = (p5.mouseY * 500) / p5.width
        p5.scale(p5.width / 500)

        this.touchCountdown-- // update

        p5.clear(0, 0, 0, 0)
        render.draw()
      }

      p5.touchStarted = () => {
        if (
          gameplay.shop.isOpened ||
          gameplay.wheelModalIsOpened ||
          gameplay.langModal.isOpened ||
          gameplay.inspect.isOpened
        )
          return
        this.isPressing = true
      }

      p5.touchEnded = () => {
        this.isPressing = false

        if (this.touchCountdown > 0) return
        else this.touchCountdown = 10
        render.click(p5)
      }

      // p5.keyPressed = () => {
      //   // start ending phase
      //   gameplay.phase = "ENDING"
      //   gameplay.endingControl.isOpened = true
      //   gameplay.endingControl.yyAP = 0
      //   gameplay.endingControl.increaseAP = 0
      //   gameplay.render.buttons.closeShop.ap = 0
      //   gameplay.render.endingRatingAPs = [0, 0, 0, 0]
      //   gameplay.render.prevRatingLetters = ["F", "F", "F", "F"]
      //   gameplay.render.buttons.shareImage.ap = 0
      // }
    }

    new _p5_(sketch)
  }
}
