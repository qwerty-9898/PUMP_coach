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
  'грудь':   [[36, 31, 34, 26], [64, 31, 34, 26]],
  'спина':   [[50, 42, 70, 46]],
  'ноги':    [[33, 28, 40, 40], [67, 28, 40, 40]],
  'плечи':   [[15, 22, 30, 28], [85, 22, 30, 28]],
  'бицепс':  [[12, 45, 24, 40], [88, 45, 24, 40]],
  'трицепс': [[12, 45, 24, 40], [88, 45, 24, 40]],
  'пресс':   [[50, 44, 52, 54]]
}
