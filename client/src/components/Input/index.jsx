const Input = ({
    label= "",
    name= "",
    type= "text",
    className= "",
    isRequired= true,
    placeholder= "",
    value= "",
    onChange= () => {},
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        required={isRequired}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default Input
