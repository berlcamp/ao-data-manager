import React, { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { CustomButton } from '@/components/index'
import type { VoterBarangayTypes } from '@/types'

interface FilterTypes {
  setFilterKeyword: (keyword: string) => void
  setFilterAddress: (address: string) => void
  barangays: VoterBarangayTypes[]
}

const Filters = ({ setFilterKeyword, setFilterAddress, barangays }: FilterTypes) => {
  const [keyword, setKeyword] = useState<string>('')
  const [address, setAddress] = useState<string>('')

  const handleApply = () => {
    if (keyword.trim() === '') return

    // pass filter values to parent
    // remove extra whitespace as well
    setFilterKeyword(keyword.replace(/\s+/g, ' '))
    setFilterAddress(address)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (keyword.trim() === '') return

    // pass filter values to parent
    // remove extra whitespace as well
    setFilterKeyword(keyword.replace(/\s+/g, ' '))
    setFilterAddress(address)
  }

  // On enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleSubmit(e)
    }
  }

  // clear all filters
  const handleClear = () => {
    setFilterKeyword('')
    setKeyword('')
    setFilterAddress('')
    setAddress('')
  }

  return (
    <div className=''>
      <div className='items-center space-x-2 space-y-1'>
        <form onSubmit={handleSubmit} className='items-center inline-flex'>
          <div className='app__filter_container'>
            <MagnifyingGlassIcon className="w-4 h-4 mr-1"/>
            <input
              placeholder='Search'
              value={keyword}
              onKeyDown={handleKeyDown}
              onChange={e => setKeyword(e.target.value)}
              className="app__filter_input"/>
          </div>
          <div className='app__filter_container'>
            <MagnifyingGlassIcon className="w-4 h-4 mr-1"/>
            <select
              value={address}
              onKeyDown={handleKeyDown}
              onChange={e => setAddress(e.target.value)}
              className="app__filter_input">
                <option>Choose Barangay</option>
                {
                  barangays.map((item: VoterBarangayTypes, index: number) =>
                    <option key={index}>{item.address}</option>
                  )
                }
            </select>
          </div>
        </form>
      </div>
      <div className='flex items-center space-x-2 mt-4'>
        <CustomButton
              containerStyles='app__btn_green'
              title='Apply Filter'
              btnType='button'
              handleClick={handleApply}
            />
          <CustomButton
              containerStyles='app__btn_gray'
              title='Clear Filter'
              btnType='button'
              handleClick={handleClear}
            />
      </div>
    </div>
  )
}

export default Filters
