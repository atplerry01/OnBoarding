/* eslint-disable max-len */
import React, { Component } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { connect } from 'react-redux';
import { addCustomerData, updateGoBackCount } from '../actions/customerDataActions';
import { getFormVariables, getNextTask, submitTask } from '../apiCalls/camundaApi';
import CheckboxInput from '../components/inputFeilds/CheckboxInput';
import IsLoading from '../components/layouts/IsLoading';
import ReviewTabNavBtn from '../components/ReviewTabBtn';
import AccountServicesTab from '../components/reviewTabs/AccountServicesTab';
import CustomerDetailsTab from '../components/reviewTabs/CustomerDetailsTab';
import IdAndDocsTab from '../components/reviewTabs/IdAndDocsTab';
import OrtherDetailsTab from '../components/reviewTabs/OrtherDetailsTab';
import { convertToObj, formatVariables } from '../utilities/camundaVariables';
import { formatDate } from '../utilities/dateTimeUtilities';
import notification from '../utilities/notification';
import { gotoNextTask, saveFormVariables } from '../utilities/processFlowUtilities';



class ReviewPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTabId: 0,
      processInstanceId: localStorage.getItem('currentProcessInstance'),
      goBackCount: props.customerData.goBackCount || 0,
      acceptTandC: 'false',
      acceptDataContent: 'false',
      isShowingTandC: false,
      isShowingDataConsent: false,
      isLoading: true
    };
  }

  componentDidMount = async () => {
    window.scrollTo(0, 0);
    const { processInstanceId } = this.state;
    console.log(processInstanceId);
    const task = await getNextTask(processInstanceId);
    console.log(task);
    if (task) {
      if (this.props.customerData.continueProcess) {
        let userData = await getFormVariables(task.id);
        userData = convertToObj(userData, processInstanceId);
        this.props.addCustomerData({ ...userData, continueProcess: false });
      }
      this.setState({ currentTask: task.id });
    }
    this.setState({ isLoading: false });
  }

  handleTCChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value === 'true' ? 'false' : 'true' });
  }

  handleDataConsenthange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value === 'true' ? 'false' : 'true' });
  }
  
  toogleTandCModal = () => {
    this.setState((state) => ({
      isShowingTandC: !state.isShowingTandC,
      acceptTandC: 'false'
    }));
  }

  toogleDataConsent = () => {
    this.setState((state) => ({
      isShowingDataConsent: !state.isShowingDataConsent,
      acceptDataContent: 'false'
    }));
  }

  handleGoBack = () => {
    this.props.updateGoBackCount(this.state.goBackCount - 1);
    this.props.history.push('/onboarding/account-services');
  }

  handleSubmit = async () => {
    const { state, props } = this;

    this.setState({ isLoading: true });
    const variables = {
      ...this.props.customerData,
      accountNo: props.customerData.watchlist === '0' ? 'Pending' : 'Awaiting Compliance',
      reviewed: true,
      acceptTandC: true,
      acceptDataContent: true
    };
    const submit = await submitTask(state.currentTask, 'Account Opening', formatVariables(variables));
    console.log(submit);
    if (submit === 'Successful') {
      props.addCustomerData(variables);
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
    const variables = {
      ...this.props.customerData
    };
    await saveFormVariables(this, variables);
    this.setState({ isLoading: false });
  }

  handleTabIdUpdate = (id) => {
    this.setState({
      currentTabId: id
    });
  }

  render() {
    const { state, props: { customerData } } = this;

    let currentTab;
    switch (state.currentTabId) {
    case 0:
      currentTab = (
        <CustomerDetailsTab
          isStaffAccount={customerData.isStaffAccount}
          newStaffEmployeeId={customerData.newStaffEmployeeId}
          accountType={customerData.accountType}
          currency={customerData.currency}
          tierType={customerData.tierType}
          bvn={customerData.bvn}
          gaurdianBvn={customerData.gaurdianBvn}
          title={customerData.title}
          firstname={customerData.firstname}
          middlename={customerData.middlename}
          lastname={customerData.lastname}
          gender={customerData.gender}
          religion={customerData.religion}
          dob={customerData.dob && formatDate(customerData.dob)}
          pob={customerData.pob}
          countryOfBirth={customerData.countryOfBirth}
          marstatus={customerData.marstatus}
          nationality={customerData.nationality}
          stateoforigin={customerData.stateoforigin}
          lgaoforigin={customerData.lgaoforigin}
          respermit={customerData.respermit}
          respermisdate={customerData.respermisdate && formatDate(customerData.respermisdate)}
          respermexdate={customerData.respermexdate && formatDate(customerData.respermexdate)}
          streetno={customerData.streetno}
          street={customerData.street}
          landmark={customerData.landmark}
          city={customerData.city}
          lga={customerData.lga}
          state={customerData.state}
          stateOfProvince={customerData.stateOfProvince}
          country={customerData.country}
          isMultipleCitizenship={customerData.isMultipleCitizenship}
          secondCountry={customerData.secondCountry}
          secondAddress={customerData.secondAddress}
          secondTin={customerData.secondTin}
          phonenumber1={customerData.phonenumber1}
          phonenumber2={customerData.phonenumber2}
          email={customerData.email}
          staffid={customerData.staffid}
          relationshipmanagerid={customerData.relationshipmanagerid}
          branchCode={customerData.branchCode}
          preferredBranchCode={customerData.preferredBranchCode}
        />
      );
      break;
    case 1:
      currentTab = (
        <IdAndDocsTab
          idtype={customerData.idtype}
          otherIdType={customerData.otherIdType}
          idno={customerData.idno}
          tin={customerData.tin}
          issdate={customerData.issdate && formatDate(customerData.issdate)}
          expdate={customerData.expdate && formatDate(customerData.expdate)}
          dImage_zimg_id_x={customerData.dImage_zimg_id_x}
          dImage_zimg_sign_x={customerData.dImage_zimg_sign_x}
          dImage_zimg_selfie_x={customerData.dImage_zimg_selfie_x}
          dImage_zimg_utility_x={customerData.dImage_zimg_utility_x}
        />
      );
      break;
    case 2:
      currentTab = (
        <OrtherDetailsTab
          occupation={customerData.occupation}
          empstatus={customerData.empstatus}
          otherStatus={customerData.otherStatus}
          specifyStatus={customerData.specifyStatus}
          empname={customerData.empname}
          empaddress={customerData.empaddress}
          netincome={customerData.netincome}
          bizname={customerData.bizname}
          biznature={customerData.biznature}
          bizaddress={customerData.bizaddress}
          isbizreg={customerData.isbizreg}
          bizturnova={customerData.bizturnova}
          noklastname={customerData.noklastname}
          nokmidname={customerData.nokmidname}
          nokfirstname={customerData.nokfirstname}
          nokrelation={customerData.nokrelation}
          nokemail={customerData.nokemail}
          noknumber={customerData.noknumber}
          nokstreetno={customerData.nokstreetno}
          nokstreetname={customerData.nokstreetname}
          noklandmark={customerData.noklandmark}
          nokcity={customerData.nokcity}
          noklga={customerData.noklga}
          nokstate={customerData.nokstate}
          nokstateOfProvince={customerData.nokstateOfProvince}
          nokcountry={customerData.nokcountry}
        />
      );
      break;
    case 3:
      currentTab = (
        <AccountServicesTab
          requestcheq={customerData.requestcheq}
          requestcard={customerData.requestcard}
          requestussd={customerData.requestussd}
          requestalert={customerData.requestalert}
          refereeMode={customerData.refereeMode}
          refereename1={customerData.refereename1}
          refereeemail1={customerData.refereeemail1}
          refereephoneno1={customerData.refereephoneno1}
          refereename2={customerData.refereename2}
          refereeemail2={customerData.refereeemail2}
          refereephoneno2={customerData.refereephoneno2}
          accountType={customerData.accountType}
        />
      );
      break;
    default:
      currentTab = null;
    }
    const sectionText = ['Customer Details', 'ID and Docs', 'Other Details', 'Account Services'];
    const sectionTabs = [];

    for (let i = 0; i < 4; i++) {
      const currentTabClass = 'current-nav-tab';
      sectionTabs.push(<ReviewTabNavBtn
        text={sectionText[i]}
        className={state.currentTabId === i ? currentTabClass : ''}
        handleClick={() => this.handleTabIdUpdate(i)}
        key={i} />);
    }
    return (
      <div>
        {state.isLoading && <IsLoading />}
        <div className="section-title">
          <h2>
            <span>6</span>
            Confirmation Page
          </h2>
        </div>
        <div>
          <ul className="tabs-nav">{sectionTabs}</ul>
          {currentTab}
          <div className="flex-spaced">
            <button type="button" onClick={this.handleGoBack} className="col-4 btn">
              <FiArrowLeft className="left" />
              Previous
            </button>
            <button type="button" onClick={this.handleSave} className="col-4 btn">Save</button>
            <button type="button" onClick={this.toogleTandCModal} className="col-4 btn">Complete/Submit</button>
          </div>
        </div>

        {state.isShowingTandC && (
          <div className="preview-overlay">
            <div className="inner-box">
              <h3 className="center-text">Terms and Conditions</h3>
              <p className="m-t-20">I undertake to advise Wema Bank within 30 days of any change in circumstances which affects the tax residency status of the individual identified in this form or causes the information contained herein to become incorrect or incomplete, and to provide Wema Bank with a suitably updated self-certification and declaration within up to 30 days of such change in circumstances.</p>
              <CheckboxInput
                label="I agree to the above terms and conditions."
                name="acceptTandC" className="col-12 m-t-20" onChange={this.handleTCChange}
                value={state.acceptTandC} checked={state.acceptTandC === 'true'} />
              <div className="flex-spaced">
                <button
                  type="button" onClick={this.handleSubmit}
                  disabled={state.acceptTandC === 'false'} className="col-5 btn no-m">
                  Submit Form
                </button>
                <button
                  type="button" onClick={this.toogleTandCModal}
                  className="col-5 btn no-m">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {state.isShowingDataConsent && (
          <div className="preview-overlay">
            <div className="inner-box">
              <h3 className="center-text">Data Consent</h3>
              <p className="m-t-20">I undertake to advise Wema Bank within 30 days of any change in circumstances which affects the tax residency status of the individual identified in this form or causes the information contained herein to become incorrect or incomplete, and to provide Wema Bank with a suitably updated self-certification and declaration within up to 30 days of such change in circumstances.</p>
              <CheckboxInput
                label="I agree to the above terms and conditions."
                name="acceptDataContent" className="col-12 m-t-20" onChange={this.handleDataConsenthange}
                value={state.acceptDataContent} checked={state.acceptDataContent === 'true'} />
              <div className="flex-spaced">
                <button
                  type="button" onClick={this.handleSubmit}
                  disabled={state.acceptDataContent === 'false'} className="col-5 btn no-m">
                  Submit Form
                </button>
                <button
                  type="button" onClick={this.toogleDataConsent}
                  className="col-5 btn no-m">
                  Cancel
                </button>
              </div>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ReviewPage);
