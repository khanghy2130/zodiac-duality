import type P5 from "p5"
import Gameplay from "./Gameplay"
import Render from "./Render"
import Button from "./Button"
import GameClient from "./GameClient"
import { Language, translations } from "./locales"
import { CARDS_TABLE, getTriggerPositions } from "./cards"
import { GameState } from "../logic"

const createButtons = (
  gc: GameClient,
  p5: P5,
  gameplay: Gameplay,
  render: Render
) => {
  const shop = gameplay.shop

  // add lang option buttons
  let langOpX = 0
  let langOpY = 0
  for (const langCode in translations) {
    const langObj = translations[langCode as Language]
    gameplay.langModal.optionButtons.push(
      new Button(
        [langOpX === 0 ? 140 : 360, 250 + 105 * langOpY, 180, 60],
        p5.color(180),
        p5,
        render,
        function () {
          p5.fill(255)
          p5.stroke(0)
          p5.strokeWeight(8)
          p5.textSize(28)
          p5.text(langObj.langname, 0, -5)
        },
        function () {
          gc.translatedTexts = langObj
          gameplay.langModal.isOpened = false
          localStorage.setItem("lang", langCode)
        }
      )
    )
    langOpX++
    if (langOpX > 1) {
      langOpX = 0
      langOpY++
    }
  }

  render.buttons = {
    openShop: new Button(
      [250, 800, 400, 70],
      p5.color(65, 150, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(8)
        p5.textSize(36)
        p5.text(gc.translatedTexts.short.getanimals, 0, -8)
      },
      function () {
        shop.openBtnHintCountdown = 150
        shop.isOpened = true
        render.buttons.acceptCards.ap = 0
        render.buttons.rerollEle.ap = 0
        render.buttons.rerollType.ap = 0
      }
    ),

    acceptCards: new Button(
      [250, 760, 400, 70],
      p5.color(65, 150, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(8)
        p5.textSize(36)
        p5.text(gc.translatedTexts.short.acceeptcards, 0, -8)
      },
      function () {
        shop.isOpened = false
        gameplay.phase = "PLAY"
        gameplay.localCards = [
          {
            card: shop.availableCards![0],
            placedPos: null,
            x: 140,
            y: shop.holdersY.DEFAULT,
            s: 1.5,
            isDragging: false,
          },
          {
            card: shop.availableCards![1],
            placedPos: null,
            x: 360,
            y: shop.holdersY.DEFAULT,
            s: 1.5,
            isDragging: false,
          },
        ]
      }
    ),
    closeShop: new Button(
      [430, 70, 70, 50],
      p5.color(240, 70, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.noStroke()
        p5.textSize(30)
        p5.text("X", 0, -6)
      },
      function () {
        // closing ending?
        if (gameplay.endingControl.isOpened) {
          gameplay.endingControl.isOpened = false
          return
        }

        shop.isOpened = false
        render.buttons.closeShop.ap = 1
      }
    ),
    rerollEle: new Button(
      [250, 500, 300, 50],
      p5.color(65, 150, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(6)
        p5.textSize(24)
        p5.text(gc.translatedTexts.short.changeelement, 0, -6)
      },
      function () {
        render.buttons.rerollYes.ap = 0
        render.buttons.rerollNo.ap = 0
        shop.menuType = "CHANGE_ELEMENT"
        shop.holdersY.start = shop.holdersY.end
        shop.holdersY.end = shop.holdersY.REROLL
        shop.holdersY.ap = 0

        const rp = shop.rerollPreviews
        rp.countdown = 29
        rp.showingIndex = 0
        const yinCard = shop.availableCards![1]
        rp.yinPool = shop.yinPool.filter(
          (card) => card.animal === yinCard.animal && card !== yinCard
        )
        const yangCard = shop.availableCards![0]
        rp.yangPool = shop.yangPool.filter(
          (card) => card.animal === yangCard.animal && card !== yangCard
        )
        if (rp.yangPool.length !== 3 || rp.yinPool.length !== 3) {
          throw "reroll pool size isn't 3"
        }
      }
    ),
    rerollType: new Button(
      [250, 580, 300, 50],
      p5.color(65, 150, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(6)
        p5.textSize(24)
        p5.text(gc.translatedTexts.short.changetype, 0, -6)
      },
      function () {
        render.buttons.rerollYes.ap = 0
        render.buttons.rerollNo.ap = 0
        shop.menuType = "CHANGE_TYPE"
        shop.holdersY.start = shop.holdersY.end
        shop.holdersY.end = shop.holdersY.REROLL
        shop.holdersY.ap = 0

        const rp = shop.rerollPreviews
        rp.countdown = 29
        rp.showingIndex = 0
        const yinCard = shop.availableCards![1]
        rp.yinPool = shop.yinPool.filter(
          (card) => card.ele === yinCard.ele && card !== yinCard
        )
        const yangCard = shop.availableCards![0]
        rp.yangPool = shop.yangPool.filter(
          (card) => card.ele === yangCard.ele && card !== yangCard
        )
        if (rp.yangPool.length !== 3 || rp.yinPool.length !== 3) {
          throw "reroll pool size isn't 3"
        }
      }
    ),

    rerollYes: new Button(
      [140, 760, 140, 60],
      p5.color(65, 150, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(8)
        p5.textSize(28)
        p5.text(gc.translatedTexts.short.yes, 0, -8)
      },
      function () {
        const thisPlayer = gameplay.gs!.players.find(
          (p) => p.id === gameplay.myPlayerId
        )
        if (!thisPlayer) throw "Can't find this player data"

        render.buttons.rerollYes.ap = 1
        render.buttons.acceptCards.ap = 0
        shop.menuType = "DEFAULT"
        shop.holdersY.start = shop.holdersY.AFTER_REROLL
        shop.holdersY.end = shop.holdersY.DEFAULT
        shop.holdersY.ap = 0
        shop.flipYangPool = shop.rerollPreviews.yangPool
        shop.flipYinPool = shop.rerollPreviews.yinPool
        shop.hasRerolled = true

        // get new cards (from flip pools as they are just assigned above)
        shop.availableCards = [
          shop.flipYangPool[
            Math.floor(shop.flipYangPool.length * Math.random())
          ],
          shop.flipYinPool[Math.floor(shop.flipYinPool.length * Math.random())],
        ]

        shop.cardHolders = [
          // first card has less flips
          { flips: 6, ap: 1, card: shop.availableCards[0] },
          { flips: 8, ap: 1, card: shop.availableCards[1] },
        ]
      }
    ),

    rerollNo: new Button(
      [360, 760, 140, 60],
      p5.color(240, 70, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(8)
        p5.textSize(28)
        p5.text(gc.translatedTexts.short.no, 0, -8)
      },
      function () {
        render.buttons.rerollNo.ap = 1
        render.buttons.acceptCards.ap = 0
        render.buttons.rerollEle.ap = 0
        render.buttons.rerollType.ap = 0
        shop.menuType = "DEFAULT"
        shop.holdersY.start = shop.holdersY.end
        shop.holdersY.end = shop.holdersY.DEFAULT
        shop.holdersY.ap = 0
      }
    ),

    undo: new Button(
      [120, 805, 140, 60],
      p5.color(240, 70, 50),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(6)
        p5.textSize(24)
        p5.text(gc.translatedTexts.short.undo, 0, -3)
      },
      function () {
        gameplay.undo()
      }
    ),
    ready: new Button(
      [350, 805, 200, 60],
      p5.color(65, 150, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(6)
        p5.textSize(32)
        p5.text(gc.translatedTexts.short.ready, 0, -8)
      },
      function () {
        gameplay.phase = "READY"
        const game = gameplay.gs!

        // update all players
        game.players.forEach((p) => {
          p.prevYangPts = p.yangPts
          p.prevYinPts = p.yinPts
          p.collection = gameplay.localDisplay.collection.map((r) => r.slice())

          // go through collection to calculate points gained
          const c = gameplay.localDisplay.collection
          for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
              const cardId = c[y][x]
              if (cardId !== null) {
                const triggers = getTriggerPositions(c, [x, y])
                const card = CARDS_TABLE[cardId]
                const pointsGained = triggers.length * card.ability.num
                if (card.isYin) p.yinPts += pointsGained
                else p.yangPts += pointsGained
              }
            }
          }
        })

        game.round++ // update round

        //// test: immediate end the game with random scores
        // game.round = 6
        // game.players.forEach((p) => {
        //   const xx = Math.floor(Math.random() * 90 + 50)
        //   p.yangPts = xx + Math.floor(Math.random() * 20)
        //   p.yinPts = xx + Math.floor(Math.random() * 20)
        // })

        gameplay.startScoringPhase()
      }
    ),

    goBack: new Button(
      [130, 805, 170, 60],
      p5.color(65, 150, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(6)
        p5.textSize(26)
        p5.text(gc.translatedTexts.short.goback, 0, -5)
      },
      function () {
        if (gameplay.myPlayerId) gameplay.setViewingPlayer(gameplay.myPlayerId)
      }
    ),

    shareImage: new Button(
      [250, 800, 400, 70],
      p5.color(65, 150, 60),
      p5,
      render,
      function () {
        p5.fill(255)
        p5.stroke(0)
        p5.strokeWeight(8)
        p5.textSize(36)
        p5.text(gc.translatedTexts.short.playagain, 0, -8)
      },
      function () {
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
        gameplay.gs = game
        gameplay.localDisplay.collection = game.players[0].collection
        gameplay.startScoringPhase()
      }
    ),
  }
}

export default createButtons
