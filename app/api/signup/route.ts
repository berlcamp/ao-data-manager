import { superAdmins } from '@/constants/TrackerConstants'
import { createServerClient } from '@/utils/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { type AccountTypes } from '@/types'

export async function POST (req: NextRequest) {
  // Only super admins can create accounts
  const { data: { user } } = await createServerClient().auth.getUser()

  if (!user?.email || !superAdmins.includes(user.email)) {
    return NextResponse.json({ error_message: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { item }: { item: AccountTypes } = await req.json()

  // Signup to supabase auth system
  const { data: signUpData, error } = await supabase.auth.admin.createUser({
    email: item.email,
    password: item.temp_password,
    email_confirm: true
  })

  if (error) {
    // Email already registered by another system on this Supabase project:
    // link the existing auth user instead of creating a new one
    if (/already (been )?registered/i.test(error.message)) {
      const { data: existingId, error: lookupError } = await supabase.rpc(
        'get_auth_user_id_by_email',
        { p_email: item.email }
      )

      if (lookupError || !existingId) {
        return NextResponse.json({ error_message: lookupError?.message ?? error.message })
      }

      return NextResponse.json({ error_message: '', insert_id: existingId, existing: true })
    }

    return NextResponse.json({ error_message: error.message })
  } else {
    const newUser: any = signUpData
    return NextResponse.json({ error_message: '', insert_id: newUser.user.id, existing: false })
  }
}
