import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

import RadioInput from '../components/inputFeilds/RadioInput';
import TextInput from '../components/inputFeilds/TextInput';
import SelectInput from '../components/inputFeilds/SelectInput';
import IsLoading from '../components/layouts/IsLoading';

import lgaData from '../formsData/lgaData';
import getJson from '../apiCalls/jsonFilesCall';

import { addCustomerData, updateGoBackCount } from '../actions/customerDataActions';
import {
  getNextTask, submitTask, getFormVariables
} from '../apiCalls/camundaApi';
import { formatVariables, convertToObj } from '../utilities/camundaVariables';
import { gotoNextTask, saveFormVariables } from '../utilities/processFlowUtilities';

import { validateField } from '../validation/validator';
import notification from '../utilities/notification';
import AutoComplete from '../components/inputFeilds/AutoComplete';

class OrtherDetailsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countries: [],
      states: [],
      incomeRange: [],
      employmentStatus: [],
      otherStatusList: [],
      occupationList: [],
      nigeriaCities: [],
      errors: {},
      occupation: props.customerData.occupation || '',
      empstatus: props.customerData.empstatus || '',
      otherStatus: props.customerData.otherStatus || '',
      specifyStatus: props.customerData.specifyStatus || '',
      empname: props.customerData.empname || '',
      empaddress: props.customerData.empaddress || '',
      netincome: props.customerData.netincome || '',
      bizname: props.customerData.bizname || '',
      biznature: props.customerData.biznature || '',
      bizaddress: props.customerData.bizaddress || '',
      isbizreg: props.customerData.isbizreg || 'no',
      bizturnova: props.customerData.bizturnova || '',
      noklastname: props.customerData.noklastname || '',
      nokmidname: props.customerData.nokmidname || '',
      nokfirstname: props.customerData.nokfirstname || '',
      nokrelation: props.customerData.nokrelation || '',
      nokemail: props.customerData.nokemail || '',
      noknumber: props.customerData.noknumber || '',
      nokstreetno: props.customerData.nokstreetno || '',
      nokstreetname: props.customerData.nokstreetname || '',
      noklandmark: props.customerData.noklandmark || '',
      nokcity: props.customerData.nokcity || '',
      noklga: props.customerData.noklga || '',
      nokstate: props.customerData.nokstate || '',
      nokstateOfProvince: props.customerData.nokstateOfProvince || '',
      nokcountry: props.customerData.nokcountry || 'Nigeria',
      processInstanceId: localStorage.getItem('currentProcessInstance'),
      goBackCount: props.customerData.goBackCount || 0,
      isLoading: true
    };
  }

  componentDidMount = async () => {
    window.scrollTo(0, 0);
    const countries = await getJson('world-countries.json');
    const states = await getJson('nigeria-states.json');
    const incomeRange = await getJson('incomeRanges.json');
    const employmentStatus = await getJson('employmentStatus1.json');
    const otherStatusList = await getJson('employmentStatus2.json');
    const occupationList = await getJson('occupationList.json');
    const nigeriaCities = await getJson('nigeriaCities.json');
    this.setState({
      countries,
      states,
      incomeRange,
      employmentStatus,
      otherStatusList,
      occupationList,
      nigeriaCities
    });

    if (this.state.goBackCount < 0) {
      this.setState({ errors: {}, isLoading: false });
      return;
    }

    const { processInstanceId, nokcountry } = this.state;
    console.log(processInstanceId);
    const task = await getNextTask(processInstanceId);
    console.log(task);

    if (task) {
      let userData = {};
      if (this.props.customerData.continueProcess) {
        userData = await getFormVariables(task.id);
        userData = convertToObj(userData, processInstanceId);
        this.props.addCustomerData({ ...userData, continueProcess: false });
      }
      this.setState((state) => ({
        ...userData,
        currentTask: task.id,
        nokcountry: userData.nokcountry || 'Nigeria',
        errors: {
          empstatus: userData.empstatus || state.empstatus ? null : 'Required',
          noklastname: userData.noklastname || state.noklastname ? null : 'Required',
          nokfirstname: userData.nokfirstname || state.nokfirstname ? null : 'Required',
          nokrelation: userData.nokrelation || state.nokrelation ? null : 'Required',
          noknumber: userData.noknumber || state.noknumber ? null : 'Required',
          nokstreetno: userData.nokstreetno || state.nokstreetno ? null : 'Required',
          nokstreetname: userData.nokstreetname || state.nokstreetname ? null : 'Required',
          noklandmark: userData.noklandmark || state.noklandmark ? null : 'Required',
          nokcity: userData.nokcity || state.nokcity ? null : 'Required',
          nokcountry: userData.nokcountry || state.nokcountry ? null : 'Required',
          noklga: userData.noklga || state.noklga ? null :
            (nokcountry === 'Nigeria' || userData.nokcountry === 'Nigeria') && 'Required',
          nokstate: userData.nokstate || state.nokstate ? null :
            (nokcountry === 'Nigeria' || userData.nokcountry === 'Nigeria') && 'Required',
          nokstateOfProvince: userData.nokstateOfProvince || state.nokstateOfProvince ? null :
            (nokcountry !== 'Nigeria' && userData.nokcountry !== 'Nigeria') && 'Required'
        }
      }));
    }
    this.setState({ isLoading: false });
  }

  handleValidation = (errorType) => (e) => {
    console.log(errorType, e);
    const { name, value } = e.target;
    const errorMsg = validateField(value, errorType);

    this.setState((state) => ({
      errors: { ...state.errors, [name]: errorMsg }
    }));
  }

  cantBeSubmitted = () => {
    const { errors } = this.state;
    const res = Object.keys(errors).some((e) => errors[e]);

    return res;
  }

  handleChange = (errorType) => (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(value, errorType);

    this.setState((state) => ({
      [name]: value,
      errors: { ...state.errors, [name]: errorMsg }
    }));
    if (name === 'empstatus') {
      this.setState({
        empname: '',
        empaddress: '',
        otherStatus: '',
        specifyStatus: '',
        occupation: '',
        netincome: '',
        bizname: '',
        biznature: '',
        bizaddress: '',
        isbizreg: false,
        bizturnova: ''
      });
      if (value === 'Employed') {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            empname: 'Required',
            empaddress: 'Required',
            netincome: 'Required',
            occupation: 'Required',
            otherStatus: null,
            specifyStatus: null,
            bizname: null,
            biznature: null,
            bizaddress: null,
            isbizreg: null,
            bizturnova: null
          }
        }));
      } else if (value === 'Self Employed') {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            empname: null,
            empaddress: null,
            netincome: null,
            occupation: null,
            otherStatus: null,
            specifyStatus: null,
            bizname: 'Required',
            biznature: 'Required',
            bizaddress: 'Required',
            // isbizreg: 'Required',
            bizturnova: 'Required'
          }
        }));
      } else if (value === 'Unemployed') {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            empname: null,
            empaddress: null,
            netincome: null,
            occupation: null,
            otherStatus: 'Required',
            specifyStatus: null,
            bizname: null,
            biznature: null,
            bizaddress: null,
            isbizreg: null,
            bizturnova: null
          }
        }));
      }
    }
    if (name === 'otherStatus') {
      this.setState((state) => ({
        specifyStatus: '',
        errors: {
          ...state.errors,
          specifyStatus: value === 'Others' ? 'Required' : null
        }
      }));
    }
    if (name === 'nokcountry') {
      this.setState({
        nokstate: '',
        noklga: '',
        nokstateOfProvince: ''
      });
      if (value === 'Nigeria') {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            nokstate: 'Required',
            noklga: 'Required',
            nokstateOfProvince: null
          }
        }));
      } else {
        this.setState((state) => ({
          errors: {
            ...state.errors,
            nokstate: null,
            noklga: null,
            nokstateOfProvince: 'Required'
          }
        }));
      }
    }
  }

  setVariables = () => {
    const { state } = this;
    return {
      ...this.props.customerData,
      occupation: state.occupation,
      empstatus: state.empstatus,
      otherStatus: state.otherStatus,
      specifyStatus: state.specifyStatus,
      empname: state.empname,
      empaddress: state.empaddress,
      netincome: state.netincome,
      bizname: state.bizname,
      biznature: state.biznature,
      bizaddress: state.bizaddress,
      isbizreg: state.isbizreg,
      bizturnova: state.bizturnova,
      noklastname: state.noklastname,
      nokmidname: state.nokmidname,
      nokfirstname: state.nokfirstname,
      nokrelation: state.nokrelation,
      nokemail: state.nokemail,
      noknumber: state.noknumber,
      nokstreetno: state.nokstreetno,
      nokstreetname: state.nokstreetname,
      noklandmark: state.noklandmark,
      nokcity: state.nokcity,
      noklga: state.noklga,
      nokstate: state.nokstate,
      nokstateOfProvince: state.nokstateOfProvince,
      nokcountry: state.nokcountry,
      marstatus: this.props.customerData.marstatus
    };
  }

  handleGoBack = () => {
    this.props.addCustomerData(this.setVariables());
    this.props.updateGoBackCount(this.state.goBackCount - 1);
    this.props.history.push('/onboarding/id-docs');
  }

  handleSubmit = async () => {
    const { state, props } = this;

    if (state.goBackCount < 0) {
      props.addCustomerData(this.setVariables());
      props.updateGoBackCount(state.goBackCount + 1);
      props.history.push('/onboarding/account-services');
      return;
    }

    this.setState({ isLoading: true });
    const submit = await submitTask(state.currentTask, 'Other Details', formatVariables(this.setVariables()));
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

  autoComplete = (name, value) => {
    this.setState({ [name]: value });
  }

  render() {
    const { state, props } = this;
    const disabled = props.customerData.gaurdianBvn && props.customerData.gaurdianBvn.length > 2;
    let workDetail;

    console.log(state.errors);
    switch (state.empstatus) {
    case 'Employed':
      workDetail = (
        <div className="flex">
          <TextInput
            label="Employer's Name" name="empname" value={state.empname} error={state.errors.empname}
            className="col-4" onChange={this.handleChange('isRequired')}
            onBlur={this.handleValidation('isRequired')} />
          <TextInput
            label="Employer's Address" name="empaddress" value={state.empaddress}
            error={state.errors.empaddress} className="col-5" onChange={this.handleChange('isRequired')}
            onBlur={this.handleValidation('isRequired')} />
          <SelectInput
            label="Estimated Annual Income" name="netincome" options={state.incomeRange}
            value={state.netincome} onChange={this.handleChange('isRequired')} className="col-3"
            error={state.errors.netincome} onBlur={this.handleValidation('isRequired')} />
        </div>
      );
      break;
    case 'Self Employed':
      workDetail = (
        <>
          <div className="flex">
            <TextInput
              label="Business Name" name="bizname" value={state.bizname} error={state.errors.bizname}
              className="col-4" onChange={this.handleChange('isRequired')}
              onBlur={this.handleValidation('isRequired')} />
            <TextInput
              label="Nature of Business" name="biznature" value={state.biznature}
              className="col-4" onChange={this.handleChange('isRequired')}
              error={state.errors.biznature} onBlur={this.handleValidation('isRequired')} />
            <label htmlFor="isbizreg" className="col-4">
              Is Business registered?
              <div>
                <RadioInput
                  label="Yes" name="isbizreg" value="yes" checked={state.isbizreg === 'yes'}
                  onChange={this.handleChange('')} className="col-6" />
                <RadioInput
                  label="No" name="isbizreg" value="no" checked={state.isbizreg === 'no'}
                  onChange={this.handleChange('')} className="col-6" />
              </div>
            </label>
          </div>
          <div className="flex">
            <TextInput
              label="Business Address" name="bizaddress" value={state.bizaddress}
              className="col-8" onChange={this.handleChange('isRequired')}
              error={state.errors.bizaddress} onBlur={this.handleValidation('isRequired')} />
            <SelectInput
              label="Estimated Annual Turnover" name="bizturnova" options={state.incomeRange}
              value={state.bizturnova} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.bizturnova} onBlur={this.handleValidation('isRequired')} />
          </div>
        </>
      );
      break;
    case 'Unemployed':
    default:
      workDetail = null;
      break;
    }
    return (
      <div>
        {state.isLoading && <IsLoading />}
        <div className="section-title">
          <h2>
            <span>4</span>
            Other Details
          </h2>
        </div>

        <fieldset>
          <legend>Employment Details:</legend>
          <div className="flex">
            <SelectInput
              label="Employment Status" name="empstatus" options={state.employmentStatus}
              value={state.empstatus} onChange={this.handleChange('isRequired')} className="col-4"
              onBlur={this.handleValidation('isRequired')} error={state.errors.empstatus} />
            {state.empstatus === 'Employed' &&
            (
              <AutoComplete
                label="Occupation" name="occupation" options={state.occupationList}
                value={state.occupation} onChange={this.handleChange('isRequired')} className="col-4"
                onBlur={this.handleValidation('isRequired')} error={state.errors.occupation}
                autoComplete={this.autoComplete} />
            )}
            {state.empstatus === 'Unemployed' &&
            (
              <SelectInput
                label="Other Status" name="otherStatus" options={state.otherStatusList}
                value={state.otherStatus} onChange={this.handleChange('isRequired')} className="col-4"
                onBlur={this.handleValidation('isRequired')} error={state.errors.otherStatus} />
            )}
            {state.otherStatus === 'Others' &&
            (
              <TextInput
                label="Specify" name="specifyStatus" value={state.specifyStatus}
                className="col-4" onChange={this.handleChange('isRequired')}
                error={state.errors.specifyStatus} onBlur={this.handleValidation('isRequired')} />
            )}
          </div>
          {workDetail}
        </fieldset>
        <fieldset>
          <legend>Next of Kin Details:</legend>
          <div className="flex">
            <TextInput
              label="Last Name" name="noklastname" value={state.noklastname} className="col-4"
              onChange={this.handleChange('isRequired, isAlpha')} disabled={disabled}
              onBlur={this.handleValidation('isRequired, isAlpha')} error={state.errors.noklastname} />
            <TextInput
              label="Middle Name" name="nokmidname" value={state.nokmidname} className="col-4"
              onChange={this.handleChange('isAlpha')} onBlur={this.handleValidation('isAlpha')}
              error={state.errors.nokmidname} disabled={disabled} />
            <TextInput
              label="First Name" name="nokfirstname" value={state.nokfirstname} className="col-4"
              onChange={this.handleChange('isRequired, isAlpha')} disabled={disabled}
              onBlur={this.handleValidation('isRequired, isAlpha')} error={state.errors.nokfirstname} />
          </div>
          <div className="flex">
            <TextInput
              label="Relationship" name="nokrelation" value={state.nokrelation} className="col-4"
              onChange={this.handleChange('isRequired, isAlpha')}
              onBlur={this.handleValidation('isRequired, isAlpha')} error={state.errors.nokrelation} />
            <TextInput
              label="Email Address" name="nokemail" value={state.nokemail} className="col-4"
              onChange={this.handleChange('isEmail')} error={state.errors.nokemail}
              onBlur={this.handleValidation('isEmail')} />
            <TextInput
              label="Phone Number" name="noknumber" value={state.noknumber} className="col-4"
              onChange={this.handleChange('isRequired, isPhoneNo')} error={state.errors.noknumber}
              onBlur={this.handleValidation('isRequired, isPhoneNo')} />
          </div>
          <div className="flex">
            <TextInput
              label="House No." name="nokstreetno" value={state.nokstreetno}
              className="col-2" onChange={this.handleChange('isRequired')}
              error={state.errors.nokstreetno} onBlur={this.handleValidation('isRequired')} />
            <TextInput
              label="Street Name" name="nokstreetname" value={state.nokstreetname}
              className="col-4" onChange={this.handleChange('isRequired')}
              error={state.errors.nokstreetname} onBlur={this.handleValidation('isRequired')} />
            <TextInput
              label="Landmark" name="noklandmark" value={state.noklandmark}
              className="col-3" onChange={this.handleChange('isRequired')}
              error={state.errors.noklandmark} onBlur={this.handleValidation('isRequired')} />
            <AutoComplete
              label="City/Town" name="nokcity" value={state.nokcity} className="col-3"
              options={state.nigeriaCities} onChange={this.handleChange('isRequired')}
              error={state.errors.nokcity} onBlur={this.handleValidation('isRequired')}
              autoComplete={this.autoComplete} />
          </div>
          <div className="flex">
            <SelectInput
              label="Country Of Residence" name="nokcountry" options={state.countries}
              value={state.nokcountry} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.nokcountry} onBlur={this.handleValidation('isRequired')} />
            {
              state.nokcountry === 'Nigeria' ? (
                <>
                  <SelectInput
                    label="State Of Residence" name="nokstate" options={state.states}
                    value={state.nokstate} onChange={this.handleChange('isRequired')} className="col-4"
                    error={state.errors.nokstate} onBlur={this.handleValidation('isRequired')} />
                  <SelectInput
                    label="LGA Of Residence" name="noklga" options={lgaData(this.state.nokstate)}
                    value={state.noklga} onChange={this.handleChange('isRequired')} className="col-4"
                    error={state.errors.noklga} onBlur={this.handleValidation('isRequired')} />
                </>
              ) :
                (
                  <TextInput
                    label="State of Province" name="nokstateOfProvince" value={state.nokstateOfProvince}
                    onChange={this.handleChange('isRequired')} onBlur={this.handleValidation('isRequired')}
                    className="col-4" error={state.errors.nokstateOfProvince} />
                )
            }
          </div>
        </fieldset>

        <div className="flex-spaced">
          <button type="button" onClick={this.handleGoBack} className="col-4 btn">
            <FiArrowLeft className="left" />
            Previous
          </button>
          <button type="button" onClick={this.handleSave} className="col-4 btn">Save</button>
          <button
            type="button" onClick={this.handleSubmit}
            className="col-4 btn" disabled={this.cantBeSubmitted()}>
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

export default connect(mapStateToProps, mapDispatchToProps)(OrtherDetailsForm);
