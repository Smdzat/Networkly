/* ==============================================================
   Lesson progress — Firestore persistence
   --------------------------------------------------------------
   Stored per user under  users/{uid}/progress/{lessonId}.
   - stepIndex  : the last step the user was on (for "continue")
   - furthest   : the furthest step reached (for the progress bar)
   - totalSteps : total steps in that lesson
   - completed  : reached the final step at least once
   ============================================================== */
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

export interface LessonProgress {
  lessonId: string
  stepIndex: number
  furthest: number
  totalSteps: number
  completed: boolean
}

export type ProgressMap = Record<string, LessonProgress>

/** Save / update the user's progress for one lesson. */
export async function saveLessonProgress(
  uid: string,
  lessonId: string,
  stepIndex: number,
  furthest: number,
  totalSteps: number,
): Promise<void> {
  const completed = furthest >= totalSteps - 1
  await setDoc(
    doc(db, 'users', uid, 'progress', lessonId),
    {
      stepIndex,
      furthest,
      totalSteps,
      completed,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/** Load all of a user's lesson progress as a map keyed by lessonId. */
export async function fetchAllProgress(uid: string): Promise<ProgressMap> {
  const snap = await getDocs(collection(db, 'users', uid, 'progress'))
  const result: ProgressMap = {}
  snap.forEach((d) => {
    const data = d.data() as Omit<LessonProgress, 'lessonId'>
    result[d.id] = { lessonId: d.id, ...data }
  })
  return result
}

/** Load progress for a single lesson (null if none saved yet). */
export async function fetchLessonProgress(
  uid: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'progress', lessonId))
  if (!snap.exists()) return null
  const data = snap.data() as Omit<LessonProgress, 'lessonId'>
  return { lessonId, ...data }
}

/** Wipe all progress for a user (used by the "reset" setting). */
export async function resetAllProgress(uid: string): Promise<void> {
  const snap = await getDocs(collection(db, 'users', uid, 'progress'))
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}
