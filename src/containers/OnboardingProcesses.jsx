/* eslint-disable no-alert */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { MdDeleteForever } from 'react-icons/md';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { addCustomerData, resetInstanceData } from '../actions/customerDataActions';
import {
  getTaskListByUser, getFormVariables,
  getProcessHistory, deleteProcessInstance, getTaskListByBranch
} from '../apiCalls/camundaApi';
import { getNextTaskForm } from '../utilities/processFlowUtilities';
import { convertToObj } from '../utilities/camundaVariables';
import { getDate } from '../utilities/dateTimeUtilities';
import SearchInput from '../components/inputFeilds/SearchInput';
import notification from '../utilities/notification';
import { decodeToken } from '../utilities/authUtilities';
import getJson from '../apiCalls/jsonFilesCall';
import IsLoading from '../components/layouts/IsLoading';

class OnboardingProcesses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderedTasks: [],
      backupTasks: [],
      search: '',
      loading: true,
      username: decodeToken('un').username,
      branchCode: decodeToken('bc').branchCode,
      currentBranchCode: '',
      jobFunction: decodeToken('jf').jobFunction,
      branchCodes: [],
      // firstResult: 0,
      // maxResults: 10,
      tasksPerPage: 15,
      pageBound: 3
    };
    this.focusRef = React.createRef();
  }

  async componentDidMount() {
    window.scrollTo(0, 0);
    const branchCodes = await getJson('branchCodes.json');
    this.setState({ branchCodes });
    await this.generateTaskTable();
  }

  async componentDidUpdate(prevProps) {
    if (this.props.listType !== prevProps.listType) await this.generateTaskTable();
  }

  generateTaskTable = async () => {
    this.setState({
      loading: true,
      search: '',
      currentPage: 1,
      upperPageBound: 3,
      lowerPageBound: 0,
      isPrevBtnActive: 'disabled',
      isNextBtnActive: ''
    });
    this.props.resetInstanceData();
    localStorage.setItem('currentProcessInstance', null);
    try {
      const { listType } = this.props;
      const {
        username, currentBranchCode, branchCode, jobFunction //, firstResult, maxResults
      } = this.state;
      console.log(currentBranchCode);
      let taskList = [];

      if (listType === 'ongoing') {
        taskList = await getTaskListByUser(username, null, true, false);
      } else if (listType === 'completed') {
        taskList = await getTaskListByUser(username, 'Task_0wpubgg', false, false);
      } else if (listType === 'completedBranch' && jobFunction === 'Branch Service Manager') {
        taskList = await getTaskListByBranch(branchCode, 'Task_0wpubgg', false);
      } else if (listType === 'compliance') {
        taskList = await getTaskListByBranch(currentBranchCode, 'UserTask_compliance', false);
      } else if (listType === 'reports') {
        taskList = await getTaskListByBranch(currentBranchCode, 'Task_0wpubgg', false);
      }
      const tasks = taskList
        .map(async (task) => {
          const processInfo = await getProcessHistory(task.processInstanceId);
          let taskVariables = await getFormVariables(task.id);
          taskVariables = convertToObj(taskVariables, task.processInstanceId);
          return {
            customerName:
            `${taskVariables.firstname || ''} ${taskVariables.middlename || ''} ${taskVariables.lastname || ''}`,
            customerBvn: taskVariables.bvn,
            accountType: taskVariables.accountType,
            isStaffAccount: taskVariables.isStaffAccount,
            accountNo: taskVariables.accountNo,
            started: taskVariables.startDate || processInfo.startTime,
            created: task.created,
            name: task.name,
            percentDone: taskVariables.percentdone || '0',
            id: task.id,
            tdk: task.taskDefinitionKey,
            pii: task.processInstanceId,
            assignee: task.assignee
          };
        });
      Promise.all(tasks).then((res) => {
        res = res.sort((a, b) => new Date(b.started) - new Date(a.started));
        this.setState({
          renderedTasks: res, backupTasks: res, loading: false
        });
      });
    } catch (err) {
      notification({
        title: 'Error',
        message: 'An Error Has occurred while getting the tasks list. Please, check your internet connection.',
        type: 'danger'
      });
      this.setState({ loading: false });
    }
  }

  handleDeleteProcess = async (pii) => {
    const response = window.confirm(`Click 'OK' to confirm the deletion of this Account Onboarding Process`);
    if (response) {
      const res = await deleteProcessInstance(pii);
      if (res === 'Successful.') {
        const { renderedTasks, backupTasks } = this.state;
        const newList = renderedTasks.filter((t) => t.pii !== pii);
        const newBackup = backupTasks.filter((t) => t.pii !== pii);
        this.setState({ renderedTasks: newList, backupTasks: newBackup });
      }
    }
  };

  handleContinueBtn = (tdk, pii) => {
    const nextTaskForm = getNextTaskForm(tdk);
    this.props.addCustomerData({
      processInstanceId: pii,
      continueProcess: true,
      username: this.state.username
    });
    localStorage.setItem('currentProcessInstance', pii);
    this.props.history.push(nextTaskForm.formUrl);
  }

  handleSearch = (e) => {
    const { value } = e.target;
    const { backupTasks } = this.state;
    const listToFilter = backupTasks.slice();

    const filteredList = listToFilter
      .filter((t) => t.customerName.toLowerCase().includes(value.toLowerCase()) ||
      (t.accountType && t.accountType.toLowerCase().includes(value.toLowerCase())) ||
      (t.accountNo && t.accountNo.toLowerCase().includes(value.toLowerCase())) ||
      (t.customerBvn && t.customerBvn.toLowerCase().includes(value.toLowerCase())) ||
      (t.assignee && t.assignee.toLowerCase().includes(value.toLowerCase())) ||
      (t.name && t.name.toLowerCase().includes(value.toLowerCase())));

    this.setState({
      search: value,
      renderedTasks: filteredList,
      currentPage: 1,
      upperPageBound: 3,
      lowerPageBound: 0,
      isPrevBtnActive: 'disabled',
      isNextBtnActive: ''
    });
  }

  gotoDocumentPage = (accountNo, customerName) => {
    if (!accountNo.match(/^[0-9]{10}$/)) {
      notification({
        title: 'PENDING ACCOUNT NUMBER GENERATION',
        message: 'Awaiting account number generation. Please, try again when it is generated.',
        type: 'warning'
      });
      return;
    }
    this.props.history.push(`/onboarding/account-documents-page/${accountNo}?cn=${customerName}`);
  }

  gotoDocumentReview = (accountNo, customerName) => {
    if (!accountNo.match(/^[0-9]{10}$/)) {
      notification({
        title: 'PENDING ACCOUNT NUMBER GENERATION',
        message: 'Awaiting account number generation. Please, try again when it is generated.',
        type: 'warning'
      });
      return;
    }
    this.props.history.push(`/onboarding/account-documents-review/${accountNo}?cn=${customerName}`);
  }

  gotoDetailsPage = (pii) => {
    const { listType } = this.props;

    localStorage.setItem('currentProcessInstance', pii);
    if (listType === 'reports') {
      this.props.history.push('/onboarding/customer-details-review');
    } else if (listType === 'completed' || listType === 'completedBranch') {
      this.props.history.push('/onboarding/completed-onboarding');
    }
  }

  styleProgressBar = (value) => {
    let color = '#e5e5e5';
    if (value >= 100) color = '#02bf1b';
    else if (value < 100 && value >= 80) color = '#ff0';
    else if (value < 80 && value >= 50) color = '#f90';
    else if (value < 50) color = '#f00';

    return {
      path: {
        stroke: color,
        transform: 'rotate(0turn)'
      },
      text: {
        fill: '#991988',
        fontSize: '1.8rem'
      }
    };
  }

  handleClick = (event) => {
    let listId = Number(event.target.id);
    if (listId === this.state.currentPage) return;

    this.setState({
      currentPage: listId
    });

    this.setPrevAndNextBtnClass(listId);
  }

  setPrevAndNextBtnClass = (listId) => {
    window.scrollTo(0, 0);
    const { renderedTasks, tasksPerPage } = this.state;
    let totalPage = Math.ceil(renderedTasks.length / tasksPerPage);

    console.log(totalPage, listId);
    this.setState({ isNextBtnActive: 'disabled', isPrevBtnActive: 'disabled' });
    if (totalPage === listId && totalPage > 1) {
      this.setState({ isPrevBtnActive: '' });
    } else if (listId === 1 && totalPage > 1) {
      this.setState({ isNextBtnActive: '' });
    } else if (totalPage > 1) {
      this.setState({ isNextBtnActive: '', isPrevBtnActive: '' });
    }
  }

  btnIncrementClick = () => {
    this.setState((state) => ({
      upperPageBound: state.upperPageBound + state.pageBound,
      lowerPageBound: state.lowerPageBound + state.pageBound,
      currentPage: state.upperPageBound + 1
    }));
    this.setPrevAndNextBtnClass(this.state.upperPageBound + 1);
  }

  btnDecrementClick = () => {
    this.setState((state) => ({
      upperPageBound: state.upperPageBound - state.pageBound,
      lowerPageBound: state.lowerPageBound - state.pageBound,
      currentPage: state.upperPageBound - state.pageBound
    }));
    this.setPrevAndNextBtnClass(this.state.upperPageBound - this.state.pageBound);
  }

  btnPrevClick = () => {
    if ((this.state.currentPage - 1) % this.state.pageBound === 0) {
      this.setState((state) => ({
        upperPageBound: state.upperPageBound - state.pageBound,
        lowerPageBound: state.lowerPageBound - state.pageBound
      }));
    }
    this.setState((state) => ({ currentPage: state.currentPage - 1 }));
    this.setPrevAndNextBtnClass(this.state.currentPage - 1);
  }

  btnNextClick = () => {
    if ((this.state.currentPage + 1) > this.state.upperPageBound) {
      this.setState((state) => ({
        upperPageBound: state.upperPageBound + state.pageBound,
        lowerPageBound: state.lowerPageBound + state.pageBound
      }));
    }
    this.setState((state) => ({ currentPage: state.currentPage + 1 }));
    this.setPrevAndNextBtnClass(this.state.currentPage + 1);
  }

  handleChangeTasksPerPage = (e) => {
    const { value, name } = e.target;
    this.setState({
      [name]: value,
      currentPage: 1,
      upperPageBound: 3,
      lowerPageBound: 0,
      isPrevBtnActive: 'disabled',
      isNextBtnActive: ''
    });
    this.focusRef.current.focus();
    window.scrollTo(0, 0);
  }

  handleChangeBranchCode = (e) => {
    const { value, name } = e.target;
    this.setState({ [name]: value, loading: true });
    setTimeout(this.generateTaskTable, 1000);
    this.focusRef.current.focus();
  }

  render() {
    const { title, listType } = this.props;
    const {
      renderedTasks, loading, search, currentPage, tasksPerPage,
      upperPageBound, lowerPageBound, isPrevBtnActive, isNextBtnActive,
      currentBranchCode, branchCodes
    } = this.state;
    console.log(currentBranchCode);

    // Logic for displaying current Tasks
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = renderedTasks.slice(indexOfFirstTask, indexOfLastTask);

    // Logic for displaying page numbers
    const pageNumbers = [];
    const pageCount = Math.ceil(renderedTasks.length / tasksPerPage);
    for (let i = 1; i <= pageCount; i++) {
      pageNumbers.push(i);
    }
    const renderPageNumbers = pageNumbers.map((number) => {
      if (number === currentPage) {
        return (
          <li key={number} className="active" id={number}>
            <button type="button" id={number} onClick={this.handleClick}>{number}</button>
          </li>
        );
      } else if ((number < upperPageBound + 1) && number > lowerPageBound) {
        return (
          <li key={number} id={number}>
            <button type="button" id={number} onClick={this.handleClick}>{number}</button>
          </li>
        );
      }
      return null;
    });
    const pageIncrementBtn = pageNumbers.length > upperPageBound ?
      (
        <li className="">
          <button type="button" onClick={this.btnIncrementClick}> &hellip; </button>
        </li>
      ) : null;
    const pageDecrementBtn = lowerPageBound >= 1 ?
      (
        <li className="">
          <button type="button" onClick={this.btnDecrementClick}> &hellip; </button>
        </li>
      ) : null;
    const renderPrevBtn = isPrevBtnActive === 'disabled' ?
      (
        <li className={isPrevBtnActive}><span id="btnPrev"> Prev </span></li>
      ) :
      (
        <li className={isPrevBtnActive}>
          <button type="button" id="btnPrev" onClick={this.btnPrevClick}> Prev </button>
        </li>
      );
    const renderNextBtn = isNextBtnActive === 'disabled' || pageCount === 1 ?
      (
        <li className="disabled"><span id="btnNext"> Next </span></li>
      ) :
      (
        <li className={isNextBtnActive}>
          <button type="button" id="btnNext" onClick={this.btnNextClick}> Next </button>
        </li>
      );

    return (
      <div ref={this.focusRef} tabIndex="-1" className="onboarding-list">
        {loading && <IsLoading />}
        <div className="table-title">
          <h3>{title}</h3>
          {(listType === 'reports' || listType === 'compliance') && (
            <div className="page-count">
              <label htmlFor="currentBranchCode">Select Branch:</label>
              <select
                name="currentBranchCode" id="currentBranchCode" className="m-l-5 h30"
                value={currentBranchCode} onChange={this.handleChangeBranchCode}>
                {branchCodes.map((bc) => (<option value={bc.code} key={bc.code}>{bc.name}</option>))}
              </select>
            </div>
          )}
          <SearchInput name="search" value={search} onChange={this.handleSearch} />
        </div>
        {
          loading ?
            'Loading...' :
            (
              <>
                <table className="process-table">
                  <thead>
                    <tr>
                      <th className="right-border">SN</th>
                      <th>Customer Name</th>
                      <th>Customer BVN</th>
                      <th>Account Type</th>
                      <th>Date Started</th>
                      <th>{listType === 'ongoing' ? 'Date Updated' : 'Date Completed'}</th>
                      <th>{listType === 'ongoing' || listType === 'compliance' ? 'Stage' : 'Account No.'}</th>
                      {listType !== 'compliance' && <th>%</th>}
                      {listType === 'completedBranch' && <th>Opened By</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTasks.length > 0 ?
                      currentTasks
                        // .sort((a, b) => new Date(b.started) - new Date(a.started))
                        .map((task, i) => (
                          <tr key={task.id}>
                            <td className="right-border">{(i + 1) + ((currentPage - 1) * tasksPerPage)}</td>
                            <td>{task.customerName.toUpperCase()}</td>
                            <td>
                              {task.customerBvn}
                              <br />
                              {task.isStaffAccount ? '(WEMA Staff)' : ''}
                            </td>
                            <td>{task.accountType}</td>
                            <td>{getDate(task.started)}</td>
                            <td>{getDate(task.created)}</td>
                            <td>{listType === 'ongoing' || listType === 'compliance' ? task.name : task.accountNo}</td>
                            {listType !== 'compliance' && (
                              <td width="56px">
                                <CircularProgressbar
                                  styles={this.styleProgressBar(task.percentDone)}
                                  value={task.percentDone}
                                  text={`${task.percentDone}%`} />
                              </td>
                            )}
                            {listType === 'completedBranch' && (
                              <td>{task.assignee}</td>
                            )}
                            <td>
                              {listType === 'ongoing' &&
                              (
                                <>
                                  <button
                                    type="button" className="btn btn-sm"
                                    onClick={() => this.handleContinueBtn(task.tdk, task.pii)}>
                                    Continue
                                  </button>
                                  <button
                                    type="button" className="btn btn-sm btn-del"
                                    onClick={() => this.handleDeleteProcess(task.pii)}>
                                    <MdDeleteForever className="left" />
                                    Delete
                                  </button>
                                </>
                              )}
                              {(listType === 'completed' || listType === 'completedBranch') &&
                              (
                                <>
                                  <button
                                    type="button" className="btn btn-sm"
                                    onClick={() => this.gotoDetailsPage(task.pii)}>
                                    Details
                                  </button>
                                  <button
                                    type="button" className="btn btn-sm"
                                    onClick={() => this
                                      .gotoDocumentPage(task.accountNo, task.customerName.toUpperCase())}>
                                    Documents
                                  </button>
                                </>
                              )}
                              {listType === 'reports' &&
                              (
                                <>
                                  <button
                                    type="button" className="btn btn-sm"
                                    onClick={() => this.gotoDetailsPage(task.pii)}>
                                    Details
                                  </button>
                                  <button
                                    type="button" className="btn btn-sm"
                                    onClick={() => this
                                      .gotoDocumentReview(task.accountNo, task.customerName.toUpperCase())}>
                                    Documents
                                  </button>
                                </>
                              )}
                              {listType === 'compliance' &&
                              (
                                <>
                                  <button
                                    type="button" className="btn btn-sm"
                                    onClick={() => this.handleContinueBtn(task.tdk, task.pii)}>
                                    Details
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        )) :
                      (
                        <tr>
                          <td
                            colSpan={listType === 'compliance' ? 8 : 9}
                            style={{ textAlign: 'center', padding: '20px' }}>
                            No Record found
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
                {currentTasks.length > 0 &&
                (
                  <div className="flex-spaced">
                    {/* for pagination */}
                    <div className="page-count">
                      <label htmlFor="tasksPerPage">Tasks Per Page</label>
                      <select
                        name="tasksPerPage" id="tasksPerPage" className="m-l-5 h30"
                        value={tasksPerPage} onChange={this.handleChangeTasksPerPage}>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                      <p className="m-l-5 m-r-5">{`Page: ${currentPage}/${pageCount}`}</p>
                      <p className="m-l-5 m-r-5">{`Total: ${renderedTasks.length}`}</p>
                    </div>
                    <ul className="pagination">
                      {renderPrevBtn}
                      {pageDecrementBtn}
                      {renderPageNumbers}
                      {pageIncrementBtn}
                      {renderNextBtn}
                    </ul>
                  </div>
                )}
              </>
            )
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ ...state });

const mapDispatchToProps = {
  addCustomerData,
  resetInstanceData
};

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingProcesses);
