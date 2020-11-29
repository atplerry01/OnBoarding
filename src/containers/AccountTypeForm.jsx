import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FiArrowRight } from 'react-icons/fi';
import moment from 'moment';

import getBvnDetails from '../apiCalls/bvnApiCall';
import {
  getNextTask,
  submitTask, deleteProcessInstance
} from '../apiCalls/camundaApi';
import { addCustomerData } from '../actions/customerDataActions';
import { formatVariables } from '../utilities/camundaVariables';
import CheckboxInput from '../components/inputFeilds/CheckboxInput';
import TextInput from '../components/inputFeilds/TextInput';
import SelectInput from '../components/inputFeilds/SelectInput';
import { gotoNextTask } from '../utilities/processFlowUtilities';
import getJson from '../apiCalls/jsonFilesCall';
import { validateField } from '../validation/validator';
import notification from '../utilities/notification';
import IsLoading from '../components/layouts/IsLoading';
import {
  formatDobforPicker, isAgeLesser,
  formatDateforPicker, isAgeGreater
} from '../utilities/dateTimeUtilities';
import { staffConfirmation } from '../apiCalls/acctConfirmation';

class AccountTypeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountTypes: [],
      currencies: [],
      errors: {
        accountType: 'Required'
      },
      isMobileMoney: props.customerData.isMobileMoney || false,
      bvn: props.customerData.bvn || '',
      accountType: props.customerData.accountType || '',
      gaurdianBvn: props.customerData.gaurdianBvn || '',
      dob: props.customerData.dob || '',
      newStaffEmployeeId: props.customerData.newStaffEmployeeId || '',
      isStaffAccount: props.customerData.isStaffAccount || 'false',
      phoneNumber: props.customerData.phoneNumber || '',
      currency: props.customerData.currency || 'NGR',
      tierType: props.customerData.tierType || 1,
      processInstanceId: localStorage.getItem('currentProcessInstance') || '',
      goBackCount: 0,
      isSubmitting: false,
      invalidStaffid: false,
      isCheckingStaffid: false,
      isLoading: true
    };
  }

  async componentDidMount() {
    window.scrollTo(0, 0);
    const acctTypes = await getJson('accountTypes.json');
    const currencies = await getJson('currencies.json');
    this.setState({ accountTypes: acctTypes, currencies });

    const task = await getNextTask(this.state.processInstanceId);
    console.log(task);
    if (task) {
      this.setState({ currentTaskId: task.id });
    }
    this.setState({ isLoading: false });
  }

  async componentWillUnmount() {
    const { processInstanceId } = this.state;
    const task = await getNextTask(processInstanceId, 'UserTask_bvn');
    console.log(task);
    if (task) {
      const res = await deleteProcessInstance(processInstanceId);
      console.log(res);
    }
  }

  handleChange = (errorType) => (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(value, errorType);

    this.setState((state) => ({
      [name]: value,
      errors: { ...state.errors, [name]: errorMsg }
    }));
    if (name === 'accountType') {
      const isMM = value === 'Mobile-Money';
      const requireCurrency = value === 'Domiciliary';
      const dobRequired = value === 'Purple-Account' || value === 'Royal-Kiddies';
      let tier = 1;
      if (value === 'Current' || value === 'Domiciliary') tier = 3;
      this.setState((state) => ({
        isMobileMoney: isMM,
        bvn: '',
        gaurdianBvn: '',
        dob: '',
        phoneNumber: '',
        currency: 'NGR',
        tierType: tier,
        errors: {
          ...state.errors,
          bvn: isMM ? null : 'Required',
          dob: dobRequired ? 'Required' : null,
          phoneNumber: isMM ? 'Required' : null,
          currency: requireCurrency ? 'Required' : null
        }
      }));
    }
    if (name === 'isStaffAccount') {
      this.setState((state) => ({
        [name]: value === 'true' ? 'false' : 'true',
        accountType: '',
        newStaffEmployeeId: '',
        dob: '',
        bvn: '',
        gaurdianBvn: '',
        currency: 'NGR',
        errors: {
          accountType: 'Required',
          newStaffEmployeeId: state.isStaffAccount === 'true' ? null : 'Required'
        }
      }));
    }
    if (name === 'dob') {
      if (isAgeLesser(value, 0)) {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            dob: 'Invalid date of birth'
          }
        }));
      }
      if (this.state.accountType === 'Purple-Account' && isAgeLesser(value, 13)) {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            dob: 'Below 13 years (age limit for a Purple Account)'
          }
        }));
      }
      if (this.state.accountType === 'Royal-Kiddies' && isAgeGreater(value, 13)) {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            dob: 'Above 13 years (age limit for Royal Kiddies)'
          }
        }));
      }
      if (value && isAgeLesser(value, 18)) {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            gaurdianBvn: 'Required',
            bvn: ''
          }
        }));
      }
      if (value && isAgeGreater(value, 18)) {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            bvn: 'Required',
            gaurdianBvn: ''
          }
        }));
      }
      this.setState({
        bvn: '', gaurdianBvn: ''
      });
    }
  }

  handleValidation = (errorType) => async (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(value, errorType);

    this.setState((state) => ({
      errors: { ...state.errors, [name]: errorMsg }
    }));

    if (name === 'newStaffEmployeeId') {
      if (!value) {
        this.setState({ invalidStaffid: false });
        return;
      }
      this.setState({ isCheckingStaffid: true, invalidStaffid: true });
      const res = await staffConfirmation(value);
      console.log(res);
      if (res) {
        const { ResponseCode, ResponseMessage } = res;
        if (ResponseCode === '00') {
          notification({
            title: ResponseMessage,
            message: 'The Staff ID is Valid',
            type: 'success'
          });
          this.setState({ invalidStaffid: false });
        } else if (ResponseCode === '02') {
          notification({
            title: ResponseMessage,
            message: 'The Staff ID is Invalid, Please enter a valid ID.',
            type: 'danger'
          });
          this.setState((state) => ({
            invalidStaffid: true,
            errors: { ...state.errors, [name]: 'Invalid Staff ID' }
          }));
        } else {
          notification({
            title: 'Network Failure',
            message: 'Network failed while confirming the Staff ID. Please, check your network connection.',
            type: 'danger'
          });
          this.setState((state) => ({
            invalidStaffid: true,
            errors: { ...state.errors, [name]: 'Staff ID not confirmed' }
          }));
        }
      }
      this.setState({ isCheckingStaffid: false });
    }
  }

  handleSubmit = async () => {
    this.setState({ isSubmitting: true });
    const {
      isMobileMoney, bvn, phoneNumber, accountType, currency, dob,
      processInstanceId, currentTaskId, goBackCount, tierType,
      gaurdianBvn, isStaffAccount, newStaffEmployeeId
    } = this.state;
    const { customerData: { username }, history, addCustomerData } = this.props;
    let variables = {
      isMobileMoney,
      bvn: isMobileMoney || (dob && isAgeLesser(dob, 18)) ? '-' : bvn,
      phoneNumber,
      accountType,
      tierType,
      currency
    };
    if (isStaffAccount === 'true') {
      variables = {
        ...variables,
        newStaffEmployeeId,
        isStaffAccount: isStaffAccount === 'true'
      };
    }
    if (isMobileMoney) {
      variables = {
        ...variables,
        phonenumber1: phoneNumber
      };
    } else {
      const useGaurdian = (accountType === 'Purple-Account' || accountType === 'Royal-Kiddies') && isAgeLesser(dob, 18);
      const bvnRes = useGaurdian ? await getBvnDetails(gaurdianBvn) : await getBvnDetails(bvn);
      console.log(bvnRes);
      if (bvnRes.responseCode === '00') {
        const dobOnBvn = formatDobforPicker(bvnRes.dateOfBirth, 'DD-MMM-YY');

        if (isAgeLesser(dobOnBvn, 18)) {
          notification({
            title: 'Submission Failed',
            message: 'Sorry, the customer is below 18 years, which is below the age limit for this account type.',
            type: 'danger'
          });
          this.setState({ isSubmitting: false });
          return;
        }
        variables = useGaurdian ? {
          ...variables,
          dob,
          gaurdianBvn,
          noklastname: bvnRes.lastName,
          nokfirstname: bvnRes.firstName,
          nokmidname: bvnRes.middleName,
          noknationality: bvnRes.nationality,
          nokgender: bvnRes.gender,
          nokdob: formatDobforPicker(bvnRes.dateOfBirth, 'DD-MMM-YY'),
          nokemail: bvnRes.email,
          nokstate: bvnRes.stateOfResidence,
          noklga: bvnRes.lgaOfResidence,
          noknumber: bvnRes.phoneNumber1,
          watchListed: 0,
          startDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        } :
          {
            ...variables,
            firstname: bvnRes.firstName,
            lastname: bvnRes.lastName,
            middlename: bvnRes.middleName,
            nationality: bvnRes.nationality,
            gender: bvnRes.gender,
            dob: formatDobforPicker(bvnRes.dateOfBirth, 'DD-MMM-YY'),
            marstatus: bvnRes.maritalStatus,
            email: bvnRes.email,
            state: bvnRes.stateOfResidence,
            lga: bvnRes.lgaOfResidence,
            phonenumber1: bvnRes.phoneNumber1,
            phonenumber2: bvnRes.phoneNumber2,
            stateoforigin: bvnRes.stateOfOrigin,
            lgaoforigin: bvnRes.lgaOfOrigin,
            watchListed: bvnRes.watchListed,
            bvnResponse: bvnRes,
            startDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
          };
      } else {
        notification({
          title: 'Submission Failed',
          message: 'Please ensure the BVN is correct and your network connection is stable. Then, try again',
          type: 'danger'
        });
        this.setState({ isSubmitting: false });
        return;
      }
    }
    console.log(variables);
    const submit = await submitTask(currentTaskId, 'Account Type', formatVariables(variables));
    console.log(formatVariables(variables));
    console.log(submit);
    if (submit === 'Successful') {
      addCustomerData({
        ...variables,
        processInstanceId,
        goBackCount
      });
      setTimeout(async () => {
        await gotoNextTask(processInstanceId, username, history);
      }, 1000);
    } else {
      notification({
        title: 'Error',
        message: 'Something went wrong when submitting form.',
        type: 'danger'
      });
    }
    this.setState({ isSubmitting: false });
  }

  cantBeSubmitted = () => {
    const { errors } = this.state;
    const res = Object.keys(errors).some((e) => errors[e]);

    return res;
  }

  render() {
    const {
      isMobileMoney, bvn, phoneNumber, accountTypes, currencies, newStaffEmployeeId,
      accountType, currency, gaurdianBvn, dob, isStaffAccount, errors, isSubmitting,
      isCheckingStaffid, invalidStaffid, isLoading
    } = this.state;

    const accountTypeList = isStaffAccount === 'true' ?
      ['Select item...', 'Savings', 'Current', 'Domiciliary'] : accountTypes;
    const fieldStyle = { transform: 'translateX(50%)' };
    const isBelow18 = dob && isAgeLesser(dob, 18);

    return (
      <div>
        {(isCheckingStaffid || isLoading || isSubmitting) && <IsLoading />}
        <div className="section-title">
          <h2>
            <span>1</span>
            Account Details
          </h2>
        </div>

        <div style={fieldStyle} className="col-6">
          <CheckboxInput
            label="WEMA Staff Account" name="isStaffAccount" className="col-12" onChange={this.handleChange('')}
            value={isStaffAccount} checked={isStaffAccount === 'true'} />
          <SelectInput
            label="Account Type" name="accountType" options={accountTypeList} error={errors.accountType}
            value={accountType} onChange={this.handleChange('isRequired')} className="col-12"
            onBlur={this.handleChange('isRequired')} />
          {
            accountType === 'Domiciliary' &&
            (
              <SelectInput
                label="Account Currency" name="currency" options={currencies} error={errors.currency}
                value={currency} onChange={this.handleChange('isRequired')} className="col-12"
                onBlur={this.handleChange('isRequired')} />
            )
          }
          {
            isStaffAccount === 'true' &&
            (
              <TextInput
                label="Staff ID" name="newStaffEmployeeId" value={newStaffEmployeeId} className="col-12"
                onChange={this.handleChange('isRequired')} error={errors.newStaffEmployeeId}
                onBlur={this.handleValidation('isRequired')} />
            )
          }
          {
            (accountType === 'Purple-Account' || accountType === 'Royal-Kiddies') &&
            (
              <TextInput
                label="Date of Birth" name="dob" type="date" value={dob} className="col-12"
                onChange={this.handleChange('isRequired')} error={errors.dob}
                onBlur={this.handleChange('isRequired')} maxDate={formatDateforPicker(new Date())} />
            )
          }
          {
            isBelow18 &&
            (
              <TextInput
                label="Gaurdian BVN" name="gaurdianBvn" value={gaurdianBvn} className="col-12"
                onChange={this.handleChange('isRequired, isBVN')} error={errors.gaurdianBvn}
                onBlur={this.handleChange('isRequired, isBVN')} />
            )
          }
          {
            isMobileMoney ?
              (
                <TextInput
                  label="Mobile Number" name="phoneNumber" value={phoneNumber}
                  className="col-12" onChange={this.handleChange('isRequired, isPhoneNo')}
                  error={errors.phoneNumber} onBlur={this.handleChange('isRequired, isPhoneNo')} />
              ) : !isBelow18 &&
              (
                <TextInput
                  label="BVN" name="bvn" value={bvn} className="col-12"
                  onChange={this.handleChange('isRequired, isBVN')} error={errors.bvn}
                  onBlur={this.handleChange('isRequired, isBVN')} />
              )
          }
          <div className="col-12">
            <button
              type="button" onClick={this.handleSubmit}
              disabled={this.cantBeSubmitted() || isSubmitting || invalidStaffid} className="col-12 btn">
              {isSubmitting ? 'Processing...' : 'Next'}
              {!isSubmitting && <FiArrowRight className="right" />}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ ...state });

const mapDispatchToProps = {
  addCustomerData
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountTypeForm);
