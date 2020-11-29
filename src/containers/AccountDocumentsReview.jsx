import React, { Component } from 'react';
import queryString from 'query-string';

import IsLoading from '../components/layouts/IsLoading';
import accountDocData from '../formsData/accountDocData';
import {
  getCustomerAcctDocuments,
  getRcoComment, postRcoComment
} from '../apiCalls/accountRecordsAPI';
import notification from '../utilities/notification';
import SelectInput from '../components/inputFeilds/SelectInput';
import { getTaskByAccountNo } from '../apiCalls/camundaApi';

class AccountDocumentsPage extends Component {
  constructor(props) {
    super(props);
    const { location } = props;
    const query = queryString.parse(location.search);

    this.state = {
      docUrlList: {},
      comment: '',
      revStatus: '',
      rcoComment: '',
      reviewStatus: '',
      customerName: query.cn.replace(/\s+/g, ' '),
      isLoading: true,
      loadingMsg: 'Loading...'
    };
  }

  async componentDidMount() {
    window.scrollTo(0, 0);
    const { params: { accountNo } } = this.props.match;

    if (!accountNo.match(/^[0-9]{10}$/)) {
      this.setState({
        loadingMsg: 'Account Number is not yet generated for this customer. Please check back later.',
        isLoading: false
      });
      return;
    }
    const documentRes = await getCustomerAcctDocuments(accountNo);
    const rcoComment = await getRcoComment(accountNo);

    // console.log('Document Response:', documentRes);
    // console.log('RCO Comments Response:', rcoComment);

    if (String(documentRes).includes('Error')) {
      notification({
        title: 'Failed to Fetch Document',
        message: 'An error has occured while getting customer\'s documents. Please refresh the page.',
        type: 'danger'
      });
      return;
    }
    this.setState({
      docUrlList: documentRes,
      rcoComment: rcoComment.Comment,
      reviewStatus: rcoComment.ReviewStatus,
      isLoading: false,
      loadingMsg: ''
    });
  }

  gotoDetailsPage = async (accountNo) => {
    try {
      const task = await getTaskByAccountNo(accountNo);
      // console.log(task);

      localStorage.setItem('currentProcessInstance', task.processInstanceId);
      this.props.history.push('/onboarding/customer-details-review');
    } catch (e) {
      // console.log(e);
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  submitRcoComment = async () => {
    const { comment, revStatus, customerName } = this.state;
    const { params: { accountNo } } = this.props.match;

    const response = await postRcoComment(accountNo, comment, revStatus);
    if (response.ResponseCode === '00') {
      notification({
        title: 'RCO Comment',
        message: `You have successfully commented on ${customerName} documents report.`,
        type: 'success'
      });
      this.setState({ rcoComment: response.Comment, reviewStatus: response.ReviewStatus });
    } else {
      notification({
        title: 'RCO Comment Failure',
        message: `Something went wrong when commenting on ${customerName} documents report.`,
        type: 'danger'
      });
    }
  }

  handleGoBack = () => {
    const { history } = this.props;
    history.push('/onboarding/reports');
  }

  render() {
    const {
      docUrlList, rcoComment, reviewStatus, loadingMsg,
      revStatus, comment, isLoading, customerName, uploadingDoc
    } = this.state;
    const { params: { accountNo } } = this.props.match;

    return (
      <div>
        {(isLoading || uploadingDoc) && <IsLoading />}
        <div className="flex-spaced">
          <h2>
            {customerName}
            &apos;s Account Documents
          </h2>
          <span>
            <button type="button" onClick={() => this.gotoDetailsPage(accountNo)} className="btn-sm btn">
              Account Details
            </button>
            <button type="button" onClick={this.handleGoBack} className="btn-sm btn m-l-5">
              Back
            </button>
          </span>
        </div>
        {loadingMsg ?
          (
            <p style={{ marginTop: '30px' }}>{loadingMsg}</p>
          ) :
          (
            <ul className="account-doc-list">
              {accountDocData.map((doc) => docUrlList[doc.documentUrl] !== 'NA' && (
                docUrlList[doc.documentUrl] !== '' ? (
                  <div className="item" key={doc.documentName}>
                    <a
                      href={docUrlList[doc.documentUrl]} className="doc-card"
                      target="_blank" rel="noopener noreferrer">
                      <div className="file-bg" style={{ backgroundImage: `url(${doc.documentBg})` }} />
                      <li>
                        <h3>{doc.documentName}</h3>
                        <span className="availability-flag" style={{ backgroundColor: '#28a745' }}>Available</span>
                        {doc.checkSuitability && docUrlList[doc.documentUrl] &&
                        (docUrlList[doc.documentUrl].includes('_NS') || docUrlList[doc.documentUrl].includes('_S')) &&
                        (
                          <span
                            className="suitability-flag"
                            style={{
                              backgroundColor: docUrlList[doc.documentUrl].includes('_S') ? '#28a745' : '#c83232'
                            }}>
                            {docUrlList[doc.documentUrl].includes('_S') ? 'Suitable' : 'Not Suitable'}
                          </span>
                        )}
                      </li>
                    </a>
                  </div>
                ) :
                  (
                    <div className="item" key={doc.documentName}>
                      <label htmlFor="none" className="doc-card">
                        <div className="file-bg" style={{ backgroundImage: `url(${doc.documentBg})` }} />
                        <li>
                          <h3>{doc.documentName}</h3>
                          <span className="availability-flag" style={{ backgroundColor: '#c83232' }}>
                            Not Available
                          </span>
                        </li>
                      </label>
                    </div>
                  )
              ))}
            </ul>
          )}
        <div className="comment-form">
          <form>
            <h3>BCO&apos;s Review Comment</h3>
            {rcoComment && rcoComment.length > 0 &&
            (
              <div className="previous-comment">
                {reviewStatus !== 'Completed' &&
                (
                  <>
                    <h4>Previous Comment</h4>
                    <hr />
                  </>
                )}
                <p className="">{rcoComment}</p>
              </div>
            )}
            {reviewStatus !== 'Completed' &&
            (
              <>
                <div>
                  <label htmlFor="rco-comment">Review Comment:</label>
                  <br />
                  <textarea
                    rows={5} id="rcoComment" className="w-100 p-10" name="comment"
                    onChange={this.handleChange} value={comment} />
                  <SelectInput
                    options={['Select item...', 'Completed', 'Incompleted']} name="revStatus"
                    label="Review Status" className="w-100" value={revStatus} onChange={this.handleChange} />
                </div>
                <button
                  type="button" className="btn" onClick={this.submitRcoComment}
                  disabled={comment.length < 3 || !revStatus}>
                  Submit
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default AccountDocumentsPage;
