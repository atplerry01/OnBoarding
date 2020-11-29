import React, { Component } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { connect } from 'react-redux';
import { addCustomerData, updateGoBackCount } from '../actions/customerDataActions';
import { acctManagerConfirmation, relationManagerConfirmation } from '../apiCalls/acctConfirmation';
import { getFormVariables, getNextTask, submitTask } from '../apiCalls/camundaApi';
import getJson from '../apiCalls/jsonFilesCall';
import AutoComplete from '../components/inputFeilds/AutoComplete';
import CheckboxInput from '../components/inputFeilds/CheckboxInput';
import SelectInput from '../components/inputFeilds/SelectInput';
import TextInput from '../components/inputFeilds/TextInput';
import IsLoading from '../components/layouts/IsLoading';
import lgaData from '../formsData/lgaData';
import { decodeToken } from '../utilities/authUtilities';
import { convertToObj, formatVariables } from '../utilities/camundaVariables';
import { formatDateforCamunda, formatDateforPicker } from '../utilities/dateTimeUtilities';
import { getCountryName } from '../utilities/generalUtilities';
import notification from '../utilities/notification';
import { gotoNextTask, saveFormVariables } from '../utilities/processFlowUtilities';
import { validateField } from '../validation/validator';




class CustomerDetailsForm extends Component {
  constructor(props) {
    super(props);
    const { customerData } = props;

    this.state = {
      salutations: [],
      countries: [],
      states: [],
      nigeriaCities: [],
      maritalStatusOptions: [],
      errors: {},
      exemptedBranches: [],
      branchCodes: [],
      religions: [],
      preferredBranchCode: customerData.preferredBranchCode || '',
      title: customerData.title || '',
      firstname: customerData.firstname || '',
      middlename: customerData.middlename || '',
      lastname: customerData.lastname || '',
      gender: customerData.gender || '',
      religion: customerData.religion || '',
      dob: (customerData.dob && formatDateforPicker(customerData.dob)) || '',
      pob: customerData.pob || '',
      countryOfBirth: customerData.countryOfBirth || '',
      marstatus: customerData.marstatus || '',
      nationality: customerData.nationality || 'Nigeria',
      stateoforigin: customerData.stateoforigin || '',
      lgaoforigin: customerData.lgaoforigin || '',
      respermit: customerData.respermit || '',
      respermisdate: (customerData.respermisdate && formatDateforPicker(customerData.respermisdate)) || '',
      respermexdate: (customerData.respermexdate && formatDateforPicker(customerData.respermexdate)) || '',
      streetno: customerData.streetno || '',
      street: customerData.street || '',
      landmark: customerData.landmark || '',
      city: customerData.city || '',
      lga: customerData.lga || '',
      state: customerData.state || '',
      stateOfProvince: customerData.stateOfProvince || '',
      country: customerData.country || 'Nigeria',
      isMultipleCitizenship: customerData.isMultipleCitizenship || 'false',
      secondCountry: customerData.secondCountry || '',
      secondCountryName: '',
      secondAddress: customerData.secondAddress || '',
      secondTin: customerData.secondTin || '',
      phonenumber1: customerData.phonenumber1 || '',
      phonenumber2: customerData.phonenumber2 || '',
      email: customerData.email || '',
      staffid: customerData.staffid || '',
      relationshipmanagerid: customerData.relationshipmanagerid || '',
      watchlist: customerData.watchlist || '0',
      processInstanceId: customerData.processInstanceId,
      goBackCount: customerData.goBackCount || 0,
      isCheckingStaffid: false,
      invalidStaffid: false,
      isLoading: true
    };
  }

