import type P5 from "p5"
import GameClient from "./GameClient"
import Gameplay from "./Gameplay"
import Button, { easeOutElastic } from "./Button"
import { Animal, Card, CARDS_TABLE, Ele } from "./cards"
import { Translation } from "./locales"
import { Collection, LogicPlayer } from "../logic"

interface Buttons {
  openShop: Button
  acceptCards: Button
  closeShop: Button
  rerollEle: Button
  rerollType: Button
  rerollYes: Button
  rerollNo: Button

  undo: Button
  ready: Button
  goBack: Button
  shareImage: Button
}

interface Flasher {
  x: number
  y: number
  ap: 0
}

export default class Render {
  gc: GameClient
  sheet!: P5.Image
  sheetEles!: P5.Image
  sheetAnimals!: P5.Image
  sheetAbilities!: P5.Image
  shareAssets!: {
    bgImage: P5.Image
    runeImage: P5.Image
  }
  p5!: P5
  gameplay!: Gameplay

  buttons!: Buttons

  flashers: Flasher[]

  dragHoveredPos: null | [number, number]

  animalsOrder: Animal[]
  elesOrder: Ele[]

  endingRatingAPs: number[]
  prevRatingLetters: string[]

  roundTextAP: number

  scoreSound: HTMLAudioElement
  clickingSound: HTMLAudioElement
  soundCountdown: number

  constructor(gameClient: GameClient) {
    this.gc = gameClient
    this.flashers = []
    this.dragHoveredPos = null
    this.roundTextAP = 0
    this.endingRatingAPs = [0, 0, 0, 0]
    this.prevRatingLetters = ["F", "F", "F", "F"]
    this.animalsOrder = [
      "RAT",
      "OX",
      "TIGER",
      "RABBIT",
      "DRAGON",
      "SNAKE",
      "HORSE",
      "GOAT",
      "MONKEY",
      "CHICKEN",
      "DOG",
      "PIG",
    ]
    this.elesOrder = ["WOOD", "FIRE", "EARTH", "METAL", "WATER", "FLUX"]
    this.scoreSound = new Audio("/assets/scoring.mp3")
    this.clickingSound = new Audio("/assets/click.mp3")
    this.soundCountdown = 0
  }

  playSound(s: HTMLAudioElement) {
    if (this.soundCountdown > 0) return // preventing playing sound rapidly
    this.soundCountdown = 3
    s.pause()
    s.currentTime = 0
    s.play()
  }

  getGridCenter(collection: Collection): [number, number] {
    // find max rows and cols
    let rows = 0,
      cols = 0
    for (let y = 3; y >= 0; y--) {
      for (let x = 3; x >= 0; x--) {
        // not empty?
        if (collection[y][x] !== null) {
          cols = Math.max(cols, y)
          rows = Math.max(rows, x)
        }
      }
    }
    return [rows, cols]
  }

  getPossiblePlacements(rows: number, cols: number): [number, number][] {
    const collection = this.gameplay.localDisplay.collection
    // check if no card placed then return only first slot
    if (rows === 0 && collection[0][0] === null) return [[0, 0]]
    const obj: { [key: string]: true } = {}
    const dirs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]

    // loop through all cards to get pps
    for (let y = 0; y < cols + 1; y++) {
      for (let x = 0; x < rows + 1; x++) {
        if (collection[y][x] === null) continue // no card here
        // add all empty adjs to obj
        for (let i = 0; i < dirs.length; i++) {
          const newX = x + dirs[i][0]
          const newY = y + dirs[i][1]
          // out of bound right-bottom? skip
          if (newX > 3 || newY > 3) continue

          // accepted conditions
          if (
            (newX === -1 && rows < 3) ||
            (newY === -1 && cols < 3) ||
            (newX > -1 && newY > -1 && collection[newY][newX] === null)
          ) {
            obj[`${newX},${newY}`] = true
          }
        }
      }
    }

