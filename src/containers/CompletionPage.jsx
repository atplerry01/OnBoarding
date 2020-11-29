/* eslint-disable no-restricted-globals */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import { connect } from 'react-redux';

import ReviewTabNavBtn from '../components/ReviewTabBtn';
import CustomerDetailsTab from '../components/reviewTabs/CustomerDetailsTab';
import IdAndDocsTab from '../components/reviewTabs/IdAndDocsTab';
import OrtherDetailsTab from '../components/reviewTabs/OrtherDetailsTab';
import AccountServicesTab from '../components/reviewTabs/AccountServicesTab';
import IsLoading from '../components/layouts/IsLoading';

import { getNextTask, getFormVariables, submitTask } from '../apiCalls/camundaApi';
import { convertToObj, formatVariables } from '../utilities/camundaVariables';
import notification from '../utilities/notification';
import { formatDate } from '../utilities/dateTimeUtilities';
import CheckboxSlide from '../components/inputFeilds/CheckboxSlide';
import { saveFormVariables } from '../utilities/processFlowUtilities';

class CompletionPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTabId: 0,
      processInstanceId: localStorage.getItem('currentProcessInstance'),
      isReportable: 'no',
      isLoading: true
    };
  }

  componentDidMount = async () => {
    window.scrollTo(0, 0);
    const { processInstanceId } = this.state;
    const task = this.props.compType === 'complianceDetails' ?
      await getNextTask(processInstanceId, 'UserTask_compliance') :
      await getNextTask(processInstanceId, 'Task_0wpubgg');

    if (task) {
      let userData = await getFormVariables(task.id);
      userData = convertToObj(userData, processInstanceId);
      console.log(userData);
      this.setState({ ...userData, currentTask: task.id });
    }
    this.setState({ isLoading: false });
  }

  handleReportableToggle = async (e) => {
    const { name, value } = e.target;
    const { isReportable } = this.state;

    const state = isReportable === 'no' ? 'Reportable' : 'Not Reportable';
    const confirmAction = confirm(`Click OK to mark this customer as ${state}`);

    if (!confirmAction) return;

    this.setState({ isLoading: true });
    const variables = { ...this.state, isReportable: value === 'yes' ? 'no' : 'yes' };
    Reflect.deleteProperty(variables, 'currentTabId');

    const res = await saveFormVariables(this, variables);
    this.setState({ isLoading: false });

    if (res) {
      this.setState({ [name]: value === 'yes' ? 'no' : 'yes' });
    }
  }

  handleSubmitCompliance = async (isApproved) => {
    const response = window
      .confirm(`Click 'OK' to confirm your ${isApproved ? 'Approval' : 'Rejection'} of this Compliance.`);
    if (!response) return;

    const { state, props } = this;
    const variables = {
      IsCompApproved: isApproved,
      accountNo: isApproved ? 'Pending' : 'Compliance Rejected'
    };
    const submit = await submitTask(state.currentTask, '', formatVariables(variables), false);
    console.log(submit);
    if (submit === 'Successful') {
      notification({
        title: `Successful ${isApproved ? 'Approval' : 'Rejection'}`,
        message: `You have successfully ${isApproved ? 'Approved' : 'Rejected'} this compliance check.`,
        type: 'success'
      });
      props.history.push('/onboarding/compliance-list');
    } else {
      notification({
        title: 'Error',
        message: 'Something went wrong when submitting form.',
        type: 'danger'
      });
    }
  }

  handleGoBack = () => {
    const { history, compType } = this.props;
    if (compType === 'completionDetails') history.push('/onboarding/completed-list');
    if (compType === 'complianceDetails') history.push('/onboarding/compliance-list');
    if (compType === 'reportDetails') history.push('/onboarding/reports');
  }

  handleTabIdUpdate = (id) => {
    this.setState({
      currentTabId: id
    });
  }

  gotoDocumentPage = (accountNo, customerName) => {
    const { compType } = this.props;

    if (!accountNo.match(/^[0-9]{10}$/)) {
      notification({
        title: 'PENDING ACCOUNT NUMBER GENERATION',
        message: 'Awaiting account number generation. Please, try again when it is generated.',
        type: 'warning'
      });
      return;
    }
    if (compType === 'completionDetails') {
      this.props.history.push(`/onboarding/account-documents-page/${accountNo}?cn=${customerName}`);
    } else if (compType === 'reportDetails') {
      this.props.history.push(`/onboarding/account-documents-review/${accountNo}?cn=${customerName}`);
    }
  }

  render() {
    const { state, props: { compType } } = this;
    const username = (state.username && state.username.replace('.', ' ')) || '';

    let currentTab;
    switch (state.currentTabId) {
    case 0:
      currentTab = (
        <CustomerDetailsTab
          isStaffAccount={state.isStaffAccount}
          newStaffEmployeeId={state.newStaffEmployeeId}
          accountNo={state.accountNo}
          accountType={state.accountType}
          currency={state.currency}
          tierType={state.tierType}
          showAcctNo
          bvn={state.bvn}
          gaurdianBvn={state.gaurdianBvn}
          title={state.title}
          firstname={state.firstname}
          middlename={state.middlename}
          lastname={state.lastname}
          gender={state.gender}
          religion={state.religion}
          dob={state.dob && formatDate(state.dob)}
          pob={state.pob}
          countryOfBirth={state.countryOfBirth}
          marstatus={state.marstatus}
          nationality={state.nationality}
          stateoforigin={state.stateoforigin}
          lgaoforigin={state.lgaoforigin}
          respermit={state.respermit}
          respermisdate={state.respermisdate && formatDate(state.respermisdate)}
          respermexdate={state.respermexdate && formatDate(state.respermexdate)}
          streetno={state.streetno}
          street={state.street}
          landmark={state.landmark}
          city={state.city}
          lga={state.lga}
          state={state.state}
          stateOfProvince={state.stateOfProvince}
          country={state.country}
          isMultipleCitizenship={state.isMultipleCitizenship}
          secondCountry={state.secondCountry}
          secondAddress={state.secondAddress}
          secondTin={state.secondTin}
          phonenumber1={state.phonenumber1}
          phonenumber2={state.phonenumber2}
          email={state.email}
          staffid={state.staffid}
          relationshipmanagerid={state.relationshipmanagerid}
          branchCode={state.branchCode}
          preferredBranchCode={state.preferredBranchCode}
        />
      );
      break;
    case 1:
      currentTab = (
        <IdAndDocsTab
          idtype={state.idtype}
          otherIdType={state.otherIdType}
          idno={state.idno}
          tin={state.tin}
          issdate={state.issdate && formatDate(state.issdate)}
          expdate={state.expdate && formatDate(state.expdate)}
          dImage_zimg_id_x={state.dImage_zimg_id_x}
          dImage_zimg_sign_x={state.dImage_zimg_sign_x}
          dImage_zimg_selfie_x={state.dImage_zimg_selfie_x}
          dImage_zimg_utility_x={state.dImage_zimg_utility_x}
        />
      );
      break;
    case 2:
      currentTab = (
        <OrtherDetailsTab
          occupation={state.occupation}
          empstatus={state.empstatus}
          empname={state.empname}
          otherStatus={state.otherStatus}
          specifyStatus={state.specifyStatus}
          empaddress={state.empaddress}
          netincome={state.netincome}
          bizname={state.bizname}
          biznature={state.biznature}
          bizaddress={state.bizaddress}
          isbizreg={state.isbizreg}
          bizturnova={state.bizturnova}
          noklastname={state.noklastname}
          nokmidname={state.nokmidname}
          nokfirstname={state.nokfirstname}
          nokrelation={state.nokrelation}
          nokemail={state.nokemail}
          noknumber={state.noknumber}
          nokstreetno={state.nokstreetno}
          nokstreetname={state.nokstreetname}
          noklandmark={state.noklandmark}
          nokcity={state.nokcity}
          noklga={state.noklga}
          nokstate={state.nokstate}
          nokstateOfProvince={state.nokstateOfProvince}
          nokcountry={state.nokcountry}
        />
      );
      break;
    case 3:
      currentTab = (
        <AccountServicesTab
          requestcheq={state.requestcheq}
          requestcard={state.requestcard}
          requestussd={state.requestussd}
          requestalert={state.requestalert}
          refereeMode={state.refereeMode}
          refereename1={state.refereename1}
          refereeemail1={state.refereeemail1}
          refereephoneno1={state.refereephoneno1}
          refereename2={state.refereename2}
          refereeemail2={state.refereeemail2}
          refereephoneno2={state.refereephoneno2}
          accountType={state.accountType}
        />
      );
      break;
    default:
      currentTab = null;
    }
    const sectionText = ['Customer Details', 'ID and Docs', 'Other Details', 'Account Services'];
    const sectionTabs = [];
    const customerName = `${state.firstname || ''} ${state.middlename || ''} ${state.lastname || ''}`;
    for (let i = 0; i < 4; i++) {
      const currentTabClass = 'current-nav-tab';
      sectionTabs.push(
        <ReviewTabNavBtn
          text={sectionText[i]}
          className={state.currentTabId === i ? currentTabClass : ''}
          handleClick={() => this.handleTabIdUpdate(i)}
          key={i} />
      );
    }
    return (
      <div>
        {state.isLoading && <IsLoading />}
        <div className="section-title">
          <h2>
            {compType === 'reportDetails' && 'Customer Onboarding Details'}
            {compType === 'completionDetails' && 'Completion Page'}
            {compType === 'complianceDetails' && 'Compliance Check'}
          </h2>
        </div>
        <div className="account-creator-info">
          <p>{`Account Created By: ${username}, Branch Code: ${state.branchCode || ''}`}</p>
          <CheckboxSlide
            label="Reportable Customer:"
            value={state.isReportable} name="isReportable"
            checked={state.isReportable === 'yes'}
            onChange={this.handleReportableToggle} />
        </div>
        <div>
          <ul className="tabs-nav">{sectionTabs}</ul>
          {currentTab}
          {compType === 'complianceDetails' ?
            (
              <div className="flex-spaced">
                <button type="button" onClick={this.handleGoBack} className="col-4 btn">Back</button>
                <button
                  type="button" onClick={() => this.handleSubmitCompliance(true)} className="col-4 btn">
                  Accept
                </button>
                <button
                  type="button" onClick={() => this.handleSubmitCompliance(false)} className="col-4 btn">
                  Reject
                </button>
              </div>
            ) :
            (
              <div className="flex-spaced">
                <button type="button" onClick={this.handleGoBack} className="col-4 btn">
                  Back
                </button>
                <button
                  type="button" className="col-4 btn"
                  onClick={() => this.gotoDocumentPage(state.accountNo, customerName)}>
                  Documents
                </button>
              </div>
            )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ ...state });

export default connect(mapStateToProps)(CompletionPage);
