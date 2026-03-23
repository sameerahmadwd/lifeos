import React from 'react';

const Input = ({ label, icon: Icon, type, placeholder, value, onChange, name, required = false }) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="form-input-container">
        {Icon && <Icon className="form-icon" />}
        <input 
          type={type} 
          name={name}
          className="form-input" 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          required={required}
        />
      </div>
    </div>
  );
};

export default Input;
