import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

import TextInput from '../components/inputFeilds/TextInput';
import CheckboxInput from '../components/inputFeilds/CheckboxInput';
import SelectInput from '../components/inputFeilds/SelectInput';
import IsLoading from '../components/layouts/IsLoading';

import getJson from '../apiCalls/jsonFilesCall';

import { addCustomerData, updateGoBackCount } from '../actions/customerDataActions';
import {
  getNextTask, submitTask, getFormVariables
} from '../apiCalls/camundaApi';
import { formatVariables, convertToObj } from '../utilities/camundaVariables';
import { gotoNextTask, saveFormVariables } from '../utilities/processFlowUtilities';
import { validateField } from '../validation/validator';
import notification from '../utilities/notification';

class AccountServicesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      atmCards: [],
      errors: {},
      isLoading: true,
      requestcheq: props.customerData.requestcheq ? 'true' : 'false',
      requestcard: props.customerData.requestcard || '',
      requestussd: props.customerData.requestussd ? 'true' : 'false',
      requestalert: props.customerData.requestalert || '',
      refereeMode: props.customerData.refereeMode || 'Via Email',
      refereename1: props.customerData.refereename1 || '',
      refereeemail1: props.customerData.refereeemail1 || '',
      refereephoneno1: props.customerData.refereephoneno1 || '',
      refereename2: props.customerData.refereename2 || '',
      refereeemail2: props.customerData.refereeemail2 || '',
      refereephoneno2: props.customerData.refereephoneno2 || '',
      processInstanceId: localStorage.getItem('currentProcessInstance'),
      goBackCount: props.customerData.goBackCount || 0
    };
  }

  componentDidMount = async () => {
    window.scrollTo(0, 0);
    const atmCards = await getJson('atmCardTypes.json');
    this.setState({ atmCards });

    const { state, props: { customerData: { accountType } } } = this;
    if (state.goBackCount < 0) {
      this.setState({ errors: {}, isLoading: false });
      return;
    }
    const task = await getNextTask(state.processInstanceId);

    console.log(task);
    if (task) {
      let userData = {};
      if (this.props.customerData.continueProcess) {
        userData = await getFormVariables(task.id);
        userData = convertToObj(userData, state.processInstanceId);
        this.props.addCustomerData({ ...userData, continueProcess: false });
      }
      let refereeErrors = {};
      if ((userData.requestcheq || state.requestcheq === 'true') &&
        (userData.refereeMode === 'Via Email' || state.refereeMode === 'Via Email')) {
        refereeErrors = {
          refereename1: userData.refereename1 || state.refereename1 ? null : 'Required',
          refereeemail1: userData.refereeemail1 || state.refereeemail1 ? null : 'Required',
          refereephoneno1: userData.refereephoneno1 || state.refereephoneno1 ? null : 'Required'
        };
      }
      if ((userData.accountType === 'Current' || accountType === 'Current') &&
        (userData.refereeMode === 'Via Email' || state.refereeMode === 'Via Email')) {
        refereeErrors = {
          refereename1: userData.refereename1 || state.refereename1 ? null : 'Required',
          refereeemail1: userData.refereeemail1 || state.refereeemail1 ? null : 'Required',
          refereephoneno1: userData.refereephoneno1 || state.refereephoneno1 ? null : 'Required',
          refereename2: userData.refereename2 || state.refereename2 ? null : 'Required',
          refereeemail2: userData.refereeemail2 || state.refereeemail2 ? null : 'Required',
          refereephoneno2: userData.refereephoneno2 || state.refereephoneno2 ? null : 'Required'
        };
      }
      this.setState((prevState) => ({
        ...userData,
        currentTask: task.id,
        errors: {
          ...refereeErrors,
          requestalert: userData.requestalert || prevState.requestalert ? null : 'Required',
          requestcard: userData.requestcard || prevState.requestcard ? null : 'Required'
        }
      }));
    }
    this.setState({ isLoading: false });
  }

  handleGoBack = () => {
    this.props.addCustomerData(this.setVariables());
    this.props.updateGoBackCount(this.state.goBackCount - 1);
    this.props.history.push('/onboarding/other-details');
  }

  handleChange = (errorType) => (e) => {
    const { name, value, type } = e.target;
    const { props: { customerData: { accountType } }, state } = this;
    const errorMsg = validateField(value, errorType);

    let refereeErrors = {};

    if ((name === 'requestcheq' && accountType !== 'Current') || name === 'refereeMode') {
      this.setState({
        refereename1: '',
        refereeemail1: '',
        refereephoneno1: '',
        refereename2: '',
        refereeemail2: '',
        refereephoneno2: ''
      });
    }

    if (type === 'checkbox') {
      if (name === 'requestcheq' && accountType !== 'Current' && state.refereeMode === 'Via Email') {
        if (state.requestcheq === 'false') {
          refereeErrors = {
            refereename1: state.refereename1 ? null : 'Required',
            refereeemail1: state.refereeemail1 ? null : 'Required',
            refereephoneno1: state.refereephoneno1 ? null : 'Required'
          };
        } else if (state.requestcheq === 'true') {
          refereeErrors = {
            refereename1: null,
            refereeemail1: null,
            refereephoneno1: null
          };
        }
      }
      this.setState((state) => ({
        [name]: value === 'true' ? 'false' : 'true',
        errors: {
          ...state.errors,
          ...refereeErrors
        }
      }));
    } else {
      if (name === 'refereeMode') {
        if (value === 'Via Email') {
          if (accountType === 'Current') {
            refereeErrors = {
              refereename1: state.refereename1 ? null : 'Required',
              refereeemail1: state.refereeemail1 ? null : 'Required',
              refereephoneno1: state.refereephoneno1 ? null : 'Required',
              refereename2: state.refereename2 ? null : 'Required',
              refereeemail2: state.refereeemail2 ? null : 'Required',
              refereephoneno2: state.refereephoneno2 ? null : 'Required'
            };
          }
          if (accountType !== 'Current' && state.requestcheq === 'true') {
            refereeErrors = {
              refereename1: state.refereename1 ? null : 'Required',
              refereeemail1: state.refereeemail1 ? null : 'Required',
              refereephoneno1: state.refereephoneno1 ? null : 'Required'
            };
          }
        } else {
          refereeErrors = {
            refereename1: null,
            refereeemail1: null,
            refereephoneno1: null,
            refereename2: null,
            refereeemail2: null,
            refereephoneno2: null
          };
        }
      }
      this.setState((state) => ({
        [name]: value,
        errors: { ...state.errors, ...refereeErrors, [name]: errorMsg }
      }));
    }
  }

  handleValidation = (errorType) => (e) => {
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

  setVariables = () => {
    const { state, props } = this;
    let refereeDetails = {};

    if (props.customerData.accountType === 'Current' || state.requestcheq === 'true') {
      refereeDetails = {
        refereeMode: state.refereeMode,
        refereename1: state.refereename1,
        refereeemail1: state.refereeemail1,
        refereephoneno1: state.refereephoneno1,
        refereename2: state.refereename2,
        refereeemail2: state.refereeemail2,
        refereephoneno2: state.refereephoneno2
      };
    }
    return {
      ...this.props.customerData,
      ...refereeDetails,
      requestcheq: state.requestcheq === 'true',
      requestcard: state.requestcard,
      requestussd: state.requestussd === 'true',
      requestalert: state.requestalert
    };
  }

  handleSubmit = async () => {
    const { state, props } = this;
    if (state.goBackCount < 0) {
      props.addCustomerData(this.setVariables());
      props.updateGoBackCount(state.goBackCount + 1);
      props.history.push('/onboarding/review-details');
      return;
    }
    this.setState({ isLoading: true });
    const submit = await submitTask(state.currentTask, 'Account Services', formatVariables(this.setVariables()));
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
  };

  handleSave = async () => {
    this.setState({ isLoading: true });
    await saveFormVariables(this, this.setVariables());
    this.setState({ isLoading: false });
  }

  render() {
    const { state, props: { customerData: { accountType } } } = this;
    const ref2Required = accountType === 'Current' ? 'isRequired' : '';
    let { atmCards } = state;
    let alertTypes = ['Select item...', 'Both', 'Email', 'SMS'];
    if (accountType === 'Domiciliary') {
      atmCards = [...atmCards, 'None'];
      alertTypes = [...alertTypes, 'None'];
    }

    console.log(state.errors);
    return (
      <div>
        {state.isLoading && <IsLoading />}
        <div className="section-title">
          <h2>
            <span>5</span>
            Account Services
          </h2>
        </div>

        <fieldset>
          <legend>Select Account Services:</legend>
          <div>
            <CheckboxInput
              label="Cheque Book" name="requestcheq" className="col-6" onChange={this.handleChange('')}
              value={state.requestcheq} checked={state.requestcheq === 'true'} />
            <SelectInput
              label="Select Card Type" name="requestcard" options={atmCards}
              value={state.requestcard} onChange={this.handleChange('isRequired')} className="col-6"
              error={state.errors.requestcard} onBlur={this.handleValidation('isRequired')} />
          </div>
          <div>
            <CheckboxInput
              label="Register for USSD" name="requestussd" className="col-6" onChange={this.handleChange('')}
              value={state.requestussd} checked={state.requestussd === 'true'} />
            <SelectInput
              label="Request SMS or/and Email alert" options={alertTypes}
              name="requestalert" error={state.errors.requestalert} onBlur={this.handleValidation('isRequired')}
              value={state.requestalert} onChange={this.handleChange('isRequired')} className="col-6" />
          </div>
        </fieldset>
        {(accountType === 'Current' || state.requestcheq === 'true') &&
          (
            <fieldset>
              <legend>Referee Information:</legend>
              <div className="row">
                <SelectInput
                  label="Referee Details Collection Mode" options={['Via Email', 'Via Hard Copy']}
                  name="refereeMode" error={state.errors.refereeMode} onBlur={this.handleValidation('')}
                  value={state.refereeMode} onChange={this.handleChange('')} className="col-6" />
              </div>
              {state.refereeMode === 'Via Email' &&
              (
                <>
                  <div className="row">
                    <TextInput
                      label="Name of Referee 1" name="refereename1" value={state.refereename1}
                      onChange={this.handleChange('isRequired')} className="col-4"
                      onBlur={this.handleValidation('isRequired')} error={state.errors.refereename1} />
                    <TextInput
                      label="Referee 1 Email" name="refereeemail1" value={state.refereeemail1}
                      onChange={this.handleChange('isRequired, isEmail')} className="col-4"
                      onBlur={this.handleValidation('isRequired, isEmail')} error={state.errors.refereeemail1} />
                    <TextInput
                      label="Referee 1 Phone No." name="refereephoneno1" value={state.refereephoneno1}
                      onChange={this.handleChange('isRequired, isPhoneNo')} className="col-4"
                      onBlur={this.handleValidation('isRequired, isPhoneNo')} error={state.errors.refereephoneno1} />
                  </div>
                  <div className="row">
                    <TextInput
                      label="Name of Referee 2" name="refereename2" value={state.refereename2}
                      onChange={this.handleChange(ref2Required)} className="col-4"
                      onBlur={this.handleValidation(ref2Required)} error={state.errors.refereename2} />
                    <TextInput
                      label="Referee 2 Email" name="refereeemail2" value={state.refereeemail2}
                      onChange={this.handleChange(`${ref2Required}, isEmail`)} className="col-4"
                      onBlur={this.handleValidation(`${ref2Required}, isEmail`)}
                      error={state.errors.refereeemail2} />
                    <TextInput
                      label="Referee 2 Phone No." name="refereephoneno2" value={state.refereephoneno2}
                      onChange={this.handleChange(`${ref2Required}, isPhoneNo`)} className="col-4"
                      onBlur={this.handleValidation(`${ref2Required}, isPhoneNo`)}
                      error={state.errors.refereephoneno2} />
                  </div>
                </>
              )}
            </fieldset>
          )}
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

export default connect(mapStateToProps, mapDispatchToProps)(AccountServicesForm);
