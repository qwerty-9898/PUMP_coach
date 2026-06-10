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
  'грудь':   [[50, 33, 58, 34]],
  'спина':   [[50, 46, 76, 50]],
  'ноги':    [[33, 30, 40, 40], [67, 30, 40, 40]],
  'плечи':   [[24, 40, 38, 32], [76, 40, 38, 32]],
  'бицепс':  [[14, 46, 26, 40], [86, 46, 26, 40]],
  'трицепс': [[14, 46, 26, 40], [86, 46, 26, 40]],
  'пресс':   [[50, 42, 54, 52]]
}
