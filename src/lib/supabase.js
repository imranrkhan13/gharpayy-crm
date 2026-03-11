import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// KEY FIX: convert empty strings to null so UUID fields don't throw errors
const clean = (obj) => {
  if (!obj) return obj

  const out = {}

  for (const [k, v] of Object.entries(obj)) {

    // convert empty string → null
    if (v === '' || v === undefined) {
      out[k] = null
      continue
    }

    // prevent invalid UUID
    if (k === 'agent_id' && typeof v === 'string' && v.length < 10) {
      out[k] = null
      continue
    }

    out[k] = v
  }

  return out
}

export const leadsAPI = {
  getAll:  ()      => supabase.from('leads').select('*, agent:agents(id,name)').order('created_at', { ascending: false }),
  getById: (id)    => supabase.from('leads').select('*, agent:agents(id,name)').eq('id', id).single(),
  create:  (data)  => supabase.from('leads').insert(clean(data)).select('*, agent:agents(id,name)').single(),
  update: (id, d) => {

    // remove joined objects before sending to DB
    const { agent, ...safeData } = d

    console.log("Updating lead with:", safeData)

    return supabase
      .from('leads')
      .update(clean({ ...safeData, updated_at: new Date().toISOString() }))
      .eq('id', id)
      .select('*, agent:agents(id,name)')
      .single()
  },
}
export const agentsAPI = {
  getAll:  ()      => supabase.from('agents').select('*').order('name'),
  create:  (data)  => supabase.from('agents').insert(clean(data)).select().single(),
  update:  (id, d) => supabase.from('agents').update(clean(d)).eq('id', id).select().single(),
  delete:  (id)    => supabase.from('agents').delete().eq('id', id),
}
export const ownersAPI = {
  getAll:  ()      => supabase.from('owners').select('*').order('name'),
  create:  (data)  => supabase.from('owners').insert(clean(data)).select().single(),
  update:  (id, d) => supabase.from('owners').update(clean(d)).eq('id', id).select().single(),
  delete:  (id)    => supabase.from('owners').delete().eq('id', id),
}
export const propertiesAPI = {
  getAll:  ()      => supabase.from('properties').select('*, owner:owners(id,name,company)').order('name'),
  create:  (data)  => supabase.from('properties').insert(clean(data)).select('*, owner:owners(id,name,company)').single(),
  update:  (id, d) => supabase.from('properties').update(clean(d)).eq('id', id).select('*, owner:owners(id,name,company)').single(),
  delete:  (id)    => supabase.from('properties').delete().eq('id', id),
}
export const roomsAPI = {
  getAll:  ()      => supabase.from('rooms').select('*, property:properties(id,name,area)').order('name'),
  create:  (data)  => supabase.from('rooms').insert(clean(data)).select().single(),
  update:  (id, d) => supabase.from('rooms').update(clean({ ...d, updated_at: new Date().toISOString() })).eq('id', id).select().single(),
  delete:  (id)    => supabase.from('rooms').delete().eq('id', id),
}
export const bedsAPI = {
  getAll:   ()      => supabase.from('beds').select('*, room:rooms(id,name,property_id)').order('label'),
  create:   (data)  => supabase.from('beds').insert(clean(data)).select().single(),
  update:   (id, d) => supabase.from('beds').update(clean({ ...d, updated_at: new Date().toISOString() })).eq('id', id).select().single(),
  delete:   (id)    => supabase.from('beds').delete().eq('id', id),
}
export const visitsAPI = {
  getAll:  ()      => supabase.from('visits').select('*, lead:leads(id,name,phone), property:properties(id,name,area), agent:agents(id,name)').order('scheduled_at', { ascending: false }),
  create:  (data)  => supabase.from('visits').insert(clean(data)).select('*, lead:leads(id,name,phone), property:properties(id,name,area), agent:agents(id,name)').single(),
  update:  (id, d) => supabase.from('visits').update(clean({ ...d, updated_at: new Date().toISOString() })).eq('id', id).select().single(),
  delete:  (id)    => supabase.from('visits').delete().eq('id', id),
}
export const bookingsAPI = {
  getAll:  ()      => supabase.from('bookings').select('*, lead:leads(id,name,phone), property:properties(id,name,area), room:rooms(id,name), bed:beds(id,label), agent:agents(id,name)').order('created_at', { ascending: false }),
  create:  (data)  => supabase.from('bookings').insert(clean(data)).select().single(),
  update:  (id, d) => supabase.from('bookings').update(clean({ ...d, updated_at: new Date().toISOString() })).eq('id', id).select().single(),
  delete:  (id)    => supabase.from('bookings').delete().eq('id', id),
}
export const conversationsAPI = {
  getByLead: (lid) => supabase.from('conversations').select('*').eq('lead_id', lid).order('created_at'),
  send:      (d)   => supabase.from('conversations').insert(clean(d)).select().single(),
}
export const activityAPI = {
  getByLead: (lid) => supabase.from('activity_log').select('*, agent:agents(id,name)').eq('lead_id', lid).order('created_at', { ascending: false }),
  create:    (d)   => supabase.from('activity_log').insert(clean(d)).select().single(),
}
export const notificationsAPI = {
  getAll:      ()  => supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
  markAllRead: ()  => supabase.from('notifications').update({ is_read: true }).eq('is_read', false),
}
export const tasksAPI = {
  getByLead: (leadId) =>
    supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('due_at'),

  create: (data) =>
    supabase
      .from('tasks')
      .insert(data)
      .select()
      .single(),

  update: (id, data) =>
    supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .select()
      .single(),

  delete: (id) =>
    supabase
      .from('tasks')
      .delete()
      .eq('id', id)
}
