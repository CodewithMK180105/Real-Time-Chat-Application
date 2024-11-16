const Button = ({
    className,
    type,
    label,
    disabled,
    onClick
}) => {
  return (
    <div>
        <button
            type={type || 'button'}
            className={`px-4 py-2 w-full bg-blue-500 text-white font-semibold rounded-lg shadow-md 
                        hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 
                        focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed 
                        transition ease-in-out duration-200 ${className || ''}`}
            disabled={disabled || false}
            onClick={onClick}
        >
            {label || "Button"}
        </button>

    </div>
  )
}

export default Button
