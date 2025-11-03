import './Select.css';

const Select = ({ 
  label, 
  name,
  options, 
  value, 
  onChange, 
  placeholder = 'Seçiniz...',
  required = false,
  disabled = false,
  icon,
  className = ''
}) => {
  return (
    <div className={`select-group ${className}`}>
      {label && (
        <label className="select-label">
          {icon && <span className="select-label-icon">{icon}</span>}
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="select-field"
      >
        <option value="">{placeholder}</option>
        {options && options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
