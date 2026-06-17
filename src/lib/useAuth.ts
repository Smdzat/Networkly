/* ==============================================================
   useAuth — shared auth state hook
   --------------------------------------------------------------
   Subscribes to Firebase auth so any component (nav, lesson page)
   knows the current user. Also exposes a logout helper.
   ============================================================== */
import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  return { user, loading }
}