  componentDidMount = async () => {
    window.scrollTo(0, 0);
    const { secondCountry } = this.state;
    const salutations = await getJson('salutation.json');
    const countries = await getJson('world-countries.json');
    const states = await getJson('nigeria-states.json');
    const nigeriaCities = await getJson('nigeriaCities.json');
    const maritalStatusOptions = await getJson('maritalStatus.json');
    const exemptedBranches = await getJson('branchExemption.json');
    const branchCodes = await getJson('branchCodes.json');
    const religions = await getJson('religions.json');
    const cn = secondCountry && await getCountryName(secondCountry);
    console.log(cn);
    this.setState({
      salutations,
      countries,
      states,
      nigeriaCities,
      maritalStatusOptions,
      exemptedBranches,
      branchCodes,
      religions,
      secondCountryName: cn || ''
    });

    if (this.state.goBackCount < 0) {
      this.setState({ errors: {}, isLoading: false });
      return;
    }
    const {
      processInstanceId, nationality, country, isMultipleCitizenship
    } = this.state;
    const task = await getNextTask(processInstanceId);

    if (task) {
      let userData = await getFormVariables(task.id);
      userData = convertToObj(userData);
      const cname = userData.secondCountry && await getCountryName(userData.secondCountry);

      this.props.addCustomerData({ ...userData, continueProcess: false });
      this.setState({
        ...userData,
        currentTask: task.id,
        nationality: userData.nationality || 'Nigeria',
        secondCountryName: cname || '',
        country: userData.country || 'Nigeria',
        errors: {
          firstname: userData.firstname ? null : 'Required',
          lastname: userData.lastname ? null : 'Required',
          nationality: userData.nationality || nationality ? null : 'Required',
          title: userData.title ? null : 'Required',
          gender: userData.gender ? null : 'Required',
          religion: userData.religion ? null : 'Required',
          dob: userData.dob ? null : 'Required',
          marstatus: userData.marstatus ? null : 'Required',
          streetno: userData.streetno ? null : 'Required',
          street: userData.street ? null : 'Required',
          landmark: userData.landmark ? null : 'Required',
          city: userData.city ? null : 'Required',
          relationshipmanagerid: userData.relationshipmanagerid ? null : 'Required',
          country: userData.country || country ? null : 'Required',
          phonenumber1: userData.phonenumber1 ? null : 'Required',
          stateoforigin: userData.stateoforigin ? null : nationality === 'Nigeria' && 'Required',
          lgaoforigin: userData.lgaoforigin ? null : nationality === 'Nigeria' && 'Required',
          secondCountry: userData.secondCountry ? null : isMultipleCitizenship === 'true' && 'Required',
          secondAddress: userData.secondAddress ? null : isMultipleCitizenship === 'true' && 'Required',
          secondTin: userData.secondTin ? null : isMultipleCitizenship === 'true' && 'Required',
          respermit: userData.respermit ? null : nationality !== 'Nigeria' && 'Required',
          respermisdate: userData.respermisdate ? null : nationality !== 'Nigeria' && 'Required',
          respermexdate: userData.respermexdate ? null : nationality !== 'Nigeria' && 'Required',
          lga: userData.lga ? null : country === 'Nigeria' && 'Required',
          state: userData.state ? null : country === 'Nigeria' && 'Required',
          stateOfProvince: userData.stateOfProvince ? null : country !== 'Nigeria' && 'Required',
          preferredBranchCode: userData.preferredBranchCode &&
            !this.isExemptedBranch(userData.preferredBranchCode) ? null : 'Required'
        }
      });
    }
    this.setState({ isLoading: false });
  }

  setVariables = () => {
    const { state } = this;
    return {
      title: state.title,
      firstname: state.firstname,
      middlename: state.middlename,
      lastname: state.lastname,
      gender: state.gender,
      religion: state.religion,
      dob: state.dob && formatDateforCamunda(state.dob),
      pob: state.pob,
      countryOfBirth: state.countryOfBirth,
      marstatus: state.marstatus,
      nationality: state.nationality,
      stateoforigin: state.stateoforigin,
      lgaoforigin: state.lgaoforigin,
      respermit: state.respermit,
      respermisdate: state.respermisdate && formatDateforCamunda(state.respermisdate),
      respermexdate: state.respermexdate && formatDateforCamunda(state.respermexdate),
      streetno: state.streetno,
      street: state.street,
      landmark: state.landmark,
      city: state.city,
      lga: state.lga,
      state: state.state,
      stateOfProvince: state.stateOfProvince,
      country: state.country,
      isMultipleCitizenship: state.isMultipleCitizenship,
      secondCountry: state.secondCountry,
      secondAddress: state.secondAddress,
      secondTin: state.secondTin,
      phonenumber1: state.phonenumber1,
      phonenumber2: state.phonenumber2,
      email: state.email,
      staffid: state.staffid,
      relationshipmanagerid: state.relationshipmanagerid,
      watchlist: state.watchlist,
      preferredBranchCode: state.preferredBranchCode
    };
  }

