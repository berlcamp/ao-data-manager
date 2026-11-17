'use client'
import { ConfirmModal } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { TrashIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface IpItem {
  id: number
  ip: string
  label: string | null
}

const SETTING_KEY = 'ip_whitelist_enabled'

export default function IpWhitelistSettings() {
  const { supabase } = useSupabase()
  const { setToast } = useFilter()
  const router = useRouter()

  const [loaded, setLoaded] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ips, setIps] = useState<IpItem[]>([])
  const [currentIp, setCurrentIp] = useState('')
  const [newIp, setNewIp] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [confirmToggle, setConfirmToggle] = useState(false)
  const [removeId, setRemoveId] = useState<number | null>(null)

  const fetchData = async () => {
    const [{ data: setting, error: e1 }, { data: list, error: e2 }] =
      await Promise.all([
        supabase
          .from('adm_system_settings')
          .select('value')
          .eq('key', SETTING_KEY)
          .maybeSingle(),
        supabase.from('adm_ip_whitelists').select('id, ip, label').order('id'),
      ])

    if (e1 || e2) {
      setToast('error', 'Error loading IP whitelist settings.')
      console.error(e1 ?? e2)
    }

    setEnabled(setting?.value === true)
    setIps(list ?? [])
    setLoaded(true)
  }

  useEffect(() => {
    void fetchData()
    void (async () => {
      try {
        const res = await fetch('/api/ip')
        const data = await res.json()
        setCurrentIp(String(data.ip ?? ''))
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const saveToggle = async (value: boolean) => {
    setSaving(true)
    const { error } = await supabase
      .from('adm_system_settings')
      .upsert({ key: SETTING_KEY, value, updated_at: new Date().toISOString() })
    setSaving(false)
    setConfirmToggle(false)

    if (error) {
      setToast('error', 'Error saving, please reload the page and try again.')
      return
    }
    setEnabled(value)
    setToast(
      'success',
      value ? 'IP whitelisting enabled' : 'IP whitelisting disabled',
    )
    router.refresh()
  }

  const handleToggle = () => {
    // Turning on restricts every non super admin user, so confirm first
    if (!enabled) setConfirmToggle(true)
    else void saveToggle(false)
  }

  const isValidIp = (value: string) => {
    const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
    const ipv6 = /^[0-9a-fA-F:]+$/
    return ipv4.test(value) || (value.includes(':') && ipv6.test(value))
  }

  const addIp = async (ip: string, label: string) => {
    const value = ip.trim()
    if (!isValidIp(value)) {
      setToast('error', 'Please enter a valid IP address.')
      return
    }
    if (ips.some((item) => item.ip.trim() === value)) {
      setToast('error', 'This IP address is already whitelisted.')
      return
    }

    const { data, error } = await supabase
      .from('adm_ip_whitelists')
      .insert({ ip: value, label: label.trim() || null })
      .select('id, ip, label')
      .single()

    if (error) {
      setToast('error', 'Error saving, please reload the page and try again.')
      return
    }
    setIps([...ips, data])
    setNewIp('')
    setNewLabel('')
    setToast('success', 'IP address added')
    router.refresh()
  }

  const handleConfirmedRemove = async () => {
    if (removeId === null) return
    const { error } = await supabase
      .from('adm_ip_whitelists')
      .delete()
      .eq('id', removeId)

    if (error) {
      setToast('error', 'Error saving, please reload the page and try again.')
    } else {
      setIps(ips.filter((item) => item.id !== removeId))
      setToast('success', 'IP address removed')
      router.refresh()
    }
    setRemoveId(null)
  }

  if (!loaded) return null

  const currentIpListed = ips.some((item) => item.ip.trim() === currentIp)

  return (
    <div className="mb-6">
      <div className="app__label_standard">IP Whitelisting:</div>
      <div className="bg-white p-3 border border-gray-300 rounded-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm text-gray-600">
            When enabled, users can only access the system from the IP addresses
            listed below. The super admin can access the system from anywhere.
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Toggle IP whitelisting"
            disabled={saving}
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              enabled ? 'bg-green-600' : 'bg-gray-300'
            } ${saving ? 'opacity-50' : ''}`}>
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <div className="text-sm">
          Status:{' '}
          <span
            className={
              enabled ? 'text-green-700 font-semibold' : 'text-gray-500'
            }>
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {currentIp && (
          <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
            <span>
              Your current IP: <span className="font-mono">{currentIp}</span>
            </span>
            {currentIpListed ? (
              <span className="text-green-700">(whitelisted)</span>
            ) : (
              <button
                type="button"
                onClick={async () =>
                  await addIp(currentIp, 'Added from settings')
                }
                className="app__btn_blue_xs">
                Add my current IP
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="IP address"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            className="app__input_standard max-w-xs"
          />
          <input
            type="text"
            placeholder="Label (optional, e.g. Main Office)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="app__input_standard max-w-xs"
          />
          <button
            type="button"
            onClick={async () => await addIp(newIp, newLabel)}
            className="app__btn_green">
            Add IP
          </button>
        </div>

        <div className="border border-gray-200 rounded-sm divide-y">
          {ips.length === 0 && (
            <div className="p-2 text-sm text-gray-500">
              No whitelisted IP addresses yet.
            </div>
          )}
          {ips.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 text-sm">
              <div>
                <span className="font-mono">{item.ip}</span>
                {item.label && (
                  <span className="ml-2 text-gray-500">{item.label}</span>
                )}
              </div>
              <TrashIcon
                onClick={() => setRemoveId(item.id)}
                className="w-4 h-4 text-red-600 cursor-pointer"
                aria-label={`Remove ${item.ip}`}
              />
            </div>
          ))}
        </div>
      </div>

      {confirmToggle && (
        <ConfirmModal
          header="Enable IP Whitelisting"
          btnText="Enable"
          message="Users outside the whitelisted IP addresses will be blocked from the system. Continue?"
          onConfirm={async () => await saveToggle(true)}
          onCancel={() => setConfirmToggle(false)}
        />
      )}
      {removeId !== null && (
        <ConfirmModal
          header="Confirmation"
          btnText="Confirm"
          message="Are you sure you want to remove this IP address from the whitelist?"
          onConfirm={handleConfirmedRemove}
          onCancel={() => setRemoveId(null)}
        />
      )}
    </div>
  )
}
