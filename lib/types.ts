export type League = 'J1' | 'J2' | 'J3'
export type Position = 'GK' | 'DF' | 'MF' | 'FW'

export interface Team {
  id: number
  name: string
  league: League
  colors: [string, string, string]
}

export interface Player {
  id: number
  teamId: number
  num: number
  name: string
  furi: string
  pos: Position
}

export interface Notice {
  id: number
  date: string
  text: string
}
