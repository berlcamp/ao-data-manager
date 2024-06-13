import Image from 'next/image'

export default function LogoHeader() {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex items-start justify-evenly">
          <div className="flex items-center justify-center space-x-2">
            <Image
              src="/images/bagongpilipinas.png"
              width={60}
              height={60}
              alt="alt"
              className="mx-auto"
            />
            <Image
              src="/images/ozamiz.png"
              width={60}
              height={60}
              alt="alt"
              className="mx-auto"
            />
          </div>
          <div className="text-center">
            <div className="text-xs font-bold">REPUBLIC OF THE PHILIPPINES</div>
            <div className="text-sm text-blue-600 font-bold -mt-1">
              OFFICE OF THE CITY MAYOR
            </div>
            <div className="text-lg font-bold -mt-1">CITY OF OZAMIZ</div>
            <div className="text-[8px] font-bold -mt-1">
              TELEFAX NO: (088) 521-1390
            </div>
            <div className="text-[8px] font-bold -mt-2">
              MOBILE NO: (+63) 910-734-2013
            </div>
            <div className="text-[8px] font-bold -mt-2">
              EMAIL: ASENSOOZAMIZMAYOR@GMAIL.COM
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Image
              src="/images/misoc.png"
              width={70}
              height={70}
              alt="alt"
              className="mx-auto"
            />
            <Image
              src="/images/ao.png"
              width={70}
              height={70}
              alt="alt"
              className="mx-auto"
            />
          </div>
        </div>
      </td>
    </tr>
  )
}
