import { superAdmins } from '@/constants/TrackerConstants'
import { createServerClient } from '@/utils/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { randomInt } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST (req: NextRequest) {
  // Only super admins can reset passwords
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

  const { id }: { id: string } = await req.json()

  const tempPassword = randomInt(100000, 1000000).toString()

  const { error } = await supabase.auth.admin.updateUserById(id, {
    password: tempPassword
  })

  if (error) {
    return NextResponse.json({ error_message: error.message })
  }

  const { error: error2 } = await supabase
    .from('asenso_users')
    .update({ temp_password: tempPassword })
    .eq('id', id)

  if (error2) {
    return NextResponse.json({ error_message: error2.message })
  }

  return NextResponse.json({ error_message: '', temp_password: tempPassword })
}
