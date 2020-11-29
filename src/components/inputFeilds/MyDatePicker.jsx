import React, { PureComponent } from 'react';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

class MyDatePicker extends PureComponent {
  render() {
    const {
      label, name, value, className, onChange, minDate, maxDate
    } = this.props;

    return (
      <label className={className}>
        {label}
        :
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            autoOk
            minDate={minDate}
            maxDate={maxDate}
            variant="inline"
            inputVariant="outlined"
            format="MM/dd/yyyy"
            name={name}
            onChange={onChange}
            value={value === '' ? 'Select Date...' : new Date(value)} />
        </MuiPickersUtilsProvider>
      </label>
    );
  }
}

export default MyDatePicker;