    return Object.keys(obj).map((key) => {
      const arr = key.split(",")
      return [Number(arr[0]), Number(arr[1])]
    })
  }

  addFlasher(x: number, y: number) {
    this.flashers.push({ x, y, ap: 0 })
  }

  renderPlayers(p5: P5, playersState: LogicPlayer[]) {
    const gp = this.gameplay
    const isScoring = gp.phase === "SCORING"
    const sc = gp.scoringControl
    // render players
    const displayPoints: [number, number][] = playersState.map((p, index) => {
      // not scoring phase? show current
      if (!isScoring) return [p.yangPts, p.yinPts]

      // if already past this player? show current
      if (sc.playerIndex > index) return [p.yangPts, p.yinPts]
      // if is not at this player yet? show past
      if (sc.playerIndex < index) return [p.prevYangPts, p.prevYinPts]
      // is at this player? show past + sc total
      return [p.prevYangPts + sc.yangSum, p.prevYinPts + sc.yinSum]
    })
    p5.textSize(44)

    p5.noStroke()
    p5.fill(255)
    p5.rect(200, 60, 160, 60, 20, 0, 0, 0)
    p5.fill(30)
    p5.rect(360, 60, 160, 60, 0, 20, 0, 0)
    p5.text(displayPoints[0][0], 200, 55)
    p5.fill(255)
    p5.text(displayPoints[0][1], 360, 55)
    p5.textSize(36)

    // current scoring sums
    if (isScoring && sc.playerIndex === 0) {
      p5.fill(255)
      p5.rect(200, 120, 160, 60, 0, 0, 0, 20)
      p5.fill(30)
      p5.rect(360, 120, 160, 60, 0, 0, 20, 0)
      p5.text("+" + sc.yangSum, 200, 115)
      p5.fill(255)
      p5.text("+" + sc.yinSum, 360, 115)
    }

    // render preview sums
    if (!isScoring && gp.yieldPreview.isShown) {
      p5.fill(255)
      p5.rect(200, 120, 160, 60, 0, 0, 0, 20)
      p5.fill(30)
      p5.rect(360, 120, 160, 60, 0, 0, 20, 0)
      p5.text("+" + gp.yieldPreview.yangSum, 200, 115)
      p5.fill(255)
      p5.text("+" + gp.yieldPreview.yinSum, 360, 115)
    }

    p5.noStroke()
    this.renderYin(280, 60, 30)
    this.renderYang(280, 60, 30)
  }

  draw() {
    this.soundCountdown--
    const gp = this.gameplay
    if (!gp.gs) return
    const p5 = this.p5
    const buttons = this.buttons
    const tt = this.gc.translatedTexts
    const playersState = gp.gs.players
    const isNotScoring = gp.phase !== "SCORING"

    const viewingPlayerState = playersState[0]
    this.renderPlayers(p5, playersState)

    // render language menu button
    p5.noFill()
    p5.stroke(52, 183, 235)
    p5.strokeWeight(3)
    p5.circle(35, 50, 35)
    p5.ellipse(35, 50, 15, 35)
    p5.ellipse(35, 50, 35, 15)

    // render preview toggle
    p5.stroke(205, 133, 255)
    p5.beginShape()
    p5.vertex(52.5, 150)
    p5.bezierVertex(40, 140, 30, 140, 17.5, 150)
    p5.bezierVertex(30, 160, 40, 160, 52.5, 150)
    p5.endShape()
    if (!gp.yieldPreview.isShown) p5.line(17.5, 160, 52.5, 140)
    p5.fill(205, 133, 255)
    p5.noStroke()
    p5.circle(35, 150, 10)

    // render wheel modal button
    p5.noStroke()
    this.renderYang(35, 100, 17)
    this.renderYin(35, 100, 17)

    // render collection
    const ld = gp.localDisplay
    const [rows, cols] = this.getGridCenter(ld.collection)
    // update grid position
    ld.x += (92.5 + (3 - rows) * 52.5 - ld.x) * 0.2
    ld.y += (250 + (3 - cols) * 75 - ld.y) * 0.2
    const ldx = ld.x
    const ldy = ld.y

    // render self collection
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const cardId = ld.collection[y][x]
        if (cardId !== null) {
          const card = CARDS_TABLE[cardId]
          this.renderTransformCard(card, ldx + 105 * x, ldy + 140 * y, 1, 1)
        }
      }
    }
    // render preview if not during scoring
    if (isNotScoring && gp.yieldPreview.isShown) {
      const sumsList = gp.yieldPreview.sumsList
      p5.noStroke()
      p5.strokeWeight(4)
      p5.textSize(30)
      for (let i = 0; i < sumsList.length; i++) {
        const sumItem = sumsList[i]

        p5.fill(sumItem.isYin ? 30 : 255)
        const rx = ldx + 105 * sumItem.pos[0]
        const ry = ldy + 140 * sumItem.pos[1]
        p5.rect(rx, ry - 10, 60, 35, 5)
        p5.fill(sumItem.isYin ? 255 : 30)
        p5.text("+" + sumItem.sum, rx, ry - 15)
      }
    }

    // GET phase
    if (gp.phase === "GET") {
      const shop = gp.shop

      if (shop.isOpened) this.renderShop(p5, gp, tt)
      // shop closed?
      else {
        // render open shop button
        buttons.openShop.render(p5)
        if (shop.openBtnHintCountdown <= 0) {
          buttons.openShop.ap = 0
          shop.openBtnHintCountdown = 120
        } else shop.openBtnHintCountdown--

        // render hint arrow
        if (gp.gs!.round < 2) {
          p5.stroke(255)
          p5.strokeWeight(10)
          const arrowY = p5.cos(p5.frameCount * 8) * 20
          p5.line(250, 600 + arrowY, 250, 700 + arrowY)
          p5.line(270, 670 + arrowY, 250, 700 + arrowY)
          p5.line(230, 670 + arrowY, 250, 700 + arrowY)
        }
      }
    } else if (gp.phase === "PLAY") {
      this.dragHoveredPos = null
      const { mx, my, isPressing } = this.gc
      const lc1 = gp.localCards![0]
      const lc2 = gp.localCards![1]

      // is dragging? render pps
      if (lc1.isDragging || lc2.isDragging) {
        // make a list of possible placements
        const pps = this.getPossiblePlacements(rows, cols)
        p5.noFill()
        p5.stroke(240, 70, 60)
        p5.strokeWeight(3)
        for (let i = 0; i < pps.length; i++) {
          const [x, y] = pps[i]
          const centerX = ldx + 105 * x
          const centerY = ldy + 140 * y

          // check hover
          if (
            mx > centerX - 52.5 &&
            mx < centerX + 52.5 &&
            my > centerY - 70 &&
            my < centerY + 70
          ) {
            p5.rect(centerX, centerY, 105, 140, 10)
            this.dragHoveredPos = [x, y]
          } else p5.circle(centerX, centerY, 15)
        }
      }

      // not placed? render local card 1
      if (lc1.placedPos === null) {
        this.renderTransformCard(lc1.card, lc1.x, lc1.y, lc1.s, lc1.s)
        // check drag
        if (isPressing && !lc2.isDragging) {
          if (
            mx > lc1.x - 78 &&
            mx < lc1.x + 78 &&
            my > lc1.y - 105 &&
            my < lc1.y + 105
          ) {
            lc1.isDragging = true
          }
        }
        if (lc1.isDragging) {
          // follow cursor
          lc1.s = Math.max(1, lc1.s - 0.1)
          lc1.x += (mx - lc1.x) * 0.4
          lc1.y += (my - lc1.y) * 0.4
        } else {
          // return to hand
          lc1.s = Math.min(1.5, lc1.s + 0.1)
          lc1.x += (140 - lc1.x) * 0.4
          lc1.y += (800 - lc1.y) * 0.4
        }
      }

      // not placed? render local card 2
      if (lc2.placedPos === null) {
        this.renderTransformCard(lc2.card, lc2.x, lc2.y, lc2.s, lc2.s)
        // check drag
        if (isPressing && !lc1.isDragging) {
          if (
            mx > lc2.x - 78 &&
            mx < lc2.x + 78 &&
            my > lc2.y - 105 &&
            my < lc2.y + 105
          ) {
            lc2.isDragging = true
          }
        }
        if (lc2.isDragging) {
          // follow cursor
          lc2.s = Math.max(1, lc2.s - 0.1)
          lc2.x += (mx - lc2.x) * 0.4
          lc2.y += (my - lc2.y) * 0.4
        } else {
          // return to hand
          lc2.s = Math.min(1.5, lc2.s + 0.1)
          lc2.x += (360 - lc2.x) * 0.4
          lc2.y += (800 - lc2.y) * 0.4
        }
      }

      // both cards are placed?
      if (lc1.placedPos !== null && lc2.placedPos !== null) {
        this.buttons.undo.render(p5)
        this.buttons.ready.render(p5)
      }
      // not dragging & none placed yet & is round 1?
      else if (
        gp.gs.round === 1 &&
        !lc1.isDragging &&
        !lc2.isDragging &&
        lc1.placedPos === null &&
        lc2.placedPos === null
      ) {
        // render hint drag arrow
        p5.push()
        const ap = p5.cos(p5.frameCount * 5)
        p5.translate(320 + 30 * ap, 660 + 80 * ap)
        p5.rotate(-22)
        p5.stroke(0)
        p5.strokeWeight(18)
        p5.line(0, 0, 0, -80)
        p5.line(15, -60, 0, -80)
        p5.line(-15, -60, 0, -80)
        p5.stroke(255)
        p5.strokeWeight(8)
        p5.line(0, 0, 0, -80)
        p5.line(15, -60, 0, -80)
        p5.line(-15, -60, 0, -80)
        p5.pop()
      }
    }

    // render flashers
    p5.noStroke()
    for (let i = this.flashers.length - 1; i >= 0; i--) {
      const f = this.flashers[i]
      p5.fill(240, 70, 60, (1 - f.ap) * 220)
      p5.rect(ldx + 105 * f.x, ldy + 140 * f.y, 105, 140, 10)
      f.ap += 0.1
      if (f.ap >= 1) this.flashers.splice(i, 1) // remove flasher
    }

    // scoring phase: update & render card sums
    if (!isNotScoring) {
      const sc = gp.scoringControl
      if (sc.countdown-- < 0) {
        // go to next player?
        if (sc.cardIndex === 999) gp.nextPlayerToScore()
        // still at a card?
        else if (sc.cardIndex < sc.scoresList.length) {
          const scoringCard = sc.scoresList[sc.cardIndex]
          // still at a trigger?
          if (sc.triggerIndex < scoringCard.triggers.length) {
            const triggerPos = scoringCard.triggers[sc.triggerIndex]
            this.addFlasher(triggerPos[0], triggerPos[1])
            this.playSound(this.scoreSound)
            scoringCard.sum += scoringCard.adder
            if (scoringCard.isYin) sc.yinSum += scoringCard.adder
            else sc.yangSum += scoringCard.adder

            sc.ap = 0
            sc.countdown = 7 // delay before next trigger
            sc.triggerIndex++
          } else {
            sc.triggerIndex = 0 // reset trigger index
            sc.cardIndex++
            // add delay if next card exists and has any trigger
            if (
              sc.cardIndex < sc.scoresList.length &&
              sc.scoresList[sc.cardIndex].triggers.length > 0
            ) {
              sc.countdown = 10 // delay before next card
            }
          }
        }
        // done with all card? set up delay before next player
        else {
          sc.countdown = 35 // delay before next player
          sc.cardIndex = 999
        }
      }

      // render nums
      sc.ap = Math.min(1, sc.ap + 0.02)
      p5.noStroke()
      p5.strokeWeight(4)
      p5.textSize(30)
      for (let i = 0; i < sc.scoresList.length; i++) {
        const scoringCard = sc.scoresList[i]

        // break if haven't gotten to this card yet
        if (sc.cardIndex < i) break

        // skip if sum is 0
        if (scoringCard.sum === 0) continue

        let scaleFactor = 1
        // this card is currently being scored? apply ap to scaleFactor
        if (i === sc.cardIndex) {
          if (sc.ap < 0.3) {
            scaleFactor = (1 / 0.3) * sc.ap
          } else if (sc.ap < 0.9) {
            // nothing here
          } else {
            scaleFactor = (1 / 0.1) * (0.1 - (sc.ap - 0.9))
          }
        }
        p5.push()
        p5.translate(
          ldx + 105 * scoringCard.pos[0],
          ldy + 140 * scoringCard.pos[1]
        )
        p5.scale(sc.ap < 0.3 ? this.easeOutElastic(scaleFactor) : scaleFactor)
        if (i === sc.cardIndex) p5.stroke(240, 70, 60)
        p5.fill(scoringCard.isYin ? 30 : 255)
        p5.rect(0, -10, 60, 35, 5)
        p5.noStroke()
        p5.fill(scoringCard.isYin ? 255 : 30)
        p5.text("+" + scoringCard.sum, 0, -15)
        p5.pop()
      }
    }
    // ending phase
    else if (gp.phase === "ENDING") {
      const ec = gp.endingControl
      if (ec.isOpened) {
        // render bg
        p5.noStroke()
        const h = (p5.height / p5.width) * 500
        p5.fill(0, 220)
        p5.rect(250, h / 2, 500, h)

        if (ec.increaseAP === 1) this.buttons.closeShop.render(p5)

        // render players
        const xChange = (1 - Math.pow(1 - ec.yyAP, 5)) * 100
        for (let i = 0; i < playersState.length; i++) {
          const p = playersState[i]
          const y = 190 + i * 180
          p5.noStroke()

          // yy
          const yangX = 170 + xChange
          const yinX = 370 - xChange
          this.renderYang(yangX, y, 40)
          this.renderYin(yinX, y, 40)

          const actualPoints = Math.min(p.yangPts, p.yinPts) // points here
          const unflooredIF =
            Math.sqrt(1 - Math.pow(ec.increaseAP - 1, 2)) * actualPoints
          const increaseFactor = Math.floor(unflooredIF)
          p5.textSize(26)
          p5.fill(255)
          p5.rect(yangX - 30, y + 70, 60, 30)
          p5.fill(30)
          // yang points
          p5.text(p.yangPts - increaseFactor, yangX - 30, y + 67)

          p5.fill(30)
          p5.rect(yinX + 30, y + 70, 60, 30)
          p5.fill(255)
          // yin points
          p5.text(p.yinPts - increaseFactor, yinX + 30, y + 67)

          if (increaseFactor > 0) {
            // actual points
            p5.textSize(32)
            p5.stroke(0)
            p5.strokeWeight(6)
            p5.fill(65, 200, 60)
            p5.text(increaseFactor, 270, y - 4)

            // letter rating
            let letter = "F"
            let percentage = 0
            if (unflooredIF < 70) {
              percentage = unflooredIF / 70
              letter = "F"
              p5.stroke(150)
            } else if (unflooredIF < 80) {
              percentage = (unflooredIF - 70) / 10
              letter = "D"
              p5.stroke(65, 200, 60)
            } else if (unflooredIF < 90) {
              percentage = (unflooredIF - 80) / 10
              letter = "C"
              p5.stroke(23, 160, 227)
            } else if (unflooredIF < 100) {
              percentage = (unflooredIF - 90) / 10
              letter = "B"
              p5.stroke(237, 190, 17)
            } else if (unflooredIF < 110) {
              percentage = (unflooredIF - 100) / 10
              letter = "A"
              p5.stroke(240, 70, 60)
            } else {
              percentage = 1
              letter = "S"
              p5.stroke(255)
            }
            // trigger new letter effect
            if (this.prevRatingLetters[i] !== letter) {
              this.prevRatingLetters[i] = letter
              this.endingRatingAPs[i] = 0
              this.playSound(this.scoreSound)
            }
            this.endingRatingAPs[i] = Math.min(1, this.endingRatingAPs[i] + 0.1)
            p5.textSize(80 - 30 * this.endingRatingAPs[i])
            p5.fill(0)
            p5.strokeWeight(15)
            p5.text(letter, 420, y)
            p5.strokeWeight(4)
            p5.noFill()
            p5.arc(420, y + 6, 100, 100, 0, percentage * 360)
          }
        }
        // update ap
        if (ec.yyAP < 1) ec.yyAP = Math.min(1, ec.yyAP + 0.02)
        else if (ec.increaseAP < 1) {
          ec.increaseAP = Math.min(1, ec.increaseAP + 0.007)
          // trigger game over (no longer needed)
        }
      } else {
        this.buttons.shareImage.render(p5)
      }
    }

    // render langModal
    if (gp.langModal.isOpened) {
      // modal bg
      p5.noStroke()
      p5.fill(0, 200)
      const h = (p5.height / p5.width) * 500
      p5.rect(250, h / 2, 500, h)
      gp.langModal.optionButtons.forEach((b) => b.render(p5))
    }
    // render round text
    else if (this.roundTextAP < 1) {
      const roundTextAP = this.roundTextAP
      this.roundTextAP = Math.min(1, roundTextAP + 0.02)
      const prgFactor =
        roundTextAP < 0.2
          ? p5.map(roundTextAP, 0, 0.2, 0, 1)
          : roundTextAP > 0.8
          ? p5.map(roundTextAP, 0.8, 1, 1, 0)
          : 1
      p5.noStroke()
      p5.textSize(40)
      p5.fill(0, 0, 0, prgFactor * 255)
      p5.rect(250, 440, 500, prgFactor * 80)
      p5.fill(255, 255, 255, prgFactor * 255)
      p5.text(tt.short.round + " " + gp.gs.round, 250, 435)
    }

    // wheel modal
    if (gp.wheelModalIsOpened) {
      // modal bg
      p5.noStroke()
      p5.fill(0, 200)
      const h = (p5.height / p5.width) * 500
      p5.rect(250, h / 2, 500, h)

      // wheel background
      p5.noStroke()
      p5.fill(220)
      p5.circle(250, 350, 490)
      p5.fill(60)
      for (let i = 0; i < 12; i += 2) {
        p5.arc(250, 350, 490, 490, i * 30, i * 30 + 30)
      }

      // yy
      this.renderYang(250, 350, 80)
      this.renderYin(250, 350, 80)

      // animals
      const elesOrder = this.elesOrder
      for (let i = 0; i < 6; i++) {
        const deg = i * 30 - 75
        this.renderAnimalIcon(
          p5,
          this.animalsOrder[i],
          p5.cos(deg) * 135 + 250,
          p5.sin(deg) * 135 + 350,
          80
        )

        this.renderEleIcon(
          p5,
          elesOrder[i],
          p5.cos(deg - 8) * 225 + 250,
          p5.sin(deg - 8) * 225 + 350,
          46
        )

        this.renderEleIcon(
          p5,
          elesOrder[(i + 2) % 6],
          p5.cos(deg - 3) * 195 + 250,
          p5.sin(deg - 3) * 195 + 350,
          46
        )

        this.renderEleIcon(
          p5,
          elesOrder[(i + 1) % 6],
          p5.cos(deg + 3) * 225 + 250,
          p5.sin(deg + 3) * 225 + 350,
          46
        )

        this.renderEleIcon(
          p5,
          elesOrder[(i + 3) % 6],
          p5.cos(deg + 8) * 195 + 250,
          p5.sin(deg + 8) * 195 + 350,
          46
        )
      }
      for (let i = 6; i < 12; i++) {
        const deg = i * 30 - 75
        this.renderAnimalIcon(
          p5,
          this.animalsOrder[i],
          p5.cos(deg) * 135 + 250,
          p5.sin(deg) * 135 + 350,
          80
        )

        const _i = 11 - i
        this.renderEleIcon(
          p5,
          elesOrder[(_i + 3) % 6],
          p5.cos(deg - 8) * 195 + 250,
          p5.sin(deg - 8) * 195 + 350,
          46
        )

        this.renderEleIcon(
          p5,
          elesOrder[(_i + 1) % 6],
          p5.cos(deg - 3) * 225 + 250,
          p5.sin(deg - 3) * 225 + 350,
          46
        )

        this.renderEleIcon(
          p5,
          elesOrder[(_i + 2) % 6],
          p5.cos(deg + 3) * 195 + 250,
          p5.sin(deg + 3) * 195 + 350,
          46
        )

        this.renderEleIcon(
          p5,
          elesOrder[_i],
          p5.cos(deg + 8) * 225 + 250,
          p5.sin(deg + 8) * 225 + 350,
          46
        )
      }

      // scoring guide
      p5.noStroke()
      this.renderYang(100, 650, 40)
      this.renderYin(400, 650, 40)
      p5.textSize(30)
      p5.fill(255)
      p5.rect(90, 720, 70, 40)
      p5.fill(30)
      p5.text(100, 90, 716)
      p5.fill(30)
      p5.rect(410, 720, 70, 40)
      p5.fill(255)
      p5.text(100, 410, 716)

      this.renderYang(250, 760, 50)
      this.renderYin(250, 760, 50)
      p5.textSize(48)
      p5.fill(65, 200, 60)
      p5.stroke(30)
      p5.strokeWeight(10)
      p5.text(100, 250, 670)

      p5.stroke(255)
      p5.strokeWeight(5)
      p5.line(100, 770, 160, 770)
      p5.line(150, 760, 160, 770)
      p5.line(150, 780, 160, 770)

      p5.line(400, 770, 340, 770)
      p5.line(350, 760, 340, 770)
      p5.line(350, 780, 340, 770)
    }

    // card inspection
    if (gp.inspect.isOpened) {
      const ip = gp.inspect
      const { card, ap, ox, oy, os } = ip

      // update opening and closing animation
      if (ip.isOpening) ip.ap = Math.min(1, ip.ap + 0.15)
      else {
        ip.ap = Math.max(0, ip.ap - 0.15)
        if (ip.ap === 0) {
          ip.isOpened = false // done closing
        }
      }

      // render bg
      p5.noStroke()
      const h = (p5.height / p5.width) * 500
      p5.fill(0, 220 * ap)
      p5.rect(250, h / 2, 500, h)

      // render card
      this.renderTransformCard(
        card,
        ox + (250 - ox) * ap,
        oy + (470 - oy) * ap,
        os + (4 - os) * ap,
        os + (4 - os) * ap
      )

      // render full desc
      p5.noStroke()
      p5.fill(255)
      p5.textSize(28)
      const yyType = card.isYin ? tt.short.yin : tt.short.yang
      p5.text(
        `+${card.ability.num} ${yyType} ${tt.carddesc[card.id]}`,
        250,
        -100 + 210 * ap,
        450,
        500
      )

      // render y/y type label
      const yyLabelX = 600 - 350 * ap
      p5.textSize(40)
      p5.text(`${yyType}`, yyLabelX, 800)
      p5.stroke(255)
      p5.strokeWeight(5)
      p5.line(yyLabelX, 770, yyLabelX, 710)
      p5.line(yyLabelX + 15, 730, yyLabelX, 710)
      p5.line(yyLabelX - 15, 730, yyLabelX, 710)

      p5.strokeWeight(1)
      if (card.isYin) {
        p5.stroke(255)
        this.renderYin(yyLabelX + 65, 750, 25)
      } else {
        p5.stroke(0)
        this.renderYang(yyLabelX + 65, 750, 25)
      }
    }
  }

  easeOutElastic(x: number) {
    const c4 = (2 * Math.PI) / 3
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
  }

  renderShop(p5: P5, gp: Gameplay, tt: Translation) {
    const shop = gp.shop
    const buttons = this.buttons

    // shop modal bg
    p5.noStroke()
    p5.fill(0, 200)
    const h = (p5.height / p5.width) * 500
    p5.rect(250, h / 2, 500, h)

    const holder1 = shop.cardHolders![0]
    const holder2 = shop.cardHolders![1]
    const isFlipping = holder2.flips > 0 || holder2.ap > 0.5
    // update flipping
    if (isFlipping) {
      holder1.ap -= holder1.flips * 0.02 + 0.04
      if (holder1.flips > 0) {
        if (holder1.ap <= 0) {
          holder1.flips--
          holder1.ap = 1 + holder1.ap // spillover
          // set random card or real card
          if (holder1.flips > 0) {
            // make sure not repeating the same card
            const prevCard = holder1.card
            while (
              holder1.card === prevCard ||
              (holder1.flips === 1 && shop.availableCards![0] === holder1.card)
            ) {
              holder1.card =
                shop.flipYangPool[
                  Math.floor(shop.flipYangPool.length * Math.random())
                ]
            }
          } else holder1.card = shop.availableCards![0]
        }
      } else {
        // flips is at 0, showing real card, keep at 0.5
        holder1.ap = Math.max(holder1.ap, 0.5)
      }

      holder2.ap -= holder2.flips * 0.02 + 0.04
      if (holder2.flips > 0) {
        if (holder2.ap <= 0) {
          holder2.flips--
          holder2.ap = 1 + holder2.ap // spillover
          // set random card or real card
          if (holder2.flips > 0) {
            // make sure not repeating the same card
            const prevCard = holder2.card
            while (
              holder2.card === prevCard ||
              (holder2.flips === 1 && shop.availableCards![1] === holder2.card)
            ) {
              holder2.card =
                shop.flipYinPool[
                  Math.floor(shop.flipYinPool.length * Math.random())
                ]
            }
          } else holder2.card = shop.availableCards![1]
        }
      } else {
        // flips is at 0 now, check if AP is at 0.5
        if (holder2.ap <= 0.5) {
          holder2.ap = 0.5
          this.playSound(this.scoreSound)
          shop.revealBounceAP = 0
        }
      }
    }

    // update holdersY
    if (shop.holdersY.ap < 1) {
      shop.holdersY.ap = Math.min(1, shop.holdersY.ap + 0.07)
    }
    // draw holders
    const realY = p5.map(
      p5.sin(shop.holdersY.ap * 90),
      0,
      1,
      shop.holdersY.start,
      shop.holdersY.end
    )
    // update revealBounceAP
    if (shop.revealBounceAP < 1) {
      shop.revealBounceAP = Math.min(shop.revealBounceAP + 0.022, 1)
    }
    if (shop.revealBounceAP < 0.08) shop.revealBounceAP = 0.08
    let scaleFactor =
      shop.revealBounceAP < 1 ? easeOutElastic(shop.revealBounceAP, p5) : 1
    scaleFactor *= 0.4 // animated range
    const xScale = 0.6 + scaleFactor
    const yScale = 1.4 - scaleFactor

    const sx1 = (holder1.ap < 0.5 ? holder1.ap : 1 - holder1.ap) * 2
    const sx2 = (holder2.ap < 0.5 ? holder2.ap : 1 - holder2.ap) * 2
    this.renderTransformCard(
      holder1.card,
      140,
      realY,
      sx1 * 1.5 * xScale,
      1.5 * yScale
    )
    this.renderTransformCard(
      holder2.card,
      360,
      realY,
      sx2 * 1.5 * xScale,
      1.5 * yScale
    )

    // render other than holders if they are not flipping
    if (!isFlipping) {
      // render condition based on menuType
      if (shop.menuType === "DEFAULT") {
        // render buttons
        buttons.acceptCards.render(p5)

        if (!shop.hasRerolled) {
          buttons.rerollEle.render(p5)
          buttons.rerollType.render(p5)
          buttons.closeShop.render(p5)
        }

        // render inspect hint
        p5.noStroke()
        p5.fill(255)
        p5.textSize(26)
        p5.text(tt.short.clicktoinspect, 140, 80)
        p5.stroke(255)
        p5.strokeWeight(5)
        p5.line(140, 120, 140, 170)
        p5.line(140, 170, 130, 155)
        p5.line(140, 170, 150, 155)
      }
      // reroll menu
      else {
        // render changing arrows
        p5.stroke(240)
        p5.strokeWeight(6)
        p5.line(140, 280, 140, 350)
        p5.line(140, 350, 125, 330)
        p5.line(140, 350, 155, 330)

        p5.line(360, 280, 360, 350)
        p5.line(360, 350, 345, 330)
        p5.line(360, 350, 375, 330)

        const rp = shop.rerollPreviews
        // update changing previews
        if (rp.countdown-- < 0) {
          rp.countdown = 40
          rp.showingIndex++
          if (rp.showingIndex >= rp.yangPool.length) rp.showingIndex = 0
        }
        // render preview cards
        this.renderTransformCard(
          rp.yangPool[rp.showingIndex],
          140,
          shop.holdersY.AFTER_REROLL,
          1.5,
          1.5
        )
        this.renderTransformCard(
          rp.yinPool[rp.showingIndex],
          360,
          shop.holdersY.AFTER_REROLL,
          1.5,
          1.5
        )

        p5.stroke(0)
        p5.strokeWeight(5)
        p5.textSize(28)
        p5.fill(255)
        p5.text(
          shop.menuType === "CHANGE_ELEMENT"
            ? tt.short.changeeleques
            : tt.short.changetypeques,
          250,
          660
        )

        // render button
        buttons.rerollYes.render(p5)
        buttons.rerollNo.render(p5)
      }
    }
  }

  renderMiniAbility(p5: P5, card: Card) {
    const ability = card.ability
    p5.noStroke()
    p5.textSize(16)
    const numY = 48
    if (card.isYin) {
      p5.fill(30)
      p5.rect(0, numY, 25, 15)
      p5.fill(255)
      p5.text("+" + ability.num, 0, numY - 2)
    } else {
      p5.fill(255)
      p5.rect(0, numY, 25, 15)
      p5.fill(30)
      p5.text("+" + ability.num, 0, numY - 2)
    }

    // flux
    if (ability.con.special === "FLUX") return

    if (ability.where === "ALL") {
      if (ability.con.animals) {
        const anis = ability.con.animals
        if (anis.length === 2) {
          this.renderAnimalIcon(p5, anis[0], -15, 27, 30)
          this.renderAnimalIcon(p5, anis[1], 15, 27, 30)
        } else if (anis.length === 3) {
          this.renderAnimalIcon(p5, anis[0], -28, 27, 30)
          this.renderAnimalIcon(p5, anis[1], 0, 27, 30)
          this.renderAnimalIcon(p5, anis[2], 28, 27, 30)
        }
        return
      }
      if (ability.con.ele) {
        this.renderEleIcon(p5, ability.con.ele, 0, 28, 30)
        return
      }
      // edge
      if (ability.con.special === "EDGE") {
        p5.image(this.sheetAbilities, 0, 28, 20, 20, 300, 0, 150, 150)
        return
      }
      // double adj
      if (ability.con.special === "DOUBLEADJ") {
        p5.image(this.sheetAbilities, -8, 28, 25, 25, 0, 0, 150, 150)
        p5.textSize(12)
        p5.fill(255)
        p5.text("x2", 12, 26)
        return
      }
    }

    if (ability.where === "DIA") {
      p5.image(this.sheetAbilities, -12, 28, 23, 23, 150, 0, 150, 150)
      if (ability.con.ele) {
        // ele
        this.renderEleIcon(p5, ability.con.ele!, 12, 28, 30)
      } else {
        // force
        p5.strokeWeight(1)
        if (ability.con.force === "YANG") {
          p5.stroke(30)
          this.renderYang(15, 28, 8)
        } else {
          p5.stroke(250)
          this.renderYin(15, 28, 8)
        }
      }
      return
    }

    if (ability.where === "ADJ") {
      if (ability.con.force) {
        p5.image(this.sheetAbilities, -10, 28, 25, 25, 0, 0, 150, 150)
        p5.strokeWeight(1)
        if (ability.con.force === "YANG") {
          p5.stroke(30)
          this.renderYang(15, 28, 8)
        } else {
          p5.stroke(250)
          this.renderYin(15, 28, 8)
        }
        return
      }
      if (ability.con.special === "UNIQUEELE") {
        p5.image(this.sheetAbilities, -20, 28, 25, 25, 0, 0, 150, 150)
        p5.image(this.sheetAbilities, 5, 28, 25, 25, 900, 0, 150, 150)
        p5.textSize(12)
        p5.fill(255)
        p5.text("x1", 22, 26)
        return
      }
      if (ability.con.special === "EMPTY") {
        p5.image(this.sheetAbilities, -12, 28, 25, 25, 0, 0, 150, 150)
        p5.image(this.sheetAbilities, 12, 28, 25, 25, 750, 0, 150, 150)
        return
      }
    }

    if (ability.where === "ROW") {
      if (ability.con.special === "UNIQUEELE") {
        p5.image(this.sheetAbilities, -20, 28, 25, 25, 600, 0, 150, 150)
        p5.image(this.sheetAbilities, 5, 28, 25, 25, 900, 0, 150, 150)
        p5.textSize(12)
        p5.fill(255)
        p5.text("x1", 22, 26)
        return
      }
      p5.image(this.sheetAbilities, -12, 28, 25, 25, 600, 0, 150, 150)
      p5.strokeWeight(1)
      if (ability.con.force === "YANG") {
        p5.stroke(30)
        this.renderYang(15, 28, 8)
      } else {
        p5.stroke(250)
        this.renderYin(15, 28, 8)
      }
      return
    }

    if (ability.where === "COL") {
      if (ability.con.special === "UNIQUEELE") {
        p5.image(this.sheetAbilities, -20, 28, 25, 25, 450, 0, 150, 150)
        p5.image(this.sheetAbilities, 5, 28, 25, 25, 900, 0, 150, 150)
        p5.textSize(12)
        p5.fill(255)
        p5.text("x1", 22, 26)
        return
      }
      p5.image(this.sheetAbilities, -10, 28, 25, 25, 450, 0, 150, 150)
      p5.strokeWeight(1)
      if (ability.con.force === "YANG") {
        p5.stroke(30)
        this.renderYang(12, 28, 8)
      } else {
        p5.stroke(250)
        this.renderYin(12, 28, 8)
      }
      return
    }
  }

  renderAnimalIcon(p5: P5, animal: Animal, x: number, y: number, s: number) {
    p5.image(
      this.sheetAnimals,
      x,
      y,
      s,
      s,
      150 * this.animalsOrder.indexOf(animal),
      0,
      150,
      150
    )
  }

  renderEleIcon(p5: P5, ele: Ele, x: number, y: number, s: number) {
    p5.image(
      this.sheetEles,
      x,
      y,
      s,
      s,
      150 * this.elesOrder.indexOf(ele),
      0,
      150,
      150
    )
  }

  // card: 105 x 140
  renderTransformCard(
    card: Card,
    x: number,
    y: number,
    sx: number,
    sy: number
  ) {
    const p5 = this.p5
    p5.push()
    p5.translate(x, y)
    p5.scale(sx, sy)
    const indexY = Math.floor(card.id / 6)
    p5.image(
      this.sheet,
      0,
      0,
      105,
      140,
      210 * (card.id - indexY * 6),
      280 * indexY,
      210,
      280
    )
    this.renderMiniAbility(p5, card)
    p5.pop()
  }

  renderYang(x: number, y: number, r: number) {
    const p5 = this.p5
    const rg = r * 1.33
    const hrg = (r / 2) * 1.33
    p5.fill(255)
    p5.beginShape()
    p5.vertex(x, y - r)
    p5.bezierVertex(x - rg, y - r, x - rg, y + r, x, y + r)
    p5.bezierVertex(x - hrg, y + r, x - hrg, y, x, y)
    p5.bezierVertex(x + hrg, y, x + hrg, y - r, x, y - r)
    p5.endShape()
    p5.noStroke()
    p5.fill(30)
    p5.circle(x, y - r / 2, r * 0.4)
  }

  renderYin(x: number, y: number, r: number) {
    const p5 = this.p5
    const rg = r * 1.33
    const hrg = (r / 2) * 1.33
    p5.fill(30)
    p5.beginShape()
    p5.vertex(x + 0, y + r)
    p5.bezierVertex(x + rg, y + r, x + rg, y - r, x, y - r)
    p5.bezierVertex(x + hrg, y - r, x + hrg, y, x, y)
    p5.bezierVertex(x - hrg, y, x - hrg, y + r, x, y + r)
    p5.endShape()
    p5.noStroke()
    p5.fill(255)
    p5.circle(x, y + r / 2, r * 0.4)
  }
  click(p5: P5) {
    const gp = this.gameplay

    // no input during scoring phase
    if (gp.phase === "SCORING") return
    // if is inspecting card then exit
    if (gp.inspect.isOpening) return (gp.inspect.isOpening = false)

    const buttons = this.buttons
    const mx = this.gc.mx
    const my = this.gc.my

    // blocked by ending modal?
    if (gp.endingControl.isOpened) {
      if (
        gp.endingControl.increaseAP === 1 &&
        buttons.closeShop.checkHover(mx, my)
      ) {
        buttons.closeShop.clicked()
      }
      return
    }

    // blocked by lang modal?
    if (gp.langModal.isOpened) {
      // check options
      const ops = gp.langModal.optionButtons
      for (let i = 0; i < ops.length; i++) {
        if (ops[i].checkHover(mx, my)) return ops[i].clicked()
      }
      return
    }

    // blocked by wheel modal?
    if (gp.wheelModalIsOpened) {
      return (gp.wheelModalIsOpened = false)
    }

    // viewing a guest? go back button
    if (gp.viewingPlayer !== gp.myPlayerId) {
      if (gp.myPlayerId) {
        if (buttons.goBack.checkHover(mx, my)) return buttons.goBack.clicked()
      }
    }
    // viewing self?
    else {
      // phases
      if (gp.phase === "GET") {
        const shop = gp.shop
        // shop is opened?
        if (gp.shop.isOpened) {
          const holder1 = shop.cardHolders![0]
          const holder2 = shop.cardHolders![1]
          const isFlipping = holder2.flips > 0 || holder2.ap > 0.5
          if (isFlipping) return

          // check click to inspect holders
          const holdersYEnd = shop.holdersY.end
          if (
            mx > 140 - 75 &&
            mx < 140 + 75 &&
            my > holdersYEnd - 100 &&
            my < holdersYEnd + 100
          ) {
            this.playSound(this.clickingSound)
            gp.inspectCard(holder1.card, 140, holdersYEnd, 1.5)
            return
          } else if (
            mx > 360 - 75 &&
            mx < 360 + 75 &&
            my > holdersYEnd - 100 &&
            my < holdersYEnd + 100
          ) {
            this.playSound(this.clickingSound)
            gp.inspectCard(holder2.card, 360, holdersYEnd, 1.5)
            return
          }

          if (shop.menuType == "DEFAULT") {
            // default menu buttons
            if (buttons.acceptCards.checkHover(mx, my))
              return buttons.acceptCards.clicked()

            if (!shop.hasRerolled) {
              if (buttons.rerollEle.checkHover(mx, my)) {
                return buttons.rerollEle.clicked()
              }
              if (buttons.rerollType.checkHover(mx, my)) {
                return buttons.rerollType.clicked()
              }
              if (buttons.closeShop.checkHover(mx, my)) {
                return buttons.closeShop.clicked()
              }
            }
          } else {
            // reroll menu buttons
            if (buttons.rerollYes.checkHover(mx, my))
              return buttons.rerollYes.clicked()

            if (buttons.rerollNo.checkHover(mx, my))
              return buttons.rerollNo.clicked()

            // check click to inspect reroll previews
            const holdersYAR = shop.holdersY.AFTER_REROLL
            if (
              mx > 140 - 75 &&
              mx < 140 + 75 &&
              my > holdersYAR - 100 &&
              my < holdersYAR + 100
            ) {
              this.playSound(this.clickingSound)
              gp.inspectCard(
                shop.rerollPreviews.yangPool[shop.rerollPreviews.showingIndex],
                140,
                holdersYAR,
                1.5
              )
              return
            } else if (
              mx > 360 - 75 &&
              mx < 360 + 75 &&
              my > holdersYAR - 100 &&
              my < holdersYAR + 100
            ) {
              this.playSound(this.clickingSound)
              gp.inspectCard(
                shop.rerollPreviews.yinPool[shop.rerollPreviews.showingIndex],
                360,
                holdersYAR,
                1.5
              )
              return
            }
          }
          return
        }
        // shop is closed?
        else {
          // check click open shop button
          if (buttons.openShop.checkHover(mx, my)) {
            return buttons.openShop.clicked()
          }
        }
      } else if (gp.phase === "PLAY") {
        const [lc1, lc2] = gp.localCards!

        // release dragged card
        if (lc1.isDragging) {
          lc1.isDragging = false
          if (this.dragHoveredPos) {
            this.playSound(this.scoreSound)
            gp.playCard(0, this.dragHoveredPos)
          }
          return
        }
        if (lc2.isDragging) {
          lc2.isDragging = false
          if (this.dragHoveredPos) {
            this.playSound(this.scoreSound)
            gp.playCard(1, this.dragHoveredPos)
          }
          return
        }

        // both cards are placed?
        if (lc1.placedPos !== null && lc2.placedPos !== null) {
          if (buttons.undo.checkHover(mx, my)) return buttons.undo.clicked()
          if (buttons.ready.checkHover(mx, my)) return buttons.ready.clicked()
        }
      } else if (gp.phase === "ENDING") {
        if (buttons.shareImage.checkHover(mx, my))
          return buttons.shareImage.clicked()
      }
    }

    // clicked language menu?
    if (p5.dist(mx, my, 35, 50) < 18) {
      this.playSound(this.clickingSound)
      return gp.openLangModal()
    }
    // clicked wheel?
    if (p5.dist(mx, my, 35, 100) < 18) {
      this.playSound(this.clickingSound)
      gp.wheelModalIsOpened = true
      return
    }
    // clicked preview?
    if (p5.dist(mx, my, 35, 150) < 18) {
      this.playSound(this.clickingSound)
      return (gp.yieldPreview.isShown = !gp.yieldPreview.isShown)
    }

    // inspect card in collection
    const clickedCardX = Math.floor((mx - (gp.localDisplay.x - 52.5)) / 105)
    const clickedCardY = Math.floor((my - (gp.localDisplay.y - 70)) / 140)
    if (
      clickedCardX > -1 &&
      clickedCardX < 4 &&
      clickedCardY > -1 &&
      clickedCardY < 4
    ) {
      const collection = gp.localDisplay.collection
      const cardId = collection[clickedCardY][clickedCardX]
      if (cardId !== null) {
        this.playSound(this.clickingSound)
        return gp.inspectCard(
          CARDS_TABLE[cardId],
          gp.localDisplay.x + 105 * clickedCardX,
          gp.localDisplay.y + 140 * clickedCardY,
          1
        )
      }
    }
  }
}
