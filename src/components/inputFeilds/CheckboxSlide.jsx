/* eslint-disable react/destructuring-assignment */
import React from 'react';

export default (props) => (
  <div className={`${props.className} form-group flex`}>
    <p style={{ paddingTop: '8px', marginLeft: '10px' }}>{props.label}</p>
    <label className="switch">
      <input
        type="checkbox"
        name={props.name}
        value={props.value}
        id={props.name}
        checked={props.checked}
        onChange={props.onChange}
      />
      <span className={`slider ${props.value === 'yes' ? 'yes' : 'no'}`} />
    </label>
  </div>
);
