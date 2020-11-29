import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiUserCheck, FiUserPlus, FiArrowRightCircle } from 'react-icons/fi';
import { TiInputChecked } from 'react-icons/ti';
import { FaClipboardList } from 'react-icons/fa';

import { resetInstanceData } from '../actions/customerDataActions';
import { getTaskListByUser, getTaskListByBranch } from '../apiCalls/camundaApi';
import { decodeToken } from '../utilities/authUtilities';

class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      username: decodeToken('un').username,
      branchCode: decodeToken('bc').branchCode,
      jobFunction: decodeToken('jf').jobFunction,
      accessLevels: decodeToken('al').accessLevels,
      counts: {
        pending: 0,
        completed: 0,
        completedBranch: 0,
        compliance: 0,
        reports: 0
      }
      // loading: true
    };
  }

  async componentDidMount() {
    window.scrollTo(0, 0);
    this.props.resetInstanceData();
    const { state: { username, jobFunction, branchCode } } = this;

    const pending = await getTaskListByUser(username, null, true, true);
    const completed = await getTaskListByUser(username, 'Task_0wpubgg', false, true);
    const completedBranch = jobFunction === 'Branch Service Manager' &&
      await getTaskListByBranch(branchCode, 'Task_0wpubgg', true);
    const compliance = await getTaskListByBranch('all', 'UserTask_compliance', true);
    const reports = await getTaskListByBranch('all', 'Task_0wpubgg', true);

    this.setState({
      counts: {
        pending: pending.count,
        completed: completed.count,
        completedBranch: completedBranch.count,
        compliance: compliance.count,
        reports: reports.count
      }
    });
  }

  render() {
    const {
      counts: {
        pending, completed, completedBranch, compliance, reports
      }, accessLevels, jobFunction
    } = this.state;

    const complianceAccess = accessLevels && accessLevels.filter((el) => el.moduleAccess === 'Compliance');
    const reportAccess = accessLevels && accessLevels.filter((el) => el.moduleAccess === 'Report');

    return (
      <div className="dashboard">
        <div className="row">
          <div className="col-12">
            <h2>Onboarding Dashboard</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-3">
            <div className="card warning-color-bg">
              <div className="card-inner">
                <h2>{pending}</h2>
                <p>Ongoing Registration</p>
              </div>
              <div className="card-image">
                <FiUserPlus />
              </div>
              <div className="card-footer">
                <Link to="/onboarding/pending-list">
                  View List
                  <FiArrowRightCircle />
                </Link>
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="card success-color-bg">
              <div className="card-inner">
                <h2>{completed}</h2>
                <p>Completed Registration</p>
              </div>
              <div className="card-image">
                <FiUserCheck />
              </div>
              <div className="card-footer">
                <Link to="/onboarding/completed-list">
                  View List
                  <FiArrowRightCircle />
                </Link>
              </div>
            </div>
          </div>
          {jobFunction === 'Branch Service Manager' &&
            (
              <div className="col-3">
                <div className="card success-color-bg">
                  <div className="card-inner">
                    <h2>{completedBranch}</h2>
                    <p>Completed Registration By Branch</p>
                  </div>
                  <div className="card-image">
                    <FiUserCheck />
                  </div>
                  <div className="card-footer">
                    <Link to="/onboarding/branch-completed-list">
                  View List
                      <FiArrowRightCircle />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          {complianceAccess.length > 0 &&
          (
            <div className="col-3">
              <div className="card danger-color-bg">
                <div className="card-inner">
                  <h2>{compliance}</h2>
                  <p>Compliance Check</p>
                </div>
                <div className="card-image">
                  <TiInputChecked />
                </div>
                <div className="card-footer">
                  <Link to="/onboarding/compliance-list">
                    View List
                    <FiArrowRightCircle />
                  </Link>
                </div>
              </div>
            </div>
          )}
          {reportAccess.length > 0 &&
          (
            <div className="col-3">
              <div className="card blue-color-bg">
                <div className="card-inner">
                  <h2>{reports}</h2>
                  <p>Reports</p>
                </div>
                <div className="card-image">
                  <FaClipboardList />
                </div>
                <div className="card-footer">
                  <Link to="/onboarding/reports">
                    View List
                    <FiArrowRightCircle />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({ ...state });

const mapDispatchToProps = {
  resetInstanceData
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
