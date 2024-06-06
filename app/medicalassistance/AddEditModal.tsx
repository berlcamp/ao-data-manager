import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type {
  BarangayTypes,
  DoctorTypes,
  FamilyCompositionTypes,
  MedicalAssistanceTypes,
  PatientTypes,
} from '@/types'
import { XMarkIcon } from '@heroicons/react/20/solid'
import axios from 'axios'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useDispatch, useSelector } from 'react-redux'
// import { useSupabase } from '@/context/SupabaseProvider'

interface ModalProps {
  hideModal: () => void
  editData: MedicalAssistanceTypes | null
}

const hospitals = ['Faith', 'St.Joseph']

const requestTypes = [
  'MAIP (DOH)',
  'DSWD - Cash Assistance',
  'DSWD - Medical Assistance',
  'DSWD - Burial Assistance',
  'Philippine Heart Center',
]

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  // const { session } = useSupabase()
  const [saving, setSaving] = useState(false)
  const [requestType, setRequestType] = useState(
    editData ? editData.request_type : ''
  )
  const [barangays, setBarangays] = useState<BarangayTypes[] | []>([])

  // Search names auto complete
  const [searchType, setSearchType] = useState('')
  const [searchPatientName, setSearchPatientName] = useState('')
  const [searchPatientPreviousName, setSearchPatientPreviousName] = useState('')
  const [searchRequesterName, setSearchRequesterName] = useState('')
  const [searchRequesterPreviousName, setSearchRequesterPreviousName] =
    useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientTypes | null>(
    editData?.fullname ? { fullname: editData.fullname } : null
  )
  const [selectedPatientPreviousName, setSelectedPatientPreviousName] =
    useState<PatientTypes | null>(
      editData?.patient_previous_name
        ? { fullname: editData.patient_previous_name }
        : null
    )
  const [selectedRequester, setSelectedRequester] =
    useState<PatientTypes | null>(
      editData?.referral ? { fullname: editData.referral } : null
    )
  const [selectedRequesterPreviousName, setSelectedRequesterPreviousName] =
    useState<PatientTypes | null>(
      editData?.referral_previous_name
        ? { fullname: editData.referral_previous_name }
        : null
    )
  // End: Search names auto complete

  // doctors
  const [doctors, setDoctors] = useState<DoctorTypes[] | []>(
    editData ? editData.doctors : []
  )
  const [doctorfullname, setDoctorFullname] = useState('')
  const [doctorProfessionalFee, setDoctorProfessionalFee] = useState('')

  // family compositions
  const [families, setFamilies] = useState<FamilyCompositionTypes[] | []>(
    editData ? editData.families : []
  )
  const [memberfullname, setMemberFullname] = useState('')
  const [memberCategory, setMemberCategory] = useState('')
  const [memberRemarks, setMemberRemarks] = useState('')

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
      ...formdata,
      status: 'For Evaluation',
      fullname: selectedPatient?.fullname,
      patient_previous_name: selectedPatientPreviousName?.fullname,
      referral: selectedRequester?.fullname,
      referral_previous_name: selectedRequesterPreviousName?.fullname,
      families,
      doctors,
    }
    console.log('params', params)

    try {
      await axios.post(`${apiUrl}/distassist`, params).then((response) => {
        console.log(response.data.status)

        // Append new data in redux
        const patientAddress = barangays.find(
          (item) =>
            item.id.toString() === formdata.patient_barangay_id.toString()
        )
        const requesterAddress = barangays.find(
          (item) => item.id === formdata.requester_barangay_id
        )
        const newData = {
          ...params,
          patient_barangay: patientAddress,
          requester_barangay: requesterAddress,
          id: response.data.id,
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
      })
    } catch (error) {
      console.error('error', error)
    }
  }

  const handleUpdate = async (formdata: MedicalAssistanceTypes) => {
    if (!editData) return

    const params = {
      ...formdata,
      id: editData.id,
      fullname: selectedPatient?.fullname,
      patient_previous_name: selectedPatientPreviousName?.fullname,
      referral: selectedRequester?.fullname,
      referral_previous_name: selectedRequesterPreviousName?.fullname,
      families,
      doctors,
    }

    try {
      await axios.put(`${apiUrl}/distassist`, params).then((response) => {
        console.log(response.data.status)

        // Append new data in redux
        const patientAddress = barangays.find(
          (item) =>
            item.id.toString() === formdata.patient_barangay_id.toString()
        )
        const requesterAddress = barangays.find(
          (item) =>
            item.id.toString() === formdata.requester_barangay_id.toString()
        )
        const updatedData = {
          ...params,
          patient_barangay: patientAddress,
          requester_barangay: requesterAddress,
          id: editData.id,
        }

        const items = [...globallist]
        const foundIndex = items.findIndex((x) => x.id === updatedData.id)
        items[foundIndex] = { ...items[foundIndex], ...updatedData }
        dispatch(updateList(items))

        setToast('success', 'Successfully saved.')
        setSaving(false)
        hideModal()
      })
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
    if (type === 'patient_previous_name') {
      setSearchType('patient_previous_name')
      setSearchPatientPreviousName(searchTerm)
    }
    if (type === 'requester_name') {
      setSearchType('requester_name')
      setSearchRequesterName(searchTerm)
    }
    if (type === 'referral_previous_name') {
      setSearchType('referral_previous_name')
      setSearchRequesterPreviousName(searchTerm)
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
      await axios.get(`${apiUrl}/aorv/search`, { params }).then((response) => {
        setSearchResults([
          ...response.data.results2023,
          { fullname: searchTerm.trim() },
        ])
      })
    } catch (error) {
      console.error('error', error)
    }
  }

  const handleSelected = (item: PatientTypes, type: string) => {
    if (type === 'patient_name') {
      setSelectedPatient(item)
      setSearchPatientName('')
    }
    if (type === 'patient_previous_name') {
      setSelectedPatientPreviousName(item)
      setSearchPatientPreviousName('')
    }
    if (type === 'requester_name') {
      setSelectedRequester(item)
      setSearchRequesterName('')
    }
    if (type === 'referral_previous_name') {
      setSelectedRequesterPreviousName(item)
      setSearchRequesterPreviousName('')
    }

    setSearchResults([])
  }

  const handleRemoveSelected = (type: string) => {
    if (type === 'patient_name') {
      setSelectedPatient(null)
    }
    if (type === 'patient_previous_name') {
      setSelectedPatientPreviousName(null)
    }
    if (type === 'requester_name') {
      setSelectedRequester(null)
    }
    if (type === 'referral_previous_name') {
      setSelectedRequesterPreviousName(null)
    }
  }

  const handleAddMember = () => {
    if (memberfullname === '') return

    const newRow = {
      fullname: memberfullname,
      category: memberCategory,
      remarks: memberRemarks,
      ref: Math.floor(Math.random() * 20000) + 1,
    }

    setFamilies([...families, newRow])
    setMemberFullname('')
    setMemberCategory('')
    setMemberRemarks('')
  }

  const handleRemoveMember = (item: FamilyCompositionTypes) => {
    const updatedData = families.filter((i: any) => i.ref !== item.ref)
    setFamilies(updatedData)
  }

  const handleAddDoctor = () => {
    if (doctorfullname === '' || doctorProfessionalFee === '') return

    const newRow = {
      fullname: doctorfullname,
      professional_fee: doctorProfessionalFee,
      ref: Math.floor(Math.random() * 20000) + 1,
    }

    setDoctors([...doctors, newRow])
    setDoctorFullname('')
    setDoctorProfessionalFee('')
  }

  const handleRemoveDoctor = (item: DoctorTypes) => {
    const updatedData = doctors.filter((i: any) => i.ref !== item.ref)
    setDoctors(updatedData)
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
      request_type: editData ? editData.request_type : '',
      date: editData ? editData.date : dateString,
      date_approved: editData ? editData.date_approved : '',
      date_death: editData ? editData.date_death : '',
      date_discharged: editData ? editData.date_discharged : '',
      date_admitted: editData ? editData.date_admitted : '',
      hospital: editData ? editData.hospital : '',
      room_type: editData ? editData.room_type : '',
      philhealth: editData ? editData.philhealth : '',
      pcso_amount: editData ? editData.pcso_amount : '',
      dswd_amount: editData ? editData.dswd_amount : '',
      total_professional_fee: editData ? editData.total_professional_fee : '',
      amount: editData ? editData.amount : '',
      reason_not_ward: editData ? editData.reason_not_ward : '',
      reason_not_mhars: editData ? editData.reason_not_mhars : '',
      purpose: editData ? editData.purpose : '',
      hospital_or_funeral: editData ? editData.hospital_or_funeral : '',
      funeral: editData ? editData.funeral : '',
      requested_amount: editData ? editData.requested_amount : '',
      // patient details
      fullname: editData ? editData.fullname : '',
      patient_previous_name: editData ? editData.patient_previous_name : '',
      sp: editData ? editData.sp : '',
      gender: editData ? editData.gender : '',
      patient_category: editData ? editData.patient_category : '',
      diagnosis: editData ? editData.diagnosis : '',
      cause_of_death: editData ? editData.cause_of_death : '',
      patient_barangay_id: editData ? editData.patient_barangay_id : '',
      age: editData ? editData.age : '',
      patient_remarks: editData ? editData.patient_remarks : '',
      // requester details
      referral: editData ? editData.referral : '',
      referral_previous_name: editData ? editData.referral_previous_name : '',
      referral_sp: editData ? editData.referral_sp : '',
      referral_gender: editData ? editData.referral_gender : '',
      requester_category: editData ? editData.requester_category : '',
      relationship: editData ? editData.relationship : '',
      requester_barangay_id: editData ? editData.requester_barangay_id : '',
      referral_age: editData ? editData.referral_age : '',
      referral_remarks: editData ? editData.referral_remarks : '',
    })
  }, [editData, reset])

  // Featch data
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        console.log('refetching barangays')
        const apiUrl = process.env.NEXT_PUBLIC_AO_API_URL ?? ''
        const response = await axios.get(`${apiUrl}/distassist/barangays`)
        setBarangays(response.data)

        // prepopulate barangay
        reset({
          patient_barangay_id: editData ? editData.patient_barangay_id : '',
          requester_barangay_id: editData ? editData.requester_barangay_id : '',
        })
      } catch (error) {
        console.error('An error occurred', error)
      }
    }
    void fetchBarangays()
  }, [])

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
                      <div className="app__label_standard">Request Type</div>
                      <div>
                        <select
                          {...register('request_type', { required: true })}
                          value={requestType}
                          onChange={(e) => setRequestType(e.target.value)}
                          className="app__input_standard">
                          <option value="">Select</option>
                          {requestTypes.map((type, index) => (
                            <option
                              key={index}
                              value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.request_type && (
                          <div className="app__error_message">
                            Request Type is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Date Requested</div>
                      <div>
                        <input
                          {...register('date', { required: true })}
                          type="date"
                          className="app__input_standard"
                        />
                        {errors.date && (
                          <div className="app__error_message">
                            Request Date is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Medical Assistances */}
                  {(requestType === 'MAIP (DOH)' ||
                    requestType === 'DSWD - Medical Assistance') && (
                    <>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Hospital</div>
                          <div>
                            <select
                              {...register('hospital', { required: true })}
                              className="app__input_standard">
                              <option value="">Select</option>
                              {hospitals.map((hospital, index) => (
                                <option
                                  key={index}
                                  value={hospital}>
                                  {hospital}
                                </option>
                              ))}
                            </select>
                            {errors.hospital && (
                              <div className="app__error_message">
                                Hospital is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Room Type</div>
                          <div>
                            <input
                              {...register('room_type', { required: true })}
                              placeholder="Room Type"
                              type="text"
                              className="app__input_standard"
                            />
                            {errors.room_type && (
                              <div className="app__error_message">
                                Room Type is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            PhilHealth Amount
                          </div>
                          <div>
                            <input
                              {...register('philhealth')}
                              placeholder="PhilHealth Discount"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            PCSO Discount
                          </div>
                          <div>
                            <input
                              {...register('pcso_amount')}
                              placeholder="PCSO Discount"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">DSWD Amount</div>
                          <div>
                            <input
                              {...register('dswd_amount')}
                              placeholder="DSWD Discount"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Excess in Professional Fee
                          </div>
                          <div>
                            <input
                              {...register('total_professional_fee')}
                              placeholder="Excess in Professional Fee"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Bill Amount</div>
                          <div>
                            <input
                              {...register('amount', { required: true })}
                              placeholder="Bill Amount"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                            {errors.amount && (
                              <div className="app__error_message">
                                Bill Amount is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Reason Not Ward
                          </div>
                          <div>
                            <textarea
                              {...register('reason_not_ward')}
                              placeholder="Reason Not Ward"
                              className="app__input_standard resize-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Reason Not Mhars
                          </div>
                          <div>
                            <textarea
                              {...register('reason_not_mhars')}
                              placeholder="Reason Not Mhars"
                              className="app__input_standard resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Philippine Heart Center */}
                  {requestType === 'Philippine Heart Center' && (
                    <>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Date Admitted
                          </div>
                          <div>
                            <input
                              {...register('date_admitted')}
                              type="date"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Date Discharged
                          </div>
                          <div>
                            <input
                              {...register('date_discharged')}
                              type="date"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Room Type</div>
                          <div>
                            <input
                              {...register('room_type', { required: true })}
                              placeholder="Room Type"
                              type="text"
                              className="app__input_standard"
                            />
                            {errors.room_type && (
                              <div className="app__error_message">
                                Room Type is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            PhilHealth Discount
                          </div>
                          <div>
                            <input
                              {...register('philhealth')}
                              placeholder="PhilHealth Discount"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            PWD Discount
                          </div>
                          <div>
                            <input
                              {...register('pwd_discount')}
                              placeholder="PWD Discount"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Bill Amount</div>
                          <div>
                            <input
                              {...register('amount', { required: true })}
                              placeholder="Bill Amount"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                            {errors.amount && (
                              <div className="app__error_message">
                                Bill Amount is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Cash Assistance */}
                  {requestType === 'DSWD - Cash Assistance' && (
                    <>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Date Approved
                          </div>
                          <div>
                            <input
                              {...register('date_approved')}
                              type="date"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Purpose</div>
                          <div>
                            <input
                              {...register('purpose')}
                              type="text"
                              placeholder="Purpose"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Amount Requested
                          </div>
                          <div>
                            <input
                              {...register('requested_amount')}
                              type="number"
                              step="any"
                              placeholder="Amount Requested"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Hospital or Funeral Homes
                          </div>
                          <div>
                            <input
                              {...register('hospital_or_funeral')}
                              placeholder="Hospital or Funeral Ho"
                              className="app__input_standard"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Burial Assistance */}
                  {requestType === 'DSWD - Burial Assistance' && (
                    <>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Date of Death
                          </div>
                          <div>
                            <input
                              {...register('date_death', { required: true })}
                              type="date"
                              className="app__input_standard"
                            />
                            {errors.date_death && (
                              <div className="app__error_message">
                                Date of Death is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Funeral Homes
                          </div>
                          <div>
                            <input
                              {...register('funeral', { required: true })}
                              type="text"
                              className="app__input_standard"
                            />
                            {errors.funeral && (
                              <div className="app__error_message">
                                Funeral Homes is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_inline_half">
                        <div className="w-full">
                          <div className="app__label_standard">Bill Amount</div>
                          <div>
                            <input
                              {...register('amount', { required: true })}
                              placeholder="Bill Amount"
                              type="number"
                              step="any"
                              className="app__input_standard"
                            />
                            {errors.amount && (
                              <div className="app__error_message">
                                Bill Amount is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </fieldset>
                <fieldset className="border p-4 mt-8 bg-gray-100">
                  {requestType === 'DSWD - Burial Assistance' ? (
                    <legend className="text-center text-gray-700 text-lg font-semibold">
                      Deceased Details
                    </legend>
                  ) : (
                    <legend className="text-center text-gray-700 text-lg font-semibold">
                      Patient Details
                    </legend>
                  )}
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Full Name</div>
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
                                      (item: PatientTypes, index) => (
                                        <div
                                          key={index}
                                          onClick={() =>
                                            handleSelected(item, 'patient_name')
                                          }
                                          className="app__search_user_results">
                                          {item.fullname}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Previous Name</div>
                      <div>
                        <div className="app__selected_users_container">
                          {selectedPatientPreviousName && (
                            <div className="w-full flex mb-1">
                              <span className="app__selected_user">
                                {selectedPatientPreviousName.fullname}
                                <XMarkIcon
                                  onClick={() =>
                                    handleRemoveSelected(
                                      'patient_previous_name'
                                    )
                                  }
                                  className="w-4 h-4 ml-2 cursor-pointer"
                                />
                              </span>
                            </div>
                          )}
                          {!selectedPatientPreviousName && (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search Name"
                                value={searchPatientPreviousName}
                                onChange={async (e) =>
                                  await handleSearchUser(
                                    e,
                                    'patient_previous_name'
                                  )
                                }
                                className="app__input_noborder"
                              />

                              {searchType === 'patient_previous_name' &&
                                searchResults.length > 0 && (
                                  <div className="app__search_user_results_container">
                                    {searchResults.map(
                                      (item: PatientTypes, index) => (
                                        <div
                                          key={index}
                                          onClick={() =>
                                            handleSelected(
                                              item,
                                              'patient_previous_name'
                                            )
                                          }
                                          className="app__search_user_results">
                                          {item.fullname}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
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
                          type="text"
                          placeholder="Service Provider"
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
                          {...register('gender', { required: true })}
                          className="app__input_standard">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        {errors.gender && (
                          <div className="app__error_message">
                            Gender is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Category</div>
                      <div>
                        <input
                          {...register('patient_category')}
                          type="text"
                          placeholder="Category"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  {requestType === 'DSWD - Burial Assistance' ? (
                    <div className="app__form_field_inline_half">
                      <div className="w-full">
                        <div className="app__label_standard">
                          Cause of Death
                        </div>
                        <div>
                          <input
                            {...register('cause_of_death')}
                            type="text"
                            placeholder="Diagnosis"
                            className="app__input_standard"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="app__form_field_inline_half">
                      <div className="w-full">
                        <div className="app__label_standard">Diagnosis</div>
                        <div>
                          <input
                            {...register('diagnosis', {
                              required:
                                requestType !== 'DSWD - Cash Assistance',
                            })}
                            type="text"
                            placeholder="Diagnosis"
                            className="app__input_standard"
                          />
                          {errors.diagnosis && (
                            <div className="app__error_message">
                              Diagnosis is required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Address</div>
                      <div>
                        <select
                          {...register('patient_barangay_id', {
                            required: true,
                          })}
                          className="app__input_standard">
                          <option value="">Select</option>
                          {barangays.map(
                            (item: BarangayTypes, index: number) => (
                              <option
                                key={index}
                                value={item.id}>
                                {item.municipality}, {item.barangay}
                              </option>
                            )
                          )}
                        </select>
                        {errors.patient_barangay_id && (
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
                          {...register('age', { required: true })}
                          type="number"
                          step="any"
                          placeholder="Age"
                          className="app__input_standard"
                        />
                        {errors.age && (
                          <div className="app__error_message">
                            Age is required
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
                          {...register('patient_remarks')}
                          placeholder="Remarks"
                          className="app__input_standard resize-none"
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
                        <div className="app__selected_users_container">
                          {selectedRequester && (
                            <div className="w-full flex mb-1">
                              <span className="app__selected_user">
                                {selectedRequester.fullname}
                                <XMarkIcon
                                  onClick={() =>
                                    handleRemoveSelected('requester_name')
                                  }
                                  className="w-4 h-4 ml-2 cursor-pointer"
                                />
                              </span>
                            </div>
                          )}
                          {!selectedRequester && (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search Name"
                                value={searchRequesterName}
                                onChange={async (e) =>
                                  await handleSearchUser(e, 'requester_name')
                                }
                                className="app__input_noborder"
                              />

                              {searchType === 'requester_name' &&
                                searchResults.length > 0 && (
                                  <div className="app__search_user_results_container">
                                    {searchResults.map(
                                      (item: PatientTypes, index) => (
                                        <div
                                          key={index}
                                          onClick={() =>
                                            handleSelected(
                                              item,
                                              'requester_name'
                                            )
                                          }
                                          className="app__search_user_results">
                                          {item.fullname}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Requester Previous Name
                      </div>
                      <div>
                        <div className="app__selected_users_container">
                          {selectedRequesterPreviousName && (
                            <div className="w-full flex mb-1">
                              <span className="app__selected_user">
                                {selectedRequesterPreviousName.fullname}
                                <XMarkIcon
                                  onClick={() =>
                                    handleRemoveSelected(
                                      'referral_previous_name'
                                    )
                                  }
                                  className="w-4 h-4 ml-2 cursor-pointer"
                                />
                              </span>
                            </div>
                          )}
                          {!selectedRequesterPreviousName && (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Search Name"
                                value={searchRequesterPreviousName}
                                onChange={async (e) =>
                                  await handleSearchUser(
                                    e,
                                    'referral_previous_name'
                                  )
                                }
                                className="app__input_noborder"
                              />

                              {searchType === 'referral_previous_name' &&
                                searchResults.length > 0 && (
                                  <div className="app__search_user_results_container">
                                    {searchResults.map(
                                      (item: PatientTypes, index) => (
                                        <div
                                          key={index}
                                          onClick={() =>
                                            handleSelected(
                                              item,
                                              'referral_previous_name'
                                            )
                                          }
                                          className="app__search_user_results">
                                          {item.fullname}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
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
                          type="text"
                          placeholder="Requester Service Provider"
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
                          {...register('referral_gender', { required: true })}
                          className="app__input_standard">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        {errors.referral_gender && (
                          <div className="app__error_message">
                            Gender is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Category</div>
                      <div>
                        <input
                          {...register('requester_category')}
                          type="text"
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
                          type="text"
                          placeholder="Relationship To Patient"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Address</div>
                      <div>
                        <select
                          {...register('requester_barangay_id', {
                            required: true,
                          })}
                          className="app__input_standard">
                          <option value="">Select</option>
                          {barangays.map(
                            (item: BarangayTypes, index: number) => (
                              <option
                                key={index}
                                value={item.id}>
                                {item.municipality}, {item.barangay}
                              </option>
                            )
                          )}
                        </select>
                        {errors.requester_barangay_id && (
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
                          {...register('referral_age', { required: true })}
                          type="number"
                          step="any"
                          placeholder="Age"
                          className="app__input_standard"
                        />
                        {errors.referral_age && (
                          <div className="app__error_message">
                            Age is required
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
                          {...register('referral_remarks')}
                          placeholder="Remarks"
                          className="app__input_standard resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
                <fieldset className="border p-4 mt-8 bg-gray-100">
                  <legend className="text-center text-gray-700 text-lg font-semibold">
                    Family Composition
                  </legend>
                  <div className="app__form_field_container">
                    <div className="flex items-start justify-start space-x-2">
                      <div>
                        <div className="app__label_standard">Fullname</div>
                        <div>
                          <input
                            type="text"
                            value={memberfullname}
                            className="app__input_standard"
                            onChange={(e) => setMemberFullname(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="app__label_standard">Category</div>
                        <div>
                          <input
                            type="text"
                            className="app__input_standard"
                            value={memberCategory}
                            onChange={(e) => setMemberCategory(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="app__label_standard">Remarks</div>
                        <div>
                          <input
                            type="text"
                            className="app__input_standard"
                            value={memberRemarks}
                            onChange={(e) => setMemberRemarks(e.target.value)}
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
                            handleClick={handleAddMember}
                            containerStyles="app__btn_blue"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_container">
                    <table className="w-full text-sm text-left text-gray-600">
                      {families.length > 0 && (
                        <thead className="app__thead">
                          <tr>
                            <th className="app__th">Fullname</th>
                            <th className="app__th">Category</th>
                            <th className="app__th">Remarks</th>
                            <th className="app__th"></th>
                          </tr>
                        </thead>
                      )}
                      <tbody className="app__thead">
                        {families.map((item: FamilyCompositionTypes, index) => (
                          <tr
                            key={index}
                            className="app__tr">
                            <td className="app__td">{item.fullname}</td>
                            <td className="app__td">{item.category}</td>
                            <td className="app__td">{item.remarks}</td>
                            <td className="app__td">
                              <CustomButton
                                btnType="button"
                                isDisabled={saving}
                                title="Remove"
                                handleClick={() => handleRemoveMember(item)}
                                containerStyles="app__btn_red_xs"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </fieldset>
                {requestType !== 'DSWD - Burial Assistance' && (
                  <fieldset className="border p-4 mt-8 bg-gray-100">
                    <legend className="text-center text-gray-700 text-lg font-semibold">
                      Doctor/s Details
                    </legend>
                    <div className="app__form_field_container">
                      <div className="flex items-start justify-start space-x-2">
                        <div>
                          <div className="app__label_standard">
                            Doctor Fullname
                          </div>
                          <div>
                            <input
                              type="text"
                              value={doctorfullname}
                              className="app__input_standard"
                              onChange={(e) =>
                                setDoctorFullname(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <div className="app__label_standard">
                            Professional Fee
                          </div>
                          <div>
                            <input
                              type="number"
                              step="any"
                              className="app__input_standard"
                              value={doctorProfessionalFee}
                              onChange={(e) =>
                                setDoctorProfessionalFee(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <div>&nbsp;</div>
                          <div>
                            <CustomButton
                              btnType="button"
                              isDisabled={saving}
                              title="Add"
                              handleClick={handleAddDoctor}
                              containerStyles="app__btn_blue"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="app__form_field_container">
                      <table className="w-full text-sm text-left text-gray-600">
                        {doctors.length > 0 && (
                          <thead className="app__thead">
                            <tr>
                              <th className="app__th">Doctor Fullname</th>
                              <th className="app__th">Professional Fee</th>
                              <th className="app__th"></th>
                            </tr>
                          </thead>
                        )}
                        <tbody className="app__thead">
                          {doctors.map((item: DoctorTypes, index) => (
                            <tr
                              key={index}
                              className="app__tr">
                              <td className="app__td">{item.fullname}</td>
                              <td className="app__td">
                                {item.professional_fee}
                              </td>
                              <td className="app__td">
                                <CustomButton
                                  btnType="button"
                                  isDisabled={saving}
                                  title="Remove"
                                  handleClick={() => handleRemoveDoctor(item)}
                                  containerStyles="app__btn_red_xs"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </fieldset>
                )}
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
