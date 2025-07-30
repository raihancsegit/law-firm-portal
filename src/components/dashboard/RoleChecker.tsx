'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RoleChecker({ allowedRoles, children }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !profile || !allowedRoles.includes(profile.role!)) {
        setIsAuthorized(false)
        router.push('/unauthorized') // একটি /unauthorized পেজ তৈরি করুন
      } else {
        setIsAuthorized(true)
      }
      setIsLoading(false)
    }

    checkRole()
  }, [supabase, router, allowedRoles])

  if (isLoading) {
    return <div>Loading & Verifying Access...</div> // অথবা একটি সুন্দর লোডার
  }

  if (isAuthorized) {
    return <>{children}</>
  }

  // isAuthorized false হলে, এটি /unauthorized-এ রিডাইরেক্ট করবে
  return null
}