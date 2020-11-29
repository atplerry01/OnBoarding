import React from 'react';

export default (props) => (
  <label className={props.className}>
    <input
      type="radio" name={props.name} value={props.value}
      checked={props.checked} onChange={props.onChange} />
    {props.label}
  </label>
);
