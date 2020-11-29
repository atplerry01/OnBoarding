import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { MdDashboard, MdViewList } from 'react-icons/md';
import { TiInputChecked } from 'react-icons/ti';
import { FaClipboardList } from 'react-icons/fa';

import { addCustomerData, resetInstanceData } from '../../actions/customerDataActions';
import {
  startProcess, getNextTask, assignTask, getTaskListByUser, getTaskListByBranch
} from '../../apiCalls/camundaApi';
import { getNextTaskForm } from '../../utilities/processFlowUtilities';
import { decodeToken } from '../../utilities/authUtilities';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processDefinitionKey: 'Process_Onboarding_New',
      username: decodeToken('un').username,
      jobFunction: decodeToken('jf').jobFunction,
      branchCode: decodeToken('bc').branchCode,
      accessLevels: decodeToken('al').accessLevels,
      currentPath: this.props.pathname,
      counts: {
        pending: 0,
        completed: 0,
        completedBranch: 0,
        compliance: 0,
        reports: 0
      }
    };
  }

  async componentDidMount() {
    await this.updateCounts();
  }

  updateCounts = async () => {
    const { state: { username, jobFunction, branchCode }, props: { pathname } } = this;

    const pending = await getTaskListByUser(username, null, true, true);
    const completed = await getTaskListByUser(username, 'Task_0wpubgg', false, true);
    const completedBranch = jobFunction === 'Branch Service Manager' &&
      await getTaskListByBranch(branchCode, 'Task_0wpubgg', true);
    const compliance = await getTaskListByBranch('all', 'UserTask_compliance', true);
    const reports = await getTaskListByBranch('all', 'Task_0wpubgg', true);

    this.setState({
      currentPath: pathname,
      counts: {
        pending: pending.count,
        completed: completed.count,
        completedBranch: completedBranch.count,
        compliance: compliance.count,
        reports: reports.count
      }
    });
  }

  handleNewAccBtn = async () => {
    this.props.resetInstanceData();
    const { processDefinitionKey, username } = this.state;
    const newProcess = await startProcess(processDefinitionKey);
    if (newProcess) {
      const task = await getNextTask(newProcess.id);
      if (task) {
        const nextTaskForm = getNextTaskForm(task.taskDefinitionKey);
        const assign = await assignTask(task.id, username);
        console.log(assign);
        this.props.addCustomerData({
          processInstanceId: task.processInstanceId,
          username
        });
        localStorage.setItem('currentProcessInstance', task.processInstanceId);
        this.props.history.push(nextTaskForm.formUrl);
      } else {
        console.log(task);
        // display Error message
      }
    } else {
      console.log(newProcess);
      // display Error message
    }
  }

  render() {
    const {
      currentPath, accessLevels, counts: {
        pending, completed, completedBranch, compliance, reports
      }, jobFunction
    } = this.state;
    const { pathname } = this.props;
    if (currentPath !== pathname) this.updateCounts();

    const complianceAccess = accessLevels && accessLevels.filter((el) => el.moduleAccess === 'Compliance');
    const reportAccess = accessLevels && accessLevels.filter((el) => el.moduleAccess === 'Report');
    return (
      <aside className="side-bar">
        <button
          className="btn create-acct-btn" type="button" onClick={this.handleNewAccBtn}
          disabled={pathname === '/onboarding/account-type'}>
          <span>+</span>
          Create New Account
        </button>
        <ul className="sidebar-link">
          <li className={pathname === '/onboarding' ? 'active' : null}>
            <Link to="/onboarding">
              <MdDashboard className="sidebar-icon" />
              Dashboard
            </Link>
          </li>
          <li className={pathname === '/onboarding/pending-list' ? 'active' : null}>
            <Link to="/onboarding/pending-list">
              <MdViewList className="sidebar-icon warning-color" />
              Pending List
              <span className="sidebar-count">{pending}</span>
            </Link>
          </li>
          <li className={pathname === '/onboarding/completed-list' ? 'active' : null}>
            <Link to="/onboarding/completed-list">
              <MdViewList className="sidebar-icon success-color" />
              Completed List
              <span className="sidebar-count">{completed}</span>
            </Link>
          </li>
          {jobFunction === 'Branch Service Manager' && (
            <li className={pathname === '/onboarding/branch-completed-list' ? 'active' : null}>
              <Link to="/onboarding/branch-completed-list">
                <MdViewList className="sidebar-icon success-color" />
                Branch Completed
                <br />
                List
                <span className="sidebar-count">{completedBranch}</span>
              </Link>
            </li>
          )}
          {complianceAccess.length > 0 &&
          (
            <li className={pathname === '/onboarding/compliance-list' ? 'active' : null}>
              <Link to="/onboarding/compliance-list">
                <TiInputChecked className="sidebar-icon danger-color" />
                Compliance List
                <span className="sidebar-count">{compliance}</span>
              </Link>
            </li>
          )}
          {reportAccess.length > 0 &&
          (
            <li className={pathname === '/onboarding/reports' ? 'active' : null}>
              <Link to="/onboarding/reports">
                <FaClipboardList className="sidebar-icon blue-color" />
                Reports
                <span className="sidebar-count">{reports}</span>
              </Link>
            </li>
          )}
        </ul>
      </aside>
    );
  }
}

const mapStateToProps = (state) => ({ ...state });

const mapDispatchToProps = {
  addCustomerData,
  resetInstanceData
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
