import { type MouseEventHandler } from 'react'

export interface SelectUserNamesProps {
  settingsData: any[]
  multiple: boolean
  type: string
  handleManagerChange: (newdata: any[], type: string) => void
  title: string
}

export interface searchUser {
  firstname: string
  middlename: string
  lastname: string
  uuid?: string
  id: string
}

export interface namesType {
  firstname: string
  middlename: string
  lastname: string
  avatar_url: string
  id: string
}

export interface settingsDataTypes {
  access_type: string
  data: namesType
}

export interface CustomButtonTypes {
  isDisabled?: boolean
  btnType?: 'button' | 'submit'
  containerStyles?: string
  textStyles?: string
  title: string
  leftIcon?: any
  handleClick?: MouseEventHandler<HTMLButtonElement>
}

export interface NotificationTypes {
  id?: string
  message: string
  created_at?: string
  url: string
  type: string
  user_id: string
  dum_document_tracker_id: string
  reference_table?: string
  is_read?: boolean
}

export interface AccountDetailsForm {
  firstname: string
  middlename: string
  lastname: string
}

export interface StickiesTypes {
  id: string
  tracker_id: string
  user_id: string
  note: string
  color: string
  tracker: DocumentTypes
}

export interface DocumentRemarksTypes {
  id?: string
  user_id: string
  timestamp: string
  user: string
  remarks: string
  tracker_id: string
}
export interface DocumentFlowchartTypes {
  id: string
  date: string
  time: string
  user: string
  user_id: string
  title: string
  message: string
  tracker_id: string
}
export interface DocumentTypes {
  id: string
  type: string
  specify: string
  agency: string
  location: string
  requester: string
  activity_date: string
  contact_number: string
  status: string
  cheque_no: string
  particulars: string
  date_received: string
  user_id: string
  recent_remarks: DocumentRemarksTypes
  asenso_user: AccountTypes
  attachments: { name: string }[]
  amount: string
  received_from: string
  routing_no: number
  routing_slip_no: string
  received_by: string
}

export interface AccountTypes {
  id: string
  firstname: string
  middlename: string
  lastname: string
  status: string
  password: string
  avatar_url: string
  email: string
  org_id: string
  created_by: string
  temp_password: string
}

export interface DocTypes {
  id: string
  type: string
  shortcut: string
  isChecked?: boolean
}

export interface AttachmentTypes {
  id: string
  name: string
}

export interface UserAccessTypes {
  user_id: string
  type: string
  asenso_user: namesType
}

export interface RisPoTypes {
  id: string
  po_number: string
  type: string
  quantity: number
  po_date: string
  description: string
  created_by: string
  asenso_user: AccountTypes
  adm_ris: RisTypes[]
  remaining_quantity?: number
}

export interface RisTypes {
  id: number
  ris_number: string
  po_id: string
  requester: string
  date_requested: string
  department_id: string
  quantity: number
  purpose: string
  created_by: string
  vehicle_id: string
  asenso_user: AccountTypes
  vehicle: RisVehicleTypes
  purchase_order: RisPoTypes
  department: RisDepartmentTypes
}

export interface RisVehicleTypes {
  id: string
  name: string
  plate_number: string
}

export interface RisDepartmentTypes {
  id: string
  name: string
  office: string
}

export interface VoterBarangayTypes {
  id: string
  address: string
}

export interface ServiceProviderTypes {
  id: string
  new: string
  name: string
  new_number: string
  contact_number: string
}

export interface VoterTypes {
  id?: string
  fullname: string
  address?: string
  category?: string
  precinct?: string
  category_recommended: string
  category_prior_bsk: string
  petition: string
  service_provider?: ServiceProviderTypes
}

export interface MedicalAssistanceTypes {
  id: string
  fullname: string
  patient_previous_name: string
  requester_category: string
  patient_category: string
  patient_profession: string
  guarantee_no: string
  guarantee_no_text: string
  patient_barangay_id: string
  requester_barangay_id: string
  bill_type: string
  request_type: string
  patient_type: string
  request_type_others: string
  patient_contact_number: string
  requester_contact_number: string
  barangay: string
  address: string
  reason: string
  gender: string
  age: string
  total_amount: string
  status: string
  referral: string
  referral_address: string
  referral_profession: string
  referral_gender: string
  referral_previous_name: string
  referral_age: string
  referral_remarks: string
  is_patient_registered: string
  is_referral_registered: string
  is_maip: string
  relationship: string
  sp: string
  referral_sp: string
  philhealth: string
  room_type: string
  category: string
  hospital: string
  pcso_amount: string
  dswd_amount: string
  amount: string
  include_on_bill: string
  granted_amount: string
  lgu_amount: string
  families: FamilyCompositionTypes[]
  doctors: DoctorTypes[]
  professional_fee: string
  remarks: string
  patient_remarks: string
  diagnosis: string
  cause_of_death: string
  deleted: string
  date: string
  date_approved: string
  date_death: string
  purpose: string
  funeral: string
  requested_amount: string
  hospital_or_funeral: string
  total_professional_fee: string
  professional_fee_remarks: string
  professional_fee_discount_senior: string
  professional_fee_discount_philhealth: string
  professional_fee_discount_others: string
  reason_not_ward: string
  reason_not_mhars: string
  from_lgu: string
  sffo_amounts: string
  others_amounts: string
  other_expenses: string
  date_admitted: string
  date_discharged: string
  pwd_discount: string
  gl_no: number
  total_bill: string
  excess_bill: string
  phc_status: string
  requester: string
  patient_barangay: BarangayTypes
  requester_barangay: BarangayTypes
  pharmacy: string
  pharmacy_code: string
  date_requested: string
  other_details: MedicalAssistanceTypes
  medicines: MedicineItemTypes[]
  patient_id: string
}

export interface BarangayTypes {
  id: string
  barangay: string
  municipality: string
}

export interface FamilyCompositionTypes {
  fullname: string
  category: string
  remarks: string
  ref: number
}

export interface MedicineItemTypes {
  description: string
  unit: string
  quantity: string
  price: string
  ref: number
}

export interface DoctorTypes {
  fullname: string
  professional_fee: string
  ref: number
}

export interface PatientTypes {
  fullname: string
}

export interface DswdEndorsementTypes {
  id: string
  type: string
  status: string
  date: string
  client_himself: boolean
  docdor: string
  relationship: string
  amount: string
  patient_fullname: string
  patient_age: string
  patient_gender: string
  patient_address: string
  patient_category: string
  requester_fullname: string
  requester_age: string
  requester_gender: string
  requester_address: string
  requester_category: string
  other: string
  hospital: string
  endorsement_no: number
  endorsement_type: string
}
