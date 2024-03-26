import { CustomButton } from '@/components/index'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  docRouting,
  documentTypes,
  statusList,
} from '@/constants/TrackerConstants'
import { cn } from '@/lib/utils'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface FilterTypes {
  setFilterTypes: (type: any[]) => void
  setFilterStatus: (status: string) => void
  setFilterKeyword: (keyword: string) => void
  setFilterCurrentRoute: (route: string) => void
  setFilterRoute: (route: string) => void
  setFilterDateForwarded: (date: Date | undefined) => void
}

const FormSchema = z.object({
  dateForwarded: z.date().optional(),
  currentRoute: z.string().optional(),
  status: z.string().optional(),
  forwardedTo: z.string().optional(),
  keyword: z.string().optional(),
})

const Filters = ({
  setFilterTypes,
  setFilterStatus,
  setFilterKeyword,
  setFilterCurrentRoute,
  setFilterRoute,
  setFilterDateForwarded,
}: FilterTypes) => {
  //
  const [selectedTypes, setSelectedTypes] = useState<string[] | []>([])

  const [toggleAdvanceFilter, setToggleAdvanceFilter] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      dateForwarded: undefined,
      status: '',
      currentRoute: '',
      forwardedTo: '',
      keyword: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setFilterTypes(selectedTypes)
    setFilterStatus(data.status || '')
    setFilterKeyword(data.keyword || '')
    setFilterCurrentRoute(data.currentRoute || '')
    setFilterRoute(data.forwardedTo || '')
    setFilterDateForwarded(data.dateForwarded)
  }

  // clear all filters
  const handleClear = () => {
    form.reset()

    setFilterTypes([])
    setSelectedTypes([])
    setFilterStatus('')
    setFilterKeyword('')
    setFilterCurrentRoute('')
    setFilterRoute('')
    setFilterDateForwarded(undefined)

    setToggleAdvanceFilter(false)
  }

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="items-center space-x-2 space-y-1">
            <div className="items-center inline-flex app__filter_field_container">
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="app__form_label">Search</FormLabel>
                    <Input
                      placeholder="Search keyword"
                      {...field}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className="items-center inline-flex app__filter_field_container">
              <FormField
                control={form.control}
                name="currentRoute"
                render={({ field }) => (
                  <FormItem className="w-[240px]">
                    <FormLabel className="app__form_label">
                      Current Route
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Route" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {docRouting.map((route, index) => (
                          <SelectItem
                            key={index}
                            value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <div className="items-center inline-flex app__filter_field_container">
              <FormItem className="flex flex-col">
                <FormLabel className="app__form_label">Type</FormLabel>
                <Listbox
                  value={selectedTypes}
                  onChange={setSelectedTypes}
                  multiple>
                  <div className="relative w-72">
                    <Listbox.Button className="app__listbox_btn">
                      <span className="block truncate text-xs">
                        Type: {selectedTypes.map((type) => type).join(', ')}
                      </span>
                      <span className="app__listbox_icon">
                        <ChevronDownIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0">
                      <Listbox.Options className="app__listbox_options">
                        {documentTypes.map((doc, itemIdx) => (
                          <Listbox.Option
                            key={itemIdx}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? 'bg-amber-50 text-amber-900'
                                  : 'text-gray-900'
                              }`
                            }
                            value={doc.type}>
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate text-xs ${
                                    selected ? 'font-medium' : 'font-normal'
                                  }`}>
                                  {doc.type}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </FormItem>
            </div>
            <div className="items-center inline-flex app__filter_field_container">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="w-[240px]">
                    <FormLabel className="app__form_label">Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusList.map((s, index) => (
                          <SelectItem
                            key={index}
                            value={s.status}>
                            {s.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div
            onClick={() => setToggleAdvanceFilter(!toggleAdvanceFilter)}
            className="mt-4 inline-flex space-x-1 text-sm cursor-pointer">
            {toggleAdvanceFilter ? (
              <ChevronUp className="h-5 w-5 text-blue-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-blue-600" />
            )}
            <span className="text-blue-600 font-medium">Advance Filters</span>
          </div>
          {/* Advance Filters */}
          <div
            className={`items-center space-x-2 space-y-1 ${
              !toggleAdvanceFilter && 'hidden'
            }`}>
            <div className="items-center inline-flex app__filter_field_container">
              <FormField
                control={form.control}
                name="dateForwarded"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="app__form_label">
                      Date Forwarded to Other Department
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}>
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>
            <div className="items-center inline-flex app__filter_field_container">
              <FormField
                control={form.control}
                name="forwardedTo"
                render={({ field }) => (
                  <FormItem className="w-[240px]">
                    <FormLabel className="app__form_label">&nbsp;</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {docRouting.map((route, index) => (
                          <SelectItem
                            key={index}
                            value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <CustomButton
              containerStyles="app__btn_green"
              title="Apply Filter"
              btnType="submit"
              handleClick={form.handleSubmit(onSubmit)}
            />
            <CustomButton
              containerStyles="app__btn_gray"
              title="Clear Filter"
              btnType="button"
              handleClick={handleClear}
            />
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Filters
