import React from 'react';

const setOptionValue = (option) => {
  if (option.abbreviation) {
    return (option.abbreviation.includes('...') && '') || option.abbreviation;
  } else if (option.code) {
    return (option.code.includes('...') && '') || option.code;
  }
  return '';
};

const SelectInput = (props) => {
  const error = props.error === 'Required' ? null : props.error;
  const options = props.options
    .map((option) => (
      typeof option === 'object' ?
        (
          <option
            value={setOptionValue(option)}
            key={option.name}>
            {option.name}
          </option>
        ) : (
          <option
            value={option && option.includes('...') ? '' : option}
            key={option}>
            {option}
          </option>
        )));
  return (
    <div className={`${props.className} form-group`}>
      <label htmlFor={props.name}>
        {props.label}
        :
      </label>
      <select
        className={error && 'error-field'}
        name={props.name}
        id={props.name}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        disabled={props.disabled}
      >
        {options}
      </select>
      {error ? <p className="error-msg">{error}</p> : null}
    </div>
  );
};

export default SelectInput;
