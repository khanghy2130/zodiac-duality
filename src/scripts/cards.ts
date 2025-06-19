import { Collection } from "../logic"

export type Animal =
  | "RAT"
  | "OX"
  | "TIGER"
  | "RABBIT"
  | "DRAGON"
  | "SNAKE"
  | "HORSE"
  | "GOAT"
  | "MONKEY"
  | "CHICKEN"
  | "DOG"
  | "PIG"

export type Ele = "WOOD" | "FIRE" | "EARTH" | "METAL" | "WATER" | "FLUX"

export interface Ability {
  num: number
  where: "SELF" | "ALL" | "DIA" | "ADJ" | "ROW" | "COL"
  // condition
  con: {
    force?: "YIN" | "YANG"
    ele?: Ele
    animals?: Animal[]
    special?: "EMPTY" | "UNIQUEELE" | "DOUBLEADJ" | "EDGE" | "FLUX"
  }
}

export interface Card {
  id: number
  animal: Animal
  ele: Ele
  isYin: boolean
  ability: Ability
}

export const CARDS_TABLE: Card[] = [
  {
    id: 0,
    animal: "RAT",
    ele: "WOOD",
    isYin: false,
    ability: {
      num: 4,
      where: "ROW",
      con: {
        force: "YIN",
      },
    },
  },
  {
    id: 1,
    animal: "OX",
    ele: "FIRE",
    isYin: true,
    ability: {
      num: 4,
      where: "ADJ",
      con: {
        special: "UNIQUEELE",
      },
    },
  },
  {
    id: 2,
    animal: "TIGER",
    ele: "EARTH",
    isYin: false,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["TIGER", "PIG"],
      },
    },
  },
  {
    id: 3,
    animal: "RABBIT",
    ele: "METAL",
    isYin: true,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["DOG", "RABBIT"],
      },
    },
  },
  {
    id: 4,
    animal: "DRAGON",
    ele: "WATER",
    isYin: false,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["DRAGON", "SNAKE"],
      },
    },
  },
  {
    id: 5,
    animal: "SNAKE",
    ele: "FLUX",
    isYin: true,
    ability: {
      num: 5,
      where: "SELF",
      con: {
        special: "FLUX",
      },
    },
  },
  {
    id: 6,
    animal: "PIG",
    ele: "WOOD",
    isYin: true,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        special: "EDGE",
      },
    },
  },
  {
    id: 7,
    animal: "DOG",
    ele: "FIRE",
    isYin: false,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        special: "DOUBLEADJ",
      },
    },
  },
  {
    id: 8,
    animal: "CHICKEN",
    ele: "EARTH",
    isYin: true,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        special: "DOUBLEADJ",
      },
    },
  },
  {
    id: 9,
    animal: "MONKEY",
    ele: "METAL",
    isYin: false,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["MONKEY", "CHICKEN"],
      },
    },
  },
  {
    id: 10,
    animal: "GOAT",
    ele: "WATER",
    isYin: true,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["HORSE", "GOAT"],
      },
    },
  },
  {
    id: 11,
    animal: "HORSE",
    ele: "FLUX",
    isYin: false,
    ability: {
      num: 5,
      where: "SELF",
      con: {
        special: "FLUX",
      },
    },
  },
  {
    id: 12,
    animal: "SNAKE",
    ele: "WOOD",
    isYin: true,
    ability: {
      num: 3,
      where: "ADJ",
      con: {
        special: "EMPTY",
      },
    },
  },
  {
    id: 13,
    animal: "RAT",
    ele: "FIRE",
    isYin: false,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        special: "EDGE",
      },
    },
  },
  {
    id: 14,
    animal: "OX",
    ele: "EARTH",
    isYin: true,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["RAT", "OX"],
      },
    },
  },
  {
    id: 15,
    animal: "TIGER",
    ele: "METAL",
    isYin: false,
    ability: {
      num: 3,
      where: "ADJ",
      con: {
        special: "EMPTY",
      },
    },
  },
  {
    id: 16,
    animal: "RABBIT",
    ele: "WATER",
    isYin: true,
    ability: {
      num: 4,
      where: "ROW",
      con: {
        force: "YANG",
      },
    },
  },
  {
    id: 17,
    animal: "DRAGON",
    ele: "FLUX",
    isYin: false,
    ability: {
      num: 5,
      where: "SELF",
      con: {
        special: "FLUX",
      },
    },
  },
  {
    id: 18,
    animal: "HORSE",
    ele: "WOOD",
    isYin: false,
    ability: {
      num: 4,
      where: "ADJ",
      con: {
        force: "YANG",
      },
    },
  },
  {
    id: 19,
    animal: "PIG",
    ele: "FIRE",
    isYin: true,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["PIG", "RABBIT", "GOAT"],
      },
    },
  },
  {
    id: 20,
    animal: "DOG",
    ele: "EARTH",
    isYin: false,
    ability: {
      num: 4,
      where: "ADJ",
      con: {
        special: "UNIQUEELE",
      },
    },
  },
  {
    id: 21,
    animal: "CHICKEN",
    ele: "METAL",
    isYin: true,
    ability: {
      num: 4,
      where: "COL",
      con: {
        force: "YANG",
      },
    },
  },
  {
    id: 22,
    animal: "MONKEY",
    ele: "WATER",
    isYin: false,
    ability: {
      num: 3,
      where: "ROW",
      con: {
        special: "UNIQUEELE",
      },
    },
  },
  {
    id: 23,
    animal: "GOAT",
    ele: "FLUX",
    isYin: true,
    ability: {
      num: 5,
      where: "SELF",
      con: {
        special: "FLUX",
      },
    },
  },
  {
    id: 24,
    animal: "DRAGON",
    ele: "WOOD",
    isYin: false,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        ele: "WOOD",
      },
    },
  },
  {
    id: 25,
    animal: "SNAKE",
    ele: "FIRE",
    isYin: true,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        ele: "FIRE",
      },
    },
  },
  {
    id: 26,
    animal: "RAT",
    ele: "EARTH",
    isYin: false,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        ele: "EARTH",
      },
    },
  },
  {
    id: 27,
    animal: "OX",
    ele: "METAL",
    isYin: true,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        ele: "METAL",
      },
    },
  },
  {
    id: 28,
    animal: "TIGER",
    ele: "WATER",
    isYin: false,
    ability: {
      num: 2,
      where: "ALL",
      con: {
        ele: "WATER",
      },
    },
  },
  {
    id: 29,
    animal: "RABBIT",
    ele: "FLUX",
    isYin: true,
    ability: {
      num: 5,
      where: "SELF",
      con: {
        special: "FLUX",
      },
    },
  },
  {
    id: 30,
    animal: "GOAT",
    ele: "WOOD",
    isYin: true,
    ability: {
      num: 4,
      where: "DIA",
      con: {
        ele: "WOOD",
      },
    },
  },
  {
    id: 31,
    animal: "HORSE",
    ele: "FIRE",
    isYin: false,
    ability: {
      num: 4,
      where: "DIA",
      con: {
        ele: "FIRE",
      },
    },
  },
  {
    id: 32,
    animal: "PIG",
    ele: "EARTH",
    isYin: true,
    ability: {
      num: 4,
      where: "DIA",
      con: {
        ele: "EARTH",
      },
    },
  },
  {
    id: 33,
    animal: "DOG",
    ele: "METAL",
    isYin: false,
    ability: {
      num: 4,
      where: "DIA",
      con: {
        ele: "METAL",
      },
    },
  },
  {
    id: 34,
    animal: "CHICKEN",
    ele: "WATER",
    isYin: true,
    ability: {
      num: 4,
      where: "DIA",
      con: {
        ele: "WATER",
      },
    },
  },
  {
    id: 35,
    animal: "MONKEY",
    ele: "FLUX",
    isYin: false,
    ability: {
      num: 5,
      where: "SELF",
      con: {
        special: "FLUX",
      },
    },
  },

  {
    id: 36,
    animal: "RABBIT",
    ele: "WOOD",
    isYin: true,
    ability: {
      num: 4,
      where: "ADJ",
      con: {
        force: "YIN",
      },
    },
  },
  {
    id: 37,
    animal: "DRAGON",
    ele: "FIRE",
    isYin: false,
    ability: {
      num: 4,
      where: "DIA",
      con: {
        force: "YANG",
      },
    },
  },
  {
    id: 38,
    animal: "SNAKE",
    ele: "EARTH",
    isYin: true,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["SNAKE", "CHICKEN", "OX"],
      },
    },
  },
  {
    id: 39,
    animal: "RAT",
    ele: "METAL",
    isYin: false,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["RAT", "DRAGON", "MONKEY"],
      },
    },
  },
  {
    id: 40,
    animal: "OX",
    ele: "WATER",
    isYin: true,
    ability: {
      num: 4,
      where: "DIA",
      con: {
        force: "YIN",
      },
    },
  },
  {
    id: 41,
    animal: "TIGER",
    ele: "FLUX",
    isYin: false,
    ability: {
      num: 5,
      where: "SELF",
      con: {
        special: "FLUX",
      },
    },
  },
  {
    id: 42,
    animal: "MONKEY",
    ele: "WOOD",
    isYin: false,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        ele: "FLUX",
      },
    },
  },
  {
    id: 43,
    animal: "GOAT",
    ele: "FIRE",
    isYin: true,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        ele: "FLUX",
      },
    },
  },
  {
    id: 44,
    animal: "HORSE",
    ele: "EARTH",
    isYin: false,
    ability: {
      num: 4,
      where: "COL",
      con: {
        force: "YIN",
      },
    },
  },
  {
    id: 45,
    animal: "PIG",
    ele: "METAL",
    isYin: true,
    ability: {
      num: 3,
      where: "COL",
      con: {
        special: "UNIQUEELE",
      },
    },
  },
  {
    id: 46,
    animal: "DOG",
    ele: "WATER",
    isYin: false,
    ability: {
      num: 3,
      where: "ALL",
      con: {
        animals: ["DOG", "TIGER", "HORSE"],
      },
    },
  },
  {
    id: 47,
    animal: "CHICKEN",
    ele: "FLUX",
    isYin: true,
    ability: {
      num: 5,
      where: "SELF",
      con: {
        special: "FLUX",
      },
    },
  },
]

