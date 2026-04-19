import { Suspense } from 'react'
import { isAuthenticated } from '@/lib/auth'
import AdminPanel from '@/components/AdminPanel'
import AdminLogin from '@/components/AdminLogin'

async function AdminContent() {
  const authed = await isAuthenticated()
  return authed ? <AdminPanel /> : <AdminLogin />
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminContent />
    </Suspense>
  )
}
