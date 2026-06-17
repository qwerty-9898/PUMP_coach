import chest from '../assets/skeleton/g_chest.png'
import back from '../assets/skeleton/g_back.png'
import legs from '../assets/skeleton/g_legs.png'
import shoulders from '../assets/skeleton/g_shoulders.png'
import biceps from '../assets/skeleton/g_biceps.png'
import triceps from '../assets/skeleton/g_triceps.png'
import abs from '../assets/skeleton/g_abs.png'

export const MUSCLE_ART = {
  'грудь': chest, 'спина': back, 'ноги': legs, 'плечи': shoulders,
  'бицепс': biceps, 'трицепс': triceps, 'пресс': abs
}

// Красная неон-подсветка целевой зоны на кропе: [cx, cy, w, h] в %
export const MUSCLE_HL = {
  'грудь':   [[37, 30, 17, 13], [63, 30, 17, 13]],
  'спина':   [[50, 40, 32, 22]],
  'ноги':    [[34, 27, 19, 19], [66, 27, 19, 19]],
  'плечи':   [[16, 22, 15, 14], [84, 22, 15, 14]],
  'бицепс':  [[13, 44, 12, 20], [87, 44, 12, 20]],
  'трицепс': [[13, 44, 12, 20], [87, 44, 12, 20]],
  'пресс':   [[50, 42, 26, 28]]
}

// Центры мышц на кропе для точечного маркера: [cx, cy] в %
export const MUSCLE_DOT = {
  'грудь':   [[34, 26], [60, 26]],
  'спина':   [[50, 46]],
  'ноги':    [[37, 27], [63, 27]],
  'плечи':   [[16, 26], [84, 26]],
  'бицепс':  [[12, 42], [88, 42]],
  'трицепс': [[11, 38], [89, 38]],
  'пресс':   [[50, 22]]
}
