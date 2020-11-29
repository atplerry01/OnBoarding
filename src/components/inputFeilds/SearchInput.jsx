import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchInput = (props) => (
  <div className={`${props.className} form-group search-box`}>
    <FiSearch className="search-icon" />
    <input
      type="search"
      name={props.name}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder || 'Search...'}
    />
  </div>
);

export default SearchInput;
