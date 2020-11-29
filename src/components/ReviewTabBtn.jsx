import React from 'react';

export default (props) => (
  <li
    onClick={props.handleClick} onKeyPress={() => {}}
    role="presentation" className={props.className}
  >
    {props.text}
  </li>
);
