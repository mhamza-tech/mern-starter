/**
 * @rob4lderman
 * mar2020
 */
import { gql } from 'apollo-server'

export default gql`

    type WorldMap {
        tiles: [Tile]!
        players: [Player]!
    }

    type Query {
        worldMap: WorldMap! 
    }
`
