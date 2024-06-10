import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { MedicalAssistanceTypes, MedicineItemTypes } from '@/types'
import { XMarkIcon } from '@heroicons/react/20/solid'
import axios from 'axios'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { pharmacyList } from '@/constants/TrackerConstants'
import { useSupabase } from '@/context/SupabaseProvider'
import { format } from 'date-fns'
import { useDispatch, useSelector } from 'react-redux'
// import { useSupabase } from '@/context/SupabaseProvider'

interface ModalProps {
  hideModal: () => void
  editData: MedicalAssistanceTypes | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()
  const [saving, setSaving] = useState(false)

  // Search names auto complete
  const [searchType, setSearchType] = useState('')
  const [searchPatientName, setSearchPatientName] = useState('')
  useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] =
    useState<MedicalAssistanceTypes | null>(
      editData ? editData.other_details : null
    )
  // End: Search names auto complete

  // medicine items
  const [medicines, setMedicines] = useState<MedicineItemTypes[] | []>(
    editData ? editData.medicines : []
  )
  const [medicineDescription, setMedicineDescription] = useState('')
  const [medicineUnit, setMedicineUnit] = useState('')
  const [medicineQuantity, setMedicineQuantity] = useState('')
  const [medicinePrice, setMedicinePrice] = useState('')

  const apiUrl = process.env.NEXT_PUBLIC_AO_API_URL ?? ''

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<MedicalAssistanceTypes>({
    mode: 'onSubmit',
  })

  const onSubmit = async (formdata: MedicalAssistanceTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: MedicalAssistanceTypes) => {
    const params = {
      status: 'For Evaluation',
      fullname: selectedPatient?.fullname,
      requester: selectedPatient?.referral,
      barangay: selectedPatient?.patient_barangay?.barangay,
      address: selectedPatient?.patient_barangay?.municipality,
      pharmacy: formdata.pharmacy,
      date_requested: formdata.date_requested,
      patient_id: selectedPatient?.id,
      other_details: selectedPatient,
      medicines,
    }

    try {
      const { data, error } = await supabase
        .from('adm_medicine_clients')
        .insert(params)
        .select()

      if (error) throw new Error(error.message)

      const newData = {
        ...params,
        id: data[0].id,
      }
      dispatch(updateList([newData, ...globallist]))

      // Updating showing text in redux
      dispatch(
        updateResultCounter({
          showing: Number(resultsCounter.showing) + 1,
          results: Number(resultsCounter.results) + 1,
        })
      )

      setToast('success', 'Successfully saved.')
      setSaving(false)
      hideModal()
    } catch (error) {
      console.error('error', error)
    }
  }

  const handleUpdate = async (formdata: MedicalAssistanceTypes) => {
    if (!editData) return

    const params = {
      pharmacy: formdata.pharmacy,
      date_requested: formdata.date_requested,
      medicines,
    }

    try {
      const { data, error } = await supabase
        .from('adm_medicine_clients')
        .update(params)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)

      // Append new data in redux
      const items = [...globallist]
      const updatedData = {
        ...params,
        id: editData.id,
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      setToast('success', 'Successfully saved.')
      setSaving(false)
      hideModal()
    } catch (error) {
      console.error('error', error)
    }
  }

  const handleSearchUser = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const searchTerm = e.target.value

    if (type === 'patient_name') {
      setSearchType('patient_name')
      setSearchPatientName(searchTerm)
    }

    if (searchTerm.trim().length < 3) {
      setSearchResults([])
      return
    }

    const params = {
      filterKeyword: searchTerm.trim(),
      filterAddress: '',
      take: 10,
      skip: 0,
    }

    try {
      await axios
        .get(`${apiUrl}/aoassist/search`, { params })
        .then((response) => {
          setSearchResults([
            ...response.data.results,
            // { fullname: searchTerm.trim() },
          ])
        })
    } catch (error) {
      console.error('error', error)
    }
  }

  const handleSelected = (item: MedicalAssistanceTypes, type: string) => {
    if (type === 'patient_name') {
      setSelectedPatient(item)
      setSearchPatientName('')
    }
    setSearchResults([])
  }

  const handleRemoveSelected = (type: string) => {
    if (type === 'patient_name') {
      setSelectedPatient(null)
    }
  }

  const handleAddMedicine = () => {
    if (medicineDescription === '') return

    const newRow = {
      description: medicineDescription,
      unit: medicineUnit,
      quantity: medicineQuantity,
      price: medicinePrice,
      ref: Math.floor(Math.random() * 20000) + 1,
    }

    setMedicines([...medicines, newRow])
    setMedicineDescription('')
    setMedicineUnit('')
    setMedicineQuantity('')
    setMedicinePrice('')
  }

  const handleRemoveMedicine = (item: MedicineItemTypes) => {
    const updatedData = medicines.filter((i: any) => i.ref !== item.ref)
    setMedicines(updatedData)
  }

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const dateString = year + '-' + month + '-' + day

    reset({
      // request details
      date_requested: editData ? editData.date_requested : dateString,
      pharmacy: editData ? editData.pharmacy : dateString,
    })
  }, [editData, reset])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2_large">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">Request Form</h5>
              <button
                disabled={saving}
                onClick={hideModal}
                type="button"
                className="app__modal_header_btn">
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="app__modal_body">
              <div className="mb-4">
                <fieldset className="border p-4 bg-gray-100">
                  <legend className="text-center text-gray-700 text-lg font-semibold">
                    Request Details
                  </legend>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Date Requested</div>
                      <div>
                        <input
                          {...register('date_requested', { required: true })}
                          type="date"
                          className="app__input_standard"
                        />
                        {errors.date_requested && (
                          <div className="app__error_message">
                            Request Date is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Pharmacy</div>
                      <div>
                        <select
                          {...register('pharmacy', { required: true })}
                          className="app__input_standard">
                          <option value="">Select</option>
                          {pharmacyList.map((pharmacy, index) => (
                            <option
                              key={index}
                              value={pharmacy.pharmacy}>
                              {pharmacy.pharmacy}
                            </option>
                          ))}
                        </select>
                        {errors.pharmacy && (
                          <div className="app__error_message">
                            Pharmacy is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </fieldset>
                <fieldset className="border p-4 mt-8 bg-gray-100">
                  <legend className="text-center text-gray-700 text-lg font-semibold">
                    Patient Details
                  </legend>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Full Name</div>
                      {editData && (
                        <div className="app__label_value">
                          {selectedPatient?.fullname}
                        </div>
                      )}
                      {!editData && (
                        <div>
                          <div className="app__selected_users_container">
                            {selectedPatient && (
                              <div className="w-full flex mb-1">
                                <span className="app__selected_user">
                                  {selectedPatient.fullname}
                                  <XMarkIcon
                                    onClick={() =>
                                      handleRemoveSelected('patient_name')
                                    }
                                    className="w-4 h-4 ml-2 cursor-pointer"
                                  />
                                </span>
                              </div>
                            )}
                            {!selectedPatient && (
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Search Name"
                                  value={searchPatientName}
                                  onChange={async (e) =>
                                    await handleSearchUser(e, 'patient_name')
                                  }
                                  className="app__input_noborder"
                                />

                                {searchType === 'patient_name' &&
                                  searchResults.length > 0 && (
                                    <div className="app__search_user_results_container">
                                      {searchResults.map(
                                        (
                                          item: MedicalAssistanceTypes,
                                          index
                                        ) => (
                                          <div
                                            key={index}
                                            onClick={() =>
                                              handleSelected(
                                                item,
                                                'patient_name'
                                              )
                                            }
                                            className="app__search_user_results !py-2">
                                            <div>{item.fullname}</div>{' '}
                                            <div>
                                              {item.date &&
                                                format(
                                                  new Date(item.date),
                                                  'MMM dd, yyyy'
                                                )}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedPatient && (
                    <>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Previous Name
                          </div>
                          <div className="app__label_value">
                            {selectedPatient?.patient_previous_name}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Service Provider
                          </div>
                          <div className="app__label_value">
                            {selectedPatient?.sp}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Gender</div>
                          <div className="app__label_value">
                            {selectedPatient?.gender}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Category</div>
                          <div className="app__label_value">
                            {selectedPatient?.patient_category}
                          </div>
                        </div>
                      </div>

                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Diagnosis</div>
                          <div className="app__label_value">
                            {selectedPatient?.diagnosis}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Address</div>
                          <div className="app__label_value">
                            {selectedPatient?.patient_barangay?.barangay},{' '}
                            {selectedPatient?.patient_barangay?.municipality}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Age</div>
                          <div className="app__label_value">
                            {selectedPatient?.age}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Remarks</div>
                          <div className="app__label_value">
                            {selectedPatient?.patient_remarks}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </fieldset>
                {selectedPatient && (
                  <>
                    <fieldset className="border p-4 mt-8 bg-gray-100">
                      <legend className="text-center text-gray-700 text-lg font-semibold">
                        Requester Details
                      </legend>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Requester Full Name
                          </div>
                          <div className="app__label_value">
                            {selectedPatient?.referral}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Requester Previous Name
                          </div>
                          <div className="app__label_value">
                            {selectedPatient?.referral_previous_name}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Requester Service Provider
                          </div>
                          <div className="app__label_value">
                            {selectedPatient?.referral_sp}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Gender</div>
                          <div className="app__label_value">
                            {selectedPatient?.referral_gender}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Category</div>
                          <div className="app__label_value">
                            {selectedPatient?.requester_category}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Relationship To Patient
                          </div>
                          <div className="app__label_value">
                            {selectedPatient?.relationship}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Address</div>
                          <div className="app__label_value">
                            {selectedPatient?.requester_barangay?.barangay},{' '}
                            {selectedPatient?.requester_barangay?.municipality}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Age</div>
                          <div className="app__label_value">
                            {selectedPatient?.referral_age}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Remarks</div>
                          <div className="app__label_value">
                            {selectedPatient?.referral_remarks}
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    <fieldset className="border p-4 mt-8 bg-gray-100">
                      <legend className="text-center text-gray-700 text-lg font-semibold">
                        Medicines
                      </legend>
                      <div className="app__form_field_container">
                        <div className="flex items-start justify-start space-x-2">
                          <div>
                            <div className="app__label_standard">
                              Description
                            </div>
                            <div>
                              <input
                                type="text"
                                value={medicineDescription}
                                className="app__input_standard"
                                onChange={(e) =>
                                  setMedicineDescription(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <div className="app__label_standard">Unit</div>
                            <div>
                              <input
                                type="text"
                                className="app__input_standard"
                                value={medicineUnit}
                                onChange={(e) =>
                                  setMedicineUnit(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <div className="app__label_standard">Quantity</div>
                            <div>
                              <input
                                type="number"
                                step="any"
                                className="app__input_standard"
                                value={medicineQuantity}
                                onChange={(e) =>
                                  setMedicineQuantity(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <div className="app__label_standard">Price</div>
                            <div>
                              <input
                                type="number"
                                step="any"
                                className="app__input_standard"
                                value={medicinePrice}
                                onChange={(e) =>
                                  setMedicinePrice(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <div>&nbsp;</div>
                            <div>
                              <CustomButton
                                btnType="button"
                                // isDisabled={saving}
                                title="Add"
                                handleClick={handleAddMedicine}
                                containerStyles="app__btn_blue"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_container">
                        <table className="w-full text-sm text-left text-gray-600">
                          {medicines.length > 0 && (
                            <thead className="app__thead">
                              <tr>
                                <th className="app__th">Description</th>
                                <th className="app__th">Unit</th>
                                <th className="app__th">Quantity</th>
                                <th className="app__th">Price</th>
                                <th className="app__th"></th>
                              </tr>
                            </thead>
                          )}
                          <tbody className="app__thead">
                            {medicines.map((item: MedicineItemTypes, index) => (
                              <tr
                                key={index}
                                className="app__tr">
                                <td className="app__td">{item.description}</td>
                                <td className="app__td">{item.unit}</td>
                                <td className="app__td">{item.quantity}</td>
                                <td className="app__td">{item.price}</td>
                                <td className="app__td">
                                  <CustomButton
                                    btnType="button"
                                    isDisabled={saving}
                                    title="Remove"
                                    handleClick={() =>
                                      handleRemoveMedicine(item)
                                    }
                                    containerStyles="app__btn_red_xs"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </fieldset>
                  </>
                )}
                {!selectedPatient && <div className="h-32">&nbsp;</div>}
              </div>
              <div className="app__modal_footer">
                {selectedPatient && (
                  <CustomButton
                    btnType="submit"
                    isDisabled={saving}
                    title={saving ? 'Saving...' : 'Submit'}
                    containerStyles="app__btn_green"
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddEditModal
