type CardItem = number | null
export type Collection = CardItem[][]

export interface LogicPlayer {
  id: string
  prevYinPts: number
  prevYangPts: number
  yinPts: number
  yangPts: number
  history: number[][]
  collection: Collection
}

export interface GameState {
  round: number
  players: LogicPlayer[]
}
