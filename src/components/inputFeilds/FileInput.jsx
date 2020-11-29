import React, { Component } from 'react';

// import { previewImage } from '../../utilities/ImageUtilities';

export default class FileInput extends Component {
  handleChange = (e) => {
    this.props.onChange(e);
    // previewImage(this.props.name, `${this.props.name}-preview`);
  }

  render() {
    const error = this.props.error === 'Required' ? null : this.props.error;
    return (
      <div className={`${this.props.className} form-group`}>
        <label htmlFor={this.props.name}>
          {this.props.label}
          <span className="size-note">{this.props.note}</span>
          :
        </label>
        <input
          type="file" id={this.props.name} name={this.props.name}
          className={error && 'error-field'} value={this.props.value}
          onChange={this.handleChange} onBlur={this.props.onBlur} />
        {error ? <p className="error-msg">{error}</p> : null}
        {/* <div id={`${this.props.name}-preview`} className="img-preview p-r" /> */}
      </div>
    );
  }
}
