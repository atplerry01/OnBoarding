import React from 'react';

export default (props) => (
  <span className={props.className}>
    {props.name}
    {<br />}
    <span className="p-value">{props.value}</span>
  </span>
);