// returns triggering positions
export const getTriggerPositions: (
  collection: Collection,
  targetPosition: [number, number]
) => [number, number][] = (collection, [tx, ty]) => {
  const targetCardId = collection[ty][tx]
  if (targetCardId === null) return [] // no card here

  const targetCard = CARDS_TABLE[targetCardId]
  const con = targetCard.ability.con

  // early exit special case SELF FLUX
  if (con.special === "FLUX") return [[tx, ty]]

  // early exit special case ADJ EMPTY
  if (con.special === "EMPTY") {
    let rowIsFull = false
    let colIsFull = false
    for (let y = 0; y < 4; y++) {
      if (collection[y][3] !== null) {
        rowIsFull = true
        break
      }
    }
    for (let x = 0; x < 4; x++) {
      if (collection[3][x] !== null) {
        colIsFull = true
        break
      }
    }
    const result: [number, number][] = []
    result.push([tx, ty - 1])
    result.push([tx - 1, ty])
    result.push([tx + 1, ty])
    result.push([tx, ty + 1])

    return result.filter(([x, y]) => {
      // if col is not full and y is -1, still add
      if (y === -1 && !colIsFull) return true
      // if row is not full and x is -1, still add
      if (x === -1 && !rowIsFull) return true
      return x > -1 && x < 4 && y > -1 && y < 4 && collection[y][x] === null
    })
  }

  let possibleTPs: [number, number][] = []
  switch (targetCard.ability.where) {
    case "ALL":
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (collection[y][x] !== null) possibleTPs.push([x, y])
        }
      }
      break
    case "ADJ":
      possibleTPs.push([tx, ty - 1])
      possibleTPs.push([tx - 1, ty])
      possibleTPs.push([tx + 1, ty])
      possibleTPs.push([tx, ty + 1])
      // if checking for empties then don't filter out empties
      possibleTPs = possibleTPs.filter(
        ([x, y]) =>
          x > -1 && x < 4 && y > -1 && y < 4 && collection[y][x] !== null
      )
      break
    case "DIA":
      possibleTPs.push([tx - 1, ty - 1])
      possibleTPs.push([tx + 1, ty - 1])
      possibleTPs.push([tx - 1, ty + 1])
      possibleTPs.push([tx + 1, ty + 1])
      possibleTPs = possibleTPs.filter(
        ([x, y]) =>
          x > -1 && x < 4 && y > -1 && y < 4 && collection[y][x] !== null
      )
      break
    case "COL":
      for (let y = 0; y < 4; y++) {
        if (collection[y][tx] !== null) possibleTPs.push([tx, y])
      }
      break
    case "ROW":
      for (let x = 0; x < 4; x++) {
        if (collection[ty][x] !== null) possibleTPs.push([x, ty])
      }
      break
  }

  // check condition
  if (con.force) {
    const targetIsYin = con.force === "YIN"
    return possibleTPs.filter(
      ([x, y]) => CARDS_TABLE[collection[y][x]!].isYin === targetIsYin
    )
  }
  // already handled FLUX case earlier, therefore no FLUX here
  if (con.ele) {
    return possibleTPs.filter(([x, y]) => {
      const ele = CARDS_TABLE[collection[y][x]!].ele
      return ele === con.ele || ele === "FLUX"
    })
  }
  if (con.animals) {
    return possibleTPs.filter(([x, y]) => {
      const thisCardAnimal = CARDS_TABLE[collection[y][x]!].animal
      return con.animals!.includes(thisCardAnimal)
    })
  }
  if (con.special) {
    const uniqueElementObj: { [key: string]: true } = {} // key is ele
    let rowIsFull = false
    let colIsFull = false
    switch (con.special) {
      case "UNIQUEELE":
        return possibleTPs.filter(([x, y]) => {
          const ele = CARDS_TABLE[collection[y][x]!].ele
          // skip flux
          if (ele === "FLUX") return false
          if (!uniqueElementObj[ele]) {
            uniqueElementObj[ele] = true
            return true
          }
          return false
        })
      case "DOUBLEADJ":
        return possibleTPs.filter(([x, y]) => {
          const adjs = [
            [x, y - 1],
            [x - 1, y],
            [x + 1, y],
            [x, y + 1],
          ]
          let counter = 0
          for (let i = 0; i < adjs.length; i++) {
            const [ax, ay] = adjs[i]
            if (
              ax > -1 &&
              ax < 4 &&
              ay > -1 &&
              ay < 4 &&
              collection[ay][ax] !== null
            )
              counter++
          }
          return counter === 2
        })
      case "EDGE":
        for (let y = 0; y < 4; y++) {
          if (collection[y][3] !== null) {
            rowIsFull = true
            break
          }
        }
        for (let x = 0; x < 4; x++) {
          if (collection[3][x] !== null) {
            colIsFull = true
            break
          }
        }
        // if row is full, count any x = 0 and x = 3. same to y
        return possibleTPs.filter(
          ([x, y]) =>
            ((x === 0 || x === 3) && rowIsFull) ||
            ((y === 0 || y === 3) && colIsFull)
        )
    }
  }

  return []
}

// test
// console.log(
//   getTriggerPositions(
//     [
//       [12, 12, 2, 6],
//       [null, 24, null, null],
//       [null, 2, 1, null],
//       [null, null, 1, null],
//     ],
//     [3, 0]
//   )
// )
