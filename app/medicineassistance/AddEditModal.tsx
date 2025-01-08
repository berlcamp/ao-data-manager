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
import { addresses, pharmacyList } from '@/constants/TrackerConstants'
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
    setValue,
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
    const pharmacy = pharmacyList.find((p) => p.pharmacy === formdata.pharmacy)

    const params = {
      status: 'For Evaluation',
      pharmacy_code: pharmacy?.code || null,
      patient_id: selectedPatient?.id || null,
      medicines,
      date_requested: formdata.date_requested,
      pharmacy: formdata.pharmacy,
      remarks: formdata.remarks,
      fullname: formdata.fullname,
      sp: formdata.sp,
      gender: formdata.gender,
      patient_category: formdata.patient_category,
      diagnosis: formdata.diagnosis,
      address: formdata.address,
      age: formdata.age,
      patient_remarks: formdata.patient_remarks,
      referral: formdata.referral,
      referral_sp: formdata.referral_sp,
      referral_gender: formdata.referral_gender,
      requester_category: formdata.requester_category,
      relationship: formdata.relationship,
      referral_address: formdata.referral_address,
      referral_age: formdata.referral_age,
      referral_remarks: formdata.referral_remarks,
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

    const pharmacy = pharmacyList.find((p) => p.pharmacy === formdata.pharmacy)

    const params = {
      pharmacy_code: pharmacy?.code,
      medicines,
      date_requested: formdata.date_requested,
      pharmacy: formdata.pharmacy,
      remarks: formdata.remarks,
      fullname: formdata.fullname,
      sp: formdata.sp,
      gender: formdata.gender,
      patient_category: formdata.patient_category,
      diagnosis: formdata.diagnosis,
      address: formdata.address,
      age: formdata.age,
      patient_remarks: formdata.patient_remarks,
      referral: formdata.referral,
      referral_sp: formdata.referral_sp,
      referral_gender: formdata.referral_gender,
      requester_category: formdata.requester_category,
      relationship: formdata.relationship,
      referral_address: formdata.referral_address,
      referral_age: formdata.referral_age,
      referral_remarks: formdata.referral_remarks,
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

      setValue('fullname', item.fullname)
      setValue('referral', item.referral)
      setValue('patient_previous_name', item.patient_previous_name)
      setValue('sp', item.sp)
      setValue('gender', item.gender)
      setValue('patient_category', item.patient_category)
      setValue('diagnosis', item.diagnosis)
      setValue('age', item.age)
      setValue(
        'address',
        `${item?.patient_barangay?.municipality}, ${item?.patient_barangay?.barangay}`
      )
      setValue('patient_remarks', item.patient_remarks)
      setValue('referral', item.referral)
      setValue('referral_previous_name', item.referral_previous_name)
      setValue('referral_sp', item.referral_sp)
      setValue('referral_gender', item.referral_gender)
      setValue('requester_category', item.requester_category)
      setValue('relationship', item.relationship)
      setValue('referral_age', item.referral_age)
      setValue(
        'referral_address',
        `${item?.requester_barangay?.municipality}, ${item?.requester_barangay?.barangay}`
      )
      setValue('referral_remarks', item.referral_remarks)
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

  // Function to handle price change for each medicine
  const handlePriceChange = (index: number, newPrice: string) => {
    // Create a new array with the updated price
    const updatedMedicines = medicines.map((item, idx) =>
      idx === index ? { ...item, price: newPrice } : item
    )
    setMedicines(updatedMedicines)
    console.log('updatedMedicines', updatedMedicines)
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
      pharmacy: editData ? editData.pharmacy : '',
      remarks: editData ? editData.remarks : '',
      fullname: editData ? editData.fullname : '',
      sp: editData ? editData.sp : '',
      gender: editData ? editData.gender : '',
      patient_category: editData ? editData.patient_category : '',
      diagnosis: editData ? editData.diagnosis : '',
      address: editData ? editData.address : '',
      age: editData ? editData.age : '',
      patient_remarks: editData ? editData.patient_remarks : '',
      referral: editData ? editData.referral : '',
      referral_sp: editData ? editData.referral_sp : '',
      referral_gender: editData ? editData.referral_gender : '',
      requester_category: editData ? editData.requester_category : '',
      relationship: editData ? editData.relationship : '',
      referral_address: editData ? editData.referral_address : '',
      referral_age: editData ? editData.referral_age : '',
      referral_remarks: editData ? editData.referral_remarks : '',
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
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Remarks</div>
                      <div>
                        <textarea
                          {...register('remarks')}
                          placeholder="Remarks"
                          className="app__input_standard"
                        />
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
                      <div className="app__label_standard">Fullname</div>
                      <div>
                        <input
                          {...register('fullname', { required: true })}
                          placeholder="Fullname"
                          className="app__input_standard"
                        />
                        {errors.fullname && (
                          <div className="app__error_message">
                            Fullname is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Full Name (Search from AO System)
                      </div>
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
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Service Provider
                      </div>
                      <div>
                        <input
                          {...register('sp')}
                          placeholder="Fullname"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Gender</div>
                      <div>
                        <select
                          {...register('gender')}
                          className="app__select_standard">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Category</div>
                      <div>
                        <input
                          {...register('patient_category')}
                          placeholder="Category"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Diagnosis</div>
                      <div>
                        <input
                          {...register('diagnosis')}
                          placeholder="Diagnosis"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Address</div>
                      <div className="flex space-x-2">
                        <select
                          {...register('address', { required: true })}
                          className="app__select_standard">
                          <option value="">Choose Address</option>
                          {addresses.map((add, k) => (
                            <option
                              key={k}
                              value={add}>
                              {add}
                            </option>
                          ))}
                        </select>

                        {errors.address && (
                          <div className="app__error_message">
                            Address is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Age</div>
                      <div>
                        <input
                          {...register('age')}
                          placeholder="Age"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Remarks</div>
                      <div>
                        <input
                          {...register('patient_remarks')}
                          placeholder="Remarks"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border p-4 mt-8 bg-gray-100">
                  <legend className="text-center text-gray-700 text-lg font-semibold">
                    Requester Details
                  </legend>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Requester Full Name
                      </div>
                      <div>
                        <input
                          {...register('referral')}
                          placeholder="Requester"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Requester Service Provider
                      </div>
                      <div>
                        <input
                          {...register('referral_sp')}
                          placeholder="SP"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Gender</div>
                      <div>
                        <select
                          {...register('referral_gender')}
                          className="app__select_standard">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Category</div>
                      <div>
                        <input
                          {...register('requester_category')}
                          placeholder="Category"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Relationship To Patient
                      </div>
                      <div>
                        <input
                          {...register('relationship')}
                          placeholder="Relationship To Patient"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Address</div>
                      <div className="flex space-x-2">
                        <select
                          {...register('referral_address')}
                          className="app__select_standard">
                          <option value="">Choose Address</option>
                          {addresses.map((add, k) => (
                            <option
                              key={k}
                              value={add}>
                              {add}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Age</div>
                      <div>
                        <input
                          {...register('referral_age')}
                          placeholder="Age"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Remarks</div>
                      <div>
                        <input
                          {...register('referral_remarks')}
                          placeholder="Remarks"
                          className="app__input_standard"
                        />
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
                        <div className="app__label_standard">Description</div>
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
                            onChange={(e) => setMedicineUnit(e.target.value)}
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
                            onChange={(e) => setMedicinePrice(e.target.value)}
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
                            <td className="app__td">
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) =>
                                  handlePriceChange(index, e.target.value)
                                }
                                className="app__input"
                              />
                            </td>
                            <td className="app__td">
                              <CustomButton
                                btnType="button"
                                isDisabled={saving}
                                title="Remove"
                                handleClick={() => handleRemoveMedicine(item)}
                                containerStyles="app__btn_red_xs"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </fieldset>
              </div>
              <div className="app__modal_footer">
                <CustomButton
                  btnType="submit"
                  isDisabled={saving}
                  title={saving ? 'Saving...' : 'Submit'}
                  containerStyles="app__btn_green"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddEditModal
