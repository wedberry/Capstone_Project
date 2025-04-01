export function Button({ className, children, ...props }) {
    return (
      <button className={`px-4 py-2 rounded-md bg-blue-500 text-white ${className}`} {...props}>
        {children}
      </button>
    );
  }

export function Input({ type = "text", value, onChange, placeholder }) {
return (
    <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    
    />
);
}
  