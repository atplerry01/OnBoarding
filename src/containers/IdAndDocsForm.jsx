/* eslint-disable camelcase */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

import { addCustomerData, updateGoBackCount } from '../actions/customerDataActions';
import getJson from '../apiCalls/jsonFilesCall';

import SelectInput from '../components/inputFeilds/SelectInput';
import TextInput from '../components/inputFeilds/TextInput';
import FileInput from '../components/inputFeilds/FileInput';
import MyWebcam from '../components/inputFeilds/MyWebcam';
import IsLoading from '../components/layouts/IsLoading';

import {
  getNextTask, submitTask, getFormVariables
} from '../apiCalls/camundaApi';
import { convertImgToBase64 } from '../utilities/ImageUtilities';
import { formatVariables, convertToObj } from '../utilities/camundaVariables';
import { gotoNextTask, saveFormVariables } from '../utilities/processFlowUtilities';
import { validateFile, validateField } from '../validation/validator';
import { formatDateforCamunda, formatDateforPicker } from '../utilities/dateTimeUtilities';
import notification from '../utilities/notification';

class IdAndDocsForm extends Component {
  constructor(props) {
    super(props);
    const { customerData } = props;
    this.state = {
      idTypes: [],
      errors: {},
      img_id: '',
      img_sign: '',
      img_selfie: '',
      img_utility: '',
      idtype: customerData.idtype || '',
      otherIdType: customerData.otherIdType || '',
      idno: customerData.idno || '',
      tin: customerData.tin || '',
      issdate: (customerData.issdate && formatDateforPicker(customerData.issdate)) || '',
      expdate: (customerData.expdate && formatDateforPicker(customerData.expdate)) || '',
      dImage_zimg_id_x: customerData.dImage_zimg_id_x || '',
      dImage_zimg_sign_x: customerData.dImage_zimg_sign_x || '',
      dImage_zimg_selfie_x: customerData.dImage_zimg_selfie_x || '',
      dImage_zimg_utility_x: customerData.dImage_zimg_utility_x || '',
      processInstanceId: localStorage.getItem('currentProcessInstance'),
      goBackCount: customerData.goBackCount || 0,
      useWebcam: false,
      isLoading: true
    };
  }

  componentDidMount = async () => {
    window.scrollTo(0, 0);
    const idTypes = await getJson('idtypes.json');
    this.setState({ idTypes });

    if (this.state.goBackCount < 0) {
      this.setState({ errors: {}, isLoading: false });
      return;
    }
    const { processInstanceId } = this.state;
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
        errors: {
          idtype: userData.idtype || state.idtype ? null : 'Required',
          otherIdType: (userData.idtype === 'Other ID Types' && !(userData.otherIdType)) ||
            (state.idtype === 'Other ID Types' && !(state.otherIdType)) ? 'Required' : null,
          img_id: userData.dImage_zimg_id_x || userData.idtype === 'None' ||
            state.dImage_zimg_id_x || state.idtype === 'None' ? null : 'Required',
          img_sign: userData.dImage_zimg_sign_x || state.dImage_zimg_sign_x || userData.isStaffAccount ?
            null : 'Required',
          img_selfie: userData.dImage_zimg_selfie_x || state.dImage_zimg_selfie_x || userData.isStaffAccount ?
            null : 'Required'
        }
      }));
    }
    this.setState({ isLoading: false });
  }

  handleChange = (...args) => async (e) => {
    try {
      const {
        name, value, type, files
      } = e.target;
      const { dImage_zimg_id_x } = this.state;
      const errorMsg = type === 'file' ?
        validateFile(files[0], args[0], args[1], args[2], args[3]) :
        validateField(value, args[0]);

      this.setState((state) => ({
        [name]: value,
        errors: { ...state.errors, [name]: errorMsg }
      }));

      if (type === 'file') {
        this.setState({
          [`dImage_z${name}_x`]: await convertImgToBase64(files[0])
        });
      }
      if (name === 'idtype') {
        this.setState({
          otherIdType: '',
          idno: '',
          issdate: '',
          expdate: ''
        });
        if (value === 'Drivers license' || value === 'International Passport') {
          this.setState((state) => ({
            errors: {
              ...state.errors,
              otherIdType: null,
              idno: 'Required',
              issdate: 'Required',
              expdate: 'Required',
              img_id: dImage_zimg_id_x ? null : 'Required'
            }
          }));
        } else if (value === 'National ID' || value === 'Permanent Voters ID' ||
          value === 'School ID card') {
          this.setState((state) => ({
            errors: {
              ...state.errors,
              otherIdType: null,
              idno: 'Required',
              issdate: 'Required',
              expdate: null,
              img_id: dImage_zimg_id_x ? null : 'Required'
            }
          }));
        } else if (value === 'Other ID Types') {
          this.setState((state) => ({
            errors: {
              ...state.errors,
              otherIdType: 'Required',
              idno: 'Required',
              issdate: 'Required',
              expdate: null,
              img_id: dImage_zimg_id_x ? null : 'Required'
            }
          }));
        } else if (value === 'None') {
          this.setState((state) => ({
            errors: {
              ...state.errors,
              otherIdType: null,
              idno: null,
              issdate: null,
              expdate: null,
              img_id: null
            }
          }));
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  handleFileValidation = (fileTypes, fileSize, isRequired, fileString) => (e) => {
    const { name, files } = e.target;
    const errorMsg = validateFile(files[0], fileTypes, fileSize, isRequired, fileString);

    this.setState((state) => ({
      errors: { ...state.errors, [name]: errorMsg }
    }));
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
    let { tierType } = props.customerData;

    if (state.idtype === 'Drivers license' || state.idtype === 'International Passport' ||
      state.idtype === 'National ID' || state.idtype === 'Permanent Voters ID') tierType = 3;
    return {
      ...props.customerData,
      tierType,
      idtype: state.idtype,
      otherIdType: state.otherIdType,
      idno: state.idno,
      tin: state.tin,
      issdate: state.issdate && formatDateforCamunda(state.issdate),
      expdate: state.expdate && formatDateforCamunda(state.expdate),
      dImage_zimg_id_x: state.dImage_zimg_id_x,
      dImage_zimg_sign_x: state.dImage_zimg_sign_x,
      dImage_zimg_selfie_x: state.dImage_zimg_selfie_x,
      dImage_zimg_utility_x: state.dImage_zimg_utility_x
    };
  }

  handleGoBack = () => {
    const { state, props } = this;
    props.addCustomerData(this.setVariables());
    props.updateGoBackCount(state.goBackCount - 1);
    props.history.push('/onboarding/customer-details');
  }

  handleSubmit = async () => {
    const { state, props } = this;

    if (state.goBackCount < 0) {
      props.addCustomerData(this.setVariables());
      props.updateGoBackCount(state.goBackCount + 1);
      props.history.push('/onboarding/other-details');
      return;
    }
    this.setState({ isLoading: true });

    const submit = await submitTask(state.currentTask, 'ID Documents', formatVariables(this.setVariables()));
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

  toggleWebcam = (currentWCField) => {
    this.setState((state) => ({
      useWebcam: !state.useWebcam,
      currentWCField
    }));
  }

  handleCapture = (imageString) => {
    const { currentWCField } = this.state;
    const errorField = currentWCField.replace(/(dImage_z|_x)/ig, '');
    this.setState((state) => ({
      errors: {
        ...state.errors,
        [errorField]: null
      },
      [currentWCField]: imageString,
      useWebcam: !state.useWebcam
    }));
  }

  handleSave = async () => {
    this.setState({ isLoading: true });
    await saveFormVariables(this, this.setVariables());
    this.setState({ isLoading: false });
  }

  render() {
    const { state, props } = this;
    const idImgRequired = state.idtype !== 'None';
    const selfieSignRequired = !props.customerData.isStaffAccount;
    let renderedIdTypes;

    console.log(state.errors);
    if (props.customerData.isStaffAccount) {
      renderedIdTypes = [
        'Select item...',
        'Drivers license',
        'International Passport',
        'National ID',
        'Permanent Voters ID',
        'None'
      ];
    } else if (props.customerData.accountType === 'Current' ||
    props.customerData.accountType === 'Domiciliary') {
      renderedIdTypes = [
        'Select item...',
        'Drivers license',
        'International Passport',
        'National ID',
        'Permanent Voters ID'
      ];
    } else renderedIdTypes = state.idTypes;

    let idFields = null;
    switch (state.idtype) {
    case 'Other ID Types':
    case 'National ID':
    case 'Permanent Voters ID':
    case 'School ID card':
      idFields =
      (
        <>
          <TextInput
            label="ID No." name="idno" value={state.idno} error={state.errors.idno} className="col-4"
            onBlur={this.handleValidation('isRequired')} onChange={this.handleChange('isRequired')} />
          <TextInput
            label="Issue Date" name="issdate" value={state.issdate} maxDate={formatDateforPicker(new Date())}
            onChange={this.handleChange('isRequired, isValidIssueDate')} className="col-4" type="date"
            error={state.errors.issdate} onBlur={this.handleValidation('isRequired, isValidIssueDate')} />
        </>
      );
      break;
    case 'Drivers license':
    case 'International Passport':
      idFields =
      (
        <>
          <TextInput
            label="ID No." name="idno" value={state.idno} error={state.errors.idno} className="col-4"
            onBlur={this.handleValidation('isRequired')} onChange={this.handleChange('isRequired')} />
          <TextInput
            label="Issue Date" name="issdate" value={state.issdate} maxDate={formatDateforPicker(new Date())}
            onChange={this.handleChange('isRequired, isValidIssueDate')} className="col-4" type="date"
            error={state.errors.issdate} onBlur={this.handleValidation('isRequired, isValidIssueDate')} />
          <TextInput
            label="Expiry Date" name="expdate" value={state.expdate} minDate={state.issdate}
            onChange={this.handleChange('isRequired, isNotExpired')} className="col-4" type="date"
            error={state.errors.expdate} onBlur={this.handleValidation('isRequired, isNotExpired')} />
        </>
      );
      break;
    case 'None':
    default: break;
    }

    return (
      <div>
        {state.isLoading && <IsLoading />}
        <div className="section-title">
          <h2>
            <span>3</span>
            Means of Identification
          </h2>
        </div>

        <fieldset>
          <legend>Valid Means of Identification:</legend>
          <div className="flex">
            <SelectInput
              label="Identity Type" name="idtype" options={renderedIdTypes}
              value={state.idtype} onChange={this.handleChange('isRequired')} className="col-4"
              error={state.errors.idtype} onBlur={this.handleValidation('isRequired')} />
            {state.idtype === 'Other ID Types' && (
              <TextInput
                label="Specify ID Type" name="otherIdType" value={state.otherIdType}
                error={state.errors.otherIdType} className="col-4"
                onBlur={this.handleValidation('isRequired')} onChange={this.handleChange('isRequired')} />
            )}
            <TextInput
              label="Tax ID No." name="tin" value={state.tin} error={state.errors.tin} className="col-4"
              onBlur={this.handleValidation('')} onChange={this.handleChange('')} />
          </div>
          <div className="flex">{idFields}</div>
          <div className="flex">
            {idImgRequired &&
            (
              <div className="col-4">
                <FileInput
                  label="Means of Identification" name="img_id" value={state.img_id}
                  onChange={this.handleChange('jpeg, png, gif', 200, idImgRequired, state.dImage_zimg_id_x)}
                  className="w-100" error={state.errors.img_id} note="(Max size: 200KB)"
                  onBlur={this.handleFileValidation('jpeg, png, gif', 200, idImgRequired, state.dImage_zimg_id_x)} />
                {
                  state.dImage_zimg_id_x && state.dImage_zimg_id_x.length > 5 &&
                  !state.dImage_zimg_id_x.includes(';base64,') ?
                    (
                      <div className="w-100">
                        <a href={state.dImage_zimg_id_x}>Preview Image</a>
                      </div>
                    ) :
                    (
                      <div className="w-100 img-preview p-r">
                        <img src={state.dImage_zimg_id_x} alt="" />
                      </div>
                    )
                }
                <button
                  type="button" className="btn btn-sm btn-outline w-100"
                  onClick={() => this.toggleWebcam('dImage_zimg_id_x')}>
                  Use Webcam
                </button>
              </div>
            )}
            <div className="col-4">
              <FileInput
                label="Signature" name="img_sign" value={state.img_sign}
                onChange={this.handleChange('jpeg, png, gif', 200, selfieSignRequired, state.dImage_zimg_sign_x)}
                className="w-100" error={state.errors.img_sign} note="(Max size: 200KB)"
                onBlur={this.handleFileValidation('jpeg, png, gif', 200,
                  selfieSignRequired, state.dImage_zimg_sign_x)} />
              {
                state.dImage_zimg_sign_x && state.dImage_zimg_sign_x.length > 5 &&
                !state.dImage_zimg_sign_x.includes(';base64,') ?
                  (
                    <div className="w-100">
                      <a href={state.dImage_zimg_sign_x}>Preview Image</a>
                    </div>
                  ) :
                  (
                    <div className="w-100 img-preview p-r">
                      <img src={state.dImage_zimg_sign_x} alt="" />
                    </div>
                  )
              }
              <button
                type="button" className="btn btn-sm btn-outline w-100"
                onClick={() => this.toggleWebcam('dImage_zimg_sign_x')}>
                Use Webcam
              </button>
            </div>
            <div className="col-4">
              <FileInput
                label="Selfie/Picture" name="img_selfie" value={state.img_selfie}
                onChange={this.handleChange('jpeg, png, gif', 200, selfieSignRequired, state.dImage_zimg_selfie_x)}
                className="w-100" error={state.errors.img_selfie} note="(Max size: 200KB)"
                onBlur={this.handleFileValidation('jpeg, png, gif', 200,
                  selfieSignRequired, state.dImage_zimg_selfie_x)} />
              {
                state.dImage_zimg_selfie_x && state.dImage_zimg_selfie_x.length > 5 &&
                !state.dImage_zimg_selfie_x.includes(';base64,') ?
                  (
                    <div className="w-100">
                      <a href={state.dImage_zimg_selfie_x}>Preview Image</a>
                    </div>
                  ) :
                  (
                    <div className="w-100 img-preview p-r">
                      <img src={state.dImage_zimg_selfie_x} alt="" />
                    </div>
                  )
              }
              <button
                type="button" className="btn btn-sm btn-outline w-100"
                onClick={() => this.toggleWebcam('dImage_zimg_selfie_x')}>
                Use Webcam
              </button>
            </div>
            <div className="col-4">
              <FileInput
                label="Utility Bill" name="img_utility" value={state.img_utility}
                onChange={this.handleChange('jpeg, png, gif', 200, false, state.dImage_zimg_utility_x)}
                className="w-100" error={state.errors.img_utility} note="(Max size: 200KB)"
                onBlur={this.handleFileValidation('jpeg, png, gif', 200, false, state.dImage_zimg_utility_x)} />
              {
                state.dImage_zimg_utility_x && state.dImage_zimg_utility_x.length > 5 &&
                !state.dImage_zimg_utility_x.includes(';base64,') ?
                  (
                    <div className="w-100">
                      <a href={state.dImage_zimg_utility_x}>Preview Image</a>
                    </div>
                  ) :
                  (
                    <div className="w-100 img-preview p-r">
                      <img src={state.dImage_zimg_utility_x} alt="" />
                    </div>
                  )
              }
              <button
                type="button" className="btn btn-sm btn-outline w-100"
                onClick={() => this.toggleWebcam('dImage_zimg_utility_x')}>
                Use Webcam
              </button>
            </div>
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
        {state.useWebcam &&
        (
          <div className="webcam-modal">
            <MyWebcam handleCapture={this.handleCapture} cancelWebcam={this.toggleWebcam} />
          </div>
        )}
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

export default connect(mapStateToProps, mapDispatchToProps)(IdAndDocsForm);
