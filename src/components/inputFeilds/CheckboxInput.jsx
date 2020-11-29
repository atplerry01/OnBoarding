import React from 'react';

export default (props) => (
  <div className={`${props.className} form-group`}>
    <input
      type="checkbox" name={props.name}
      value={props.value} id={props.name}
      checked={props.checked} onChange={props.onChange} />
    <label htmlFor={props.name}>
      {props.label}
    </label>
  </div>
);
