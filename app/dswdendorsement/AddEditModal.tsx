import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { DswdEndorsementTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { endorsementTypes } from '@/constants/TrackerConstants'
import { useSupabase } from '@/context/SupabaseProvider'
import { useDispatch, useSelector } from 'react-redux'
// import { useSupabase } from '@/context/SupabaseProvider'

interface ModalProps {
  hideModal: () => void
  editData: DswdEndorsementTypes | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()
  const [saving, setSaving] = useState(false)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<DswdEndorsementTypes>({
    mode: 'onSubmit',
  })

  const onSubmit = async (formdata: DswdEndorsementTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: DswdEndorsementTypes) => {
    const params = {
      type: formdata.type,
      date: formdata.date,
      client_himself: formdata.client_himself,
      docdor: formdata.docdor,
      relationship: formdata.relationship,
      amount: formdata.amount,
      patient_fullname: formdata.patient_fullname,
      patient_age: formdata.patient_age,
      patient_gender: formdata.patient_gender,
      patient_address: formdata.patient_address,
      patient_category: formdata.patient_category,
      requester_fullname: formdata.requester_fullname,
      requester_age: formdata.requester_age,
      requester_gender: formdata.requester_gender,
      requester_address: formdata.requester_address,
      requester_category: formdata.requester_category,
    }

    try {
      const { data, error } = await supabase
        .from('adm_dswd_endorsements')
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

  const handleUpdate = async (formdata: DswdEndorsementTypes) => {
    if (!editData) return

    const params = {
      type: formdata.type,
      date: formdata.date,
      client_himself: formdata.client_himself,
      docdor: formdata.docdor,
      relationship: formdata.relationship,
      amount: formdata.amount,
      patient_fullname: formdata.patient_fullname,
      patient_age: formdata.patient_age,
      patient_gender: formdata.patient_gender,
      patient_address: formdata.patient_address,
      patient_category: formdata.patient_category,
      requester_fullname: formdata.requester_fullname,
      requester_age: formdata.requester_age,
      requester_gender: formdata.requester_gender,
      requester_address: formdata.requester_address,
      requester_category: formdata.requester_category,
    }

    try {
      const { data, error } = await supabase
        .from('adm_dswd_endorsements')
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

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const dateString = year + '-' + month + '-' + day

    reset({
      // request details
      date: editData ? editData.date : dateString,
      type: editData ? editData.type : '',
      client_himself: editData ? editData.client_himself : false,
      docdor: editData ? editData.docdor : '',
      relationship: editData ? editData.relationship : '',
      amount: editData ? editData.amount : '',
      patient_fullname: editData ? editData.patient_fullname : '',
      patient_age: editData ? editData.patient_age : '',
      patient_gender: editData ? editData.patient_gender : '',
      patient_address: editData ? editData.patient_address : '',
      patient_category: editData ? editData.patient_category : '',
      requester_fullname: editData ? editData.requester_fullname : '',
      requester_age: editData ? editData.requester_age : '',
      requester_gender: editData ? editData.requester_gender : '',
      requester_address: editData ? editData.requester_address : '',
      requester_category: editData ? editData.requester_category : '',
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
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Request Type</div>
                      <div>
                        <select
                          {...register('type', { required: true })}
                          className="app__input_standard">
                          <option value="">Select</option>
                          {endorsementTypes.map((item, index) => (
                            <option
                              key={index}
                              value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        {errors.type && (
                          <div className="app__error_message">
                            Request type is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Amount</div>
                      <div>
                        <input
                          {...register('amount')}
                          type="number"
                          step="any"
                          placeholder="Amount"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Docdor</div>
                      <div>
                        <input
                          {...register('docdor')}
                          type="text"
                          placeholder="Doctor"
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
                          {...register('patient_fullname')}
                          type="text"
                          placeholder="Patient Fullname"
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
                          {...register('patient_gender')}
                          className="app__input_standard">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Age</div>
                      <div>
                        <input
                          {...register('patient_age')}
                          type="number"
                          placeholder="Patient Age"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Address</div>
                      <div>
                        <input
                          {...register('patient_address')}
                          type="text"
                          placeholder="Patient Address"
                          className="app__input_standard"
                        />
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
                          placeholder="Patient Category"
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
                      <div className="app__label_standard">Fullname</div>
                      <div>
                        <input
                          {...register('requester_fullname')}
                          type="text"
                          placeholder="Requester Fullname"
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
                          {...register('requester_gender')}
                          className="app__input_standard">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Age</div>
                      <div>
                        <input
                          {...register('requester_age')}
                          type="number"
                          placeholder="Requester Age"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Address</div>
                      <div>
                        <input
                          {...register('requester_address')}
                          type="text"
                          placeholder="Requester Address"
                          className="app__input_standard"
                        />
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
                          placeholder="Requester Category"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
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
