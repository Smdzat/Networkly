import type { Lesson } from '../../types'
import lesson1_1 from './lesson-1-1'
import lesson1_1b from './lesson-1-1b'
import lesson1_2 from './lesson-1-2'
import lesson1_3 from './lesson-1-3'
import lesson1_4 from './lesson-1-4'
import lesson1_5 from './lesson-1-5'
import lesson1_6 from './lesson-1-6'
import lesson1_7 from './lesson-1-7'
import lesson1_7b from './lesson-1-7b'
import lesson1_8 from './lesson-1-8'
import lesson1_9 from './lesson-1-9'
import lesson1_10 from './lesson-1-10'
import lesson1_11 from './lesson-1-11'
import lesson1_12 from './lesson-1-12'
import lesson1_13 from './lesson-1-13'

export const lessons: Lesson[] = [
  lesson1_1,
  lesson1_1b,
  lesson1_2,
  lesson1_3,
  lesson1_4,
  lesson1_5,
  lesson1_6,
  lesson1_7,
  lesson1_7b,
  lesson1_8,
  lesson1_9,
  lesson1_10,
  lesson1_11,
  lesson1_12,
  lesson1_13,
]

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find(l => l.id === id)
}