  handleSubmit = async () => {
    const { state, props } = this;

    if (state.goBackCount < 0) {
      props.addCustomerData(this.setVariables());
      props.updateGoBackCount(state.goBackCount + 1);
      props.history.push('/onboarding/id-docs');
      return;
    }

    this.setState({ isLoading: true });
    const submit = await submitTask(state.currentTask, 'Customer Details', formatVariables(this.setVariables()));
    console.log(submit);
    if (submit === 'Successful') {
      props.addCustomerData(this.setVariables());
      setTimeout(async () => {
        await gotoNextTask(state.processInstanceId, props.customerData.username, props.history);
      }, 1000);
    } else {
      notification({
        title: 'Error',
        message: 'Something went wrong when submitting form.',
        type: 'danger'
      });
      this.setState({ isLoading: false });
    }
  }

  handleSave = async () => {
    this.setState({ isLoading: true });
    await saveFormVariables(this, this.setVariables());
    this.setState({ isLoading: false });
  }

  handleChange = (errorType) => async (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(value, errorType);

    this.setState((state) => ({
      [name]: value,
      errors: { ...state.errors, [name]: errorMsg }
    }));
    if (name === 'nationality') {
      this.setState({
        stateoforigin: '',
        lgaoforigin: '',
        respermit: '',
        respermisdate: '',
        respermexdate: ''
      });
      if (value === 'Nigeria') {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            stateoforigin: 'Required',
            lgaoforigin: 'Required',
            respermit: null,
            respermisdate: null,
            respermexdate: null
          }
        }));
      }
      if (value !== 'Nigeria' && value !== 'Select item...' && value !== '') {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            respermit: 'Required',
            respermisdate: 'Required',
            respermexdate: 'Required',
            stateoforigin: null,
            lgaoforigin: null
          }
        }));
      }
    }
    if (name === 'country') {
      this.setState({
        state: '',
        lga: '',
        stateOfProvince: ''
      });
      if (value === 'Nigeria') {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            state: 'Required',
            lga: 'Required',
            stateOfProvince: null
          }
        }));
      }
      if (value !== 'Nigeria' && value !== 'Select item...' && value !== '') {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            state: null,
            lga: null,
            stateOfProvince: 'Required'
          }
        }));
      }
    }
    if (name === 'isMultipleCitizenship') {
      this.setState((state) => ({
        [name]: value === 'true' ? 'false' : 'true',
        secondAddress: '',
        secondCountry: '',
        secondCountryName: '',
        secondTin: '',
        errors: {
          ...state.errors,
          secondAddress: value === 'false' ? 'Required' : '',
          secondCountry: value === 'false' ? 'Required' : '',
          secondTin: value === 'false' ? 'Required' : ''
        }
      }));
    }
    if (name === 'secondCountry') {
      const cn = await getCountryName(value);
      this.setState({ secondCountryName: cn });
    }
  }

  handleValidation = (errorType) => async (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(value, errorType);

    this.setState((state) => ({
      errors: { ...state.errors, [name]: errorMsg }
    }));

    if (name === 'staffid') {
      if (!value) {
        this.setState({ invalidStaffid: false });
        return;
      }
      this.setState({ isCheckingStaffid: true, invalidStaffid: true });
      const res = await acctManagerConfirmation(value);
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
    if (name === 'relationshipmanagerid') {
      if (!value) {
        this.setState({ invalidStaffid: false });
        return;
      }
      this.setState({ isCheckingStaffid: true, invalidStaffid: true });
      const res = await relationManagerConfirmation(value);
      console.log(res);
      if (res) {
        const { ResponseCode, ResponseMessage } = res;
        if (ResponseCode === '00') {
          notification({
            title: ResponseMessage,
            message: 'The Relation Manager ID is Valid',
            type: 'success'
          });
          this.setState({ invalidStaffid: false });
        } else if (ResponseCode === '02') {
          notification({
            title: ResponseMessage,
            message: 'The Relation Manager ID is Invalid, Please enter a valid ID.',
            type: 'danger'
          });
          this.setState((state) => ({
            invalidStaffid: true,
            errors: { ...state.errors, [name]: 'Invalid Relation Manager ID' }
          }));
        } else {
          notification({
            title: 'Network Failure',
            message: 'Network failed while confirming the Staff ID. Please, check your network connection.',
            type: 'danger'
          });
          this.setState((state) => ({
            invalidStaffid: true,
            errors: { ...state.errors, [name]: 'Relation Manager ID not confirmed' }
          }));
        }
      }
      this.setState({ isCheckingStaffid: false });
    }
  }

  cantBeSubmitted = () => {
    const { errors } = this.state;

    console.log(errors);
    const res = Object.keys(errors).some((e) => errors[e]);

    console.log(res);
    return res;
  }

  autoComplete = (name, value) => {
    this.setState({ [name]: value });
  }

  isExemptedBranch = (branchCode) => {
    const { exemptedBranches } = this.state;

    const foo = exemptedBranches.filter((branch) => branch.code === branchCode);
    return foo.length > 0;
  }

  render() {
    const { state, props } = this;
    const disabled = props.customerData.bvn && props.customerData.bvn.length > 2;
    const staffBranchCode = decodeToken('bc').branchCode;

    console.log(state.errors);
    return (
      <div>
        {(state.isCheckingStaffid || state.isLoading) && <IsLoading />}
        <div className="section-title">
          <h2>
            <span>2</span>
            Personal Details
          </h2>
        </div>

        <fieldset>
          <legend>Bio Data:</legend>
          <div className="flex">
            <SelectInput
              label="Title" name="title" options={state.salutations} value={state.title}
              onChange={this.handleChange('isRequired')} className="col-2"
              error={state.errors.title} onBlur={this.handleValidation('isRequired')} />
            <TextInput
              label="Last Name" name="lastname" value={state.lastname} error={state.errors.lastname}
              onChange={this.handleChange('isRequired, isAlpha')} className="col-3"
              onBlur={this.handleValidation('isRequired, isAlpha')} disabled={disabled} />
            <TextInput
              label="First Name" name="firstname" value={state.firstname} error={state.errors.firstname}
              onChange={this.handleChange('isRequired, isAlpha')} className="col-4"
              onBlur={this.handleValidation('isRequired, isAlpha')} disabled={disabled} />
            <TextInput
              label="Middle Name" name="middlename" value={state.middlename} error={state.errors.middlename}
              onChange={this.handleChange('isAlpha')} className="col-3"
              onBlur={this.handleValidation('isAlpha')} disabled={disabled} />
          </div>
          <div className="flex">
            <SelectInput
              label="Gender" name="gender" options={['Select item...', 'Male', 'Female']} disabled={disabled}
              value={state.gender} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.gender} onBlur={this.handleValidation('isRequired')} />
            <SelectInput
              label="Marital Status" name="marstatus" options={state.maritalStatusOptions}
              value={state.marstatus} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.marstatus} onBlur={this.handleValidation('isRequired')} />
            <SelectInput
              label="Religion" name="religion" options={state.religions}
              value={state.religion} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.religion} onBlur={this.handleValidation('isRequired')} />
          </div>
          <div className="flex">
            <TextInput
              label="Date of Birth" name="dob" type="date" value={state.dob} error={state.errors.dob}
              onChange={this.handleChange('isRequired')} className="col-4"
              onBlur={this.handleValidation('isRequired')} disabled={disabled || state.dob} />
            <TextInput
              label="Place of Birth" name="pob" value={state.pob} error={state.errors.pob}
              className="col-4" onChange={this.handleChange('')} onBlur={this.handleValidation('')} />
            <SelectInput
              label="Country of Birth" name="countryOfBirth" options={state.countries}
              value={state.countryOfBirth} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.countryOfBirth} onBlur={this.handleValidation('isRequired')} />
          </div>
          <div className="flex">
            <SelectInput
              label="Nationality" name="nationality" options={state.countries}
              value={state.nationality} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.nationality} onBlur={this.handleValidation('isRequired')} />
            {
              state.nationality === 'Nigeria' ? (
                <>
                  <SelectInput
                    label="State of Origin" name="stateoforigin" options={state.states}
                    value={state.stateoforigin} onChange={this.handleChange('isRequired')} className="col-4"
                    error={state.errors.stateoforigin} onBlur={this.handleValidation('isRequired')} />
                  <SelectInput
                    label="LGA of Origin" name="lgaoforigin" options={lgaData(this.state.stateoforigin)}
                    value={state.lgaoforigin} onChange={this.handleChange('isRequired')} className="col-4"
                    error={state.errors.lgaoforigin} onBlur={this.handleValidation('isRequired')} />
                </>
              ) : null
            }
          </div>
          {
            state.nationality !== 'Nigeria' && state.nationality !== 'Select item...' && state.nationality !== '' ? (
              <div className="flex">
                <TextInput
                  label="Residence Permit No." name="respermit" value={state.respermit}
                  onChange={this.handleChange('isRequired')} className="col-4"
                  error={state.errors.respermit} onBlur={this.handleValidation('isRequired')} />
                <TextInput
                  label="Permit Issue Date" name="respermisdate" className="col-4" type="date"
                  error={state.errors.respermisdate} onBlur={this.handleValidation('isRequired, isValidIssueDate')}
                  value={state.respermisdate} maxDate={formatDateforPicker(new Date())}
                  onChange={this.handleChange('isRequired, isValidIssueDate')} />
                <TextInput
                  label="Pirmit Expiry Date" name="respermexdate" className="col-4" type="date"
                  error={state.errors.respermexdate} onBlur={this.handleValidation('isRequired, isNotExpired')}
                  value={state.respermexdate} minDate={state.respermisdate}
                  onChange={this.handleChange('isRequired, isNotExpired')} />
              </div>
            ) : null
          }
        </fieldset>
        <fieldset>
          <legend>Contact Details:</legend>
          <div className="flex">
            <TextInput
              label="House No." name="streetno" value={state.streetno}
              onChange={this.handleChange('isRequired')} className="col-2"
              error={state.errors.streetno} onBlur={this.handleValidation('isRequired')} />
            <TextInput
              label="Street Name" name="street" value={state.street}
              onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.street} onBlur={this.handleValidation('isRequired')} />
            <TextInput
              label="Landmark" name="landmark" value={state.landmark}
              onChange={this.handleChange('isRequired')} className="col-3"
              error={state.errors.landmark} onBlur={this.handleValidation('isRequired')} />
            <AutoComplete
              label="City/Town" name="city" options={state.nigeriaCities}
              value={state.city} onChange={this.handleChange('isRequired')} className="col-3"
              onBlur={this.handleValidation('isRequired')} error={state.errors.city}
              autoComplete={this.autoComplete} />
          </div>
          <div className="flex">
            <SelectInput
              label="Country of Residence" name="country" options={state.countries}
              value={state.country} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.country} onBlur={this.handleValidation('isRequired')} />
            {
              state.country === 'Nigeria' ?
                (
                  <>
                    <SelectInput
                      label="State of Residence" name="state" options={state.states}
                      value={state.state} onChange={this.handleChange('isRequired')} className="col-4"
                      error={state.errors.state} onBlur={this.handleValidation('isRequired')} />
                    <SelectInput
                      label="LGA of Residence" name="lga" options={lgaData(this.state.state)}
                      value={state.lga} onChange={this.handleChange('isRequired')} className="col-4"
                      error={state.errors.lga} onBlur={this.handleValidation('isRequired')} />
                  </>
                ) :
                (
                  <>
                    <TextInput
                      label="State of Province" name="stateOfProvince" value={state.stateOfProvince}
                      onChange={this.handleChange('isRequired')} onBlur={this.handleValidation('isRequired')}
                      className="col-4" error={state.errors.stateOfProvince} />

                    <TextInput
                      label={`Tax Identification Number ${state.secondCountryName ? ` in ${state.secondCountryName}` : ''}`} name="secondTin"
                      value={state.secondTin} onChange={this.handleChange('isRequired')} className="col-6"
                      onBlur={this.handleValidation('isRequired')} error={state.errors.secondTin} />
                    <TextInput
                      label={`Residential Address ${state.secondCountryName ? ` in ${state.secondCountryName}` : ''}`}
                      name="secondAddress" value={state.secondAddress}
                      onChange={this.handleChange('isRequired')} className="col-6"
                      onBlur={this.handleValidation('isRequired')} error={state.errors.secondAddress} />
                  </>
                )
            }
          </div>
          <div className="flex">
            <CheckboxInput
              label="Do you pay tax in another country?"
              name="isMultipleCitizenship" className="col-12" onChange={this.handleChange('')}
              value={state.isMultipleCitizenship} checked={state.isMultipleCitizenship === 'true'} />
          </div>
          {state.isMultipleCitizenship === 'true' && (
            <div className="flex">
              <SelectInput
                label="Country" name="secondCountry" options={state.countries}
                value={state.secondCountry} onChange={this.handleChange('isRequired')} className="col-6"
                error={state.errors.secondCountry} onBlur={this.handleValidation('isRequired')} />
              <TextInput
                label={`Tax Identification Number ${state.secondCountryName ? ` in ${state.secondCountryName}` : ''}`} name="secondTin"
                value={state.secondTin} onChange={this.handleChange('isRequired')} className="col-6"
                onBlur={this.handleValidation('isRequired')} error={state.errors.secondTin} />
              <TextInput
                label={`Residential Address ${state.secondCountryName ? ` in ${state.secondCountryName}` : ''}`}
                name="secondAddress" value={state.secondAddress}
                onChange={this.handleChange('isRequired')} className="col-12"
                onBlur={this.handleValidation('isRequired')} error={state.errors.secondAddress} />
            </div>
          )}
          <div className="flex">
            <TextInput
              label="Phone No. 1" name="phonenumber1" value={state.phonenumber1}
              onChange={this.handleChange('isRequired, isPhoneNo')} className="col-4"
              onBlur={this.handleValidation('isRequired, isPhoneNo')} error={state.errors.phonenumber1} />
            <TextInput
              label="Phone No. 2" name="phonenumber2" value={state.phonenumber2}
              onChange={this.handleChange('isPhoneNo')} className="col-4"
              onBlur={this.handleValidation('isPhoneNo')} error={state.errors.phonenumber2} />
            <TextInput
              label="E-mail Address" name="email" value={state.email} error={state.errors.email}
              onChange={this.handleChange('isEmail')} className="col-4"
              onBlur={this.handleValidation('isEmail')} />
          </div>
        </fieldset>
        <fieldset>
          <legend>Bank Info:</legend>
          <div className="flex">
            <TextInput
              label="Introducer’s Staff ID" name="staffid" value={state.staffid}
              error={state.errors.staffid} onChange={this.handleChange('')} className="col-4 no-m"
              onBlur={this.handleValidation('')} />
            <TextInput
              label="Relationship Manager ID" name="relationshipmanagerid" value={state.relationshipmanagerid}
              error={state.errors.relationshipmanagerid}
              onChange={this.handleChange('isRequired')} className="col-4 no-m"
              onBlur={this.handleValidation('isRequired')} />
            {this.isExemptedBranch(staffBranchCode) && (
              <SelectInput
                label="Preferred Branch" name="preferredBranchCode" options={state.branchCodes}
                value={state.preferredBranchCode} onChange={this.handleChange('isRequired')} className="col-4"
                error={state.errors.preferredBranchCode} onBlur={this.handleValidation('isRequired')} />
            )}
          </div>
        </fieldset>
        <div className="flex-spaced">
          <button
            type="button" onClick={this.handleSave}
            className="col-4 btn no-m" disabled={state.invalidStaffid}>
            Save
          </button>
          <button
            type="button" onClick={this.handleSubmit}
            className="col-4 btn no-m" disabled={this.cantBeSubmitted() || state.invalidStaffid}>
            Next
            <FiArrowRight className="right" />
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  console.log(state);
  return ({
    ...state
  });
};

const mapDispatchToProps = {
  addCustomerData,
  updateGoBackCount
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomerDetailsForm);
