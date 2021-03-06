import React from 'react';

const TextInput = (props) => {
  const error = props.error === 'Required' ? null : props.error;
  return (
    <div className={`${props.className} form-group`}>
      <label htmlFor={props.name}>
        {props.label}
        :
      </label>
      <input
        className={error && 'error-field'}
        type={props.type || 'text'}
        name={props.name}
        id={props.name}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        disabled={props.disabled}
        onKeyPress={props.onKeyPress}
        onKeyDown={props.onKeyDown}
        min={props.minDate}
        max={props.maxDate} />
      {error ? <p className="error-msg">{error}</p> : null}
    </div>
  );
};

export default TextInput;
