import './Input.css';

const Input = ({ 
  label, 
  type = 'text', 
  name,
  placeholder, 
  value, 
  onChange, 
  error,
  required = false,
  disabled = false,
  icon,
  className = ''
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label">
          {icon && <span className="input-label-icon">{icon}</span>}
          {label}
        </label>
      )}
      <div className="input-wrapper">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`input-field ${error ? 'input-error' : ''}`}
        />
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
