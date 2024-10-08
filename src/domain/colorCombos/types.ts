import { colors } from 'src/domain/colors'

export interface BaseColorCombo<Id> {
  id: Id
  text: colors
  background: colors
}
