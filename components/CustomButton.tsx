import type { CustomButtonTypes } from '@/types'

function CustomButton({
  isDisabled,
  btnType,
  containerStyles,
  textStyles,
  title,
  leftIcon,
  handleClick,
}: CustomButtonTypes) {
  return (
    <button
      disabled={isDisabled}
      type={btnType ?? 'button'}
      className={`flex items-center space-x-2 ${containerStyles ?? ''}`}
      onClick={handleClick}>
      {leftIcon && leftIcon}
      <span className={`${textStyles ?? ''}`}>{title}</span>
    </button>
  )
}

export default CustomButton
