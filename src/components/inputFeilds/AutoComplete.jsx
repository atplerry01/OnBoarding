import React, { Component } from 'react';

import TextInput from './TextInput';

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeOption: 0,
      filteredOptions: [],
      showOptions: false,
      userInput: '',
      currentField: ''
    };
  }

  onChange = (e) => {
    const { options, onChange } = this.props;
    const { value, name } = e.currentTarget;

    const filteredOptions = options.filter(
      (optionName) => optionName.toLowerCase().includes(value.toLowerCase()) ||
        optionName.toLowerCase() === 'others'
    );

    this.setState({
      activeOption: 0,
      filteredOptions,
      showOptions: true,
      userInput: value,
      currentField: name
    });
    onChange(e);
  };

  onBlur = (e) => {
    const { onBlur, options } = this.props;
    const { userInput, filteredOptions, activeOption } = this.state;

    if (!options.includes(userInput.toUpperCase())) {
      if (userInput.length < 1) {
        this.setState({
          userInput: ''
        });
      } else {
        this.setState({
          userInput: filteredOptions[activeOption]
        });
        this.props.autoComplete(e.target.name, filteredOptions[activeOption]);
      }
    }
    this.setState({
      showOptions: false,
      currentField: e.target.name
    });
    onBlur(e);
  }

  onMouseDown = (e) => {
    const { innerText } = e.currentTarget;
    const { currentField } = this.state;
    this.setState({
      filteredOptions: [],
      showOptions: false,
      userInput: innerText
    });
    this.props.autoComplete(currentField, innerText);
  };

  onKeyDown = (e) => {
    const { activeOption, filteredOptions, currentField } = this.state;

    if (e.keyCode === 13) {
      this.setState({
        activeOption: 0,
        showOptions: false,
        userInput: filteredOptions[activeOption]
      });
      this.props.autoComplete(currentField, filteredOptions[activeOption]);
    } else if (e.keyCode === 38) {
      if (activeOption === 0) {
        return;
      }
      this.setState({ activeOption: activeOption - 1 });
    } else if (e.keyCode === 40) {
      if (activeOption === filteredOptions.length - 1) {
        return;
      }
      this.setState({ activeOption: activeOption + 1 });
    }
  };

  render() {
    const {
      onChange,
      onMouseDown,
      onKeyDown,
      state: {
        activeOption, filteredOptions, showOptions, userInput
      }, props
    } = this;
    let optionList;
    if (showOptions && userInput) {
      if (filteredOptions.length) {
        optionList = (
          <ul className="options">
            {filteredOptions.map((optionName, index) => {
              let className;
              if (index === activeOption) {
                className = 'option-active';
              }
              return (
                <li
                  className={className} key={optionName} onMouseDown={onMouseDown}
                  onKeyPress={() => {}} role="presentation">
                  {optionName}
                </li>
              );
            })}
          </ul>
        );
      } else {
        optionList = (
          <div className="no-options">
            <em>No Option!</em>
          </div>
        );
      }
    }
    return (
      <div className={`${props.className} auto-complete`}>
        <TextInput
          label={props.label} name={props.name} value={userInput || props.value}
          className="w-100" onChange={onChange} onKeyDown={onKeyDown}
          error={props.error} onBlur={this.onBlur} />
        {optionList}
      </div>
    );
  }
}
