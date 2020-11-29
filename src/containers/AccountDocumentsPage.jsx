/* eslint-disable max-len */
/* eslint-disable no-alert */
/* eslint-disable camelcase */
import React, { Component } from 'react';
import queryString from 'query-string';

import FileInput from '../components/inputFeilds/FileInput';
import IsLoading from '../components/layouts/IsLoading';

import accountDocData from '../formsData/accountDocData';
import { getCustomerAcctDocuments, getRcoComment, uploadDocument } from '../apiCalls/accountRecordsAPI';
import { validateFile } from '../validation/validator';
import { convertImgToBase64, getBase64ImageFromUrl } from '../utilities/ImageUtilities';
import notification from '../utilities/notification';
import { getTaskByAccountNo } from '../apiCalls/camundaApi';
import { decodeToken } from '../utilities/authUtilities';

class AccountDocumentsPage extends Component {
  constructor(props) {
    super(props);
    const { location } = props;
    const query = queryString.parse(location.search);

    this.state = {
      errors: {},
      docUrlList: {},
      currentUpload: {},
      rcoComment: '',
      rcoRevStatus: '',
      customerName: query.cn.replace(/\s+/g, ' '),
      doUpload: false,
      uploadingDoc: false,
      uploadFile: '',
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
      rcoRevStatus: rcoComment.ReviewStatus,
      loadingMsg: '',
      isLoading: false
    });
  }

  handleFileValidation = (fileTypes, fileSize, isRequired, fileString) => (e) => {
    const { name, files } = e.target;
    const errorMsg = validateFile(files[0], fileTypes, fileSize, isRequired, fileString);

    this.setState((state) => ({
      errors: { ...state.errors, [name]: errorMsg }
    }));
  }

  handleChange = (fileTypes, fileSize, isRequired) => async (e) => {
    try {
      const {
        name, value, type, files
      } = e.target;
      const errorMsg = validateFile(files[0], fileTypes, fileSize, isRequired, name);
      this.setState((state) => ({
        [name]: value,
        errors: { ...state.errors, [name]: errorMsg }
      }));
      if (errorMsg) return;
      if (type === 'file') {
        this.setState({
          [`${name}_x`]: await convertImgToBase64(files[0])
        });
      }
    } catch (e) {
      // console.log(e);
    }
  }

  showUploadDialog = (doc) => {
    this.setState({ doUpload: true, currentUpload: doc });
  }

  hideUploadDialog = () => {
    this.setState({
      doUpload: false,
      currentUpload: {},
      uploadFile: '',
      uploadFile_x: ''
    });
  }

  handleUpload = async () => {
    this.setState({ uploadingDoc: true });
    const {
      currentUpload: { documentUrl, documentName },
      uploadFile_x,
      customerName
    } = this.state;
    const { params: { accountNo } } = this.props.match;
    let docString = uploadFile_x.slice(uploadFile_x.indexOf(',') + 1);

    const res = await uploadDocument(accountNo, documentUrl, docString);
    if (res.ResponseCode === '00') {
      notification({
        title: 'Customer Document Upload',
        message: `You have successfully uploaded ${documentName} for ${customerName}.`,
        type: 'success'
      });
      this.setState((state) => ({
        docUrlList: {
          ...state.docUrlList,
          [documentUrl]: res.ResponseMessage
        },
        uploadingDoc: false
      }));
      if (documentUrl.includes('verify') && documentUrl !== 'verifyAddress') {
        // Update the suitability state of the document that is verified to suitable
        let docUrl = documentUrl.replace('verify', '');
        docUrl = docUrl.charAt(0).toLowerCase() + docUrl.slice(1);
        let docName = documentName.replace(' Verification', '');
        await this.handleSuitability(true, docUrl, docName, false);
      }
      this.hideUploadDialog();
    } else {
      notification({
        title: 'Customer Document Upload',
        message: `Something went wrong while uploading ${documentName} for ${customerName}.`,
        type: 'danger'
      });
      this.setState({ uploadingDoc: false });
    }
  }

  handleSuitability = async (isSuitable, documentUrl, documentName, fromBtn = true) => {
    try {
      const { customerName, docUrlList } = this.state;
      const { params: { accountNo } } = this.props.match;

      this.setState({ isLoading: true });
      let docString = await getBase64ImageFromUrl(docUrlList[documentUrl]);
      docString = docString.slice(docString.indexOf(',') + 1);

      if (fromBtn) {
        const response = window
          .confirm(`Click 'OK' to mark ${documentName} for ${customerName} as ${isSuitable ? 'SUITABLE' : 'NOT SUITABLE'}?`);

        if (!response) return;
      }
      const res = await uploadDocument(accountNo, documentUrl, docString, isSuitable ? '_S' : '_NS');
      if (res.ResponseCode === '00') {
        notification({
          title: 'Customer Document Suitability',
          message: `You have successfully marked ${documentName} for ${customerName} as ${isSuitable ? 'SUITABLE' : 'NOT SUITABLE'}.`,
          type: 'success'
        });
        this.setState((state) => ({
          docUrlList: {
            ...state.docUrlList,
            [documentUrl]: res.ResponseMessage
          }
        }));
      } else {
        notification({
          title: 'Customer Document Suitability',
          message: `Something went wrong while updating ${documentName} suitability.`,
          type: 'danger'
        });
      }
      this.setState({ isLoading: false });
    } catch (e) {
      this.setState({ isLoading: false });
      // console.log(e);
    }
  }

  handleGoBack = () => {
    const { history } = this.props;
    history.push('/onboarding/completed-list');
  }

  gotoDetailsPage = async (accountNo) => {
    try {
      this.setState({ isLoading: true });
      const task = await getTaskByAccountNo(accountNo);

      localStorage.setItem('currentProcessInstance', task.processInstanceId);
      this.props.history.push('/onboarding/completed-onboarding');
    } catch (e) {
      this.setState({ uploadingDoc: false });
      // console.log(e);
    }
  }

  render() {
    const {
      docUrlList, currentUpload, doUpload, uploadFile_x, rcoComment, loadingMsg,
      isLoading, customerName, uploadFile, uploadingDoc, errors, rcoRevStatus
    } = this.state;
    const { params: { accountNo } } = this.props.match;
    const jobFunc = decodeToken('jf').jobFunction;

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
                    {doc.checkSuitability && docUrlList[doc.documentUrl] &&
                    !docUrlList[doc.documentUrl].includes('_S') &&
                    (
                      (docUrlList[doc.documentUrl].includes('_NS') ?
                        (
                          <button
                            type="button" className="btn btn-sm btn-outline"
                            onClick={() => this.showUploadDialog(doc)}>
                            Upload Another Document
                          </button>
                        ) :
                        (jobFunc === 'Customer Care Officer' || jobFunc === 'Branch Service Manager') && (
                          <button
                            type="button" className="btn btn-sm btn-outline"
                            onClick={() => this.handleSuitability(false, doc.documentUrl, doc.documentName)}>
                            Mark Not Suitable
                          </button>
                        ))
                    )}
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
                      {(jobFunc === 'Customer Care Officer' || jobFunc === 'Branch Service Manager') && (
                        <button
                          type="button" className="btn btn-sm btn-outline"
                          onClick={() => this.showUploadDialog(doc)}>
                          Upload Document
                        </button>
                      )}
                    </div>
                  )
              ))}
            </ul>
          )}
        {doUpload && (
          <div className="doc-upload-form">
            <form>
              <h3>{`Upload ${currentUpload.documentName}`}</h3>
              <FileInput
                label={currentUpload.documentName} name="uploadFile" value={uploadFile}
                onChange={this.handleChange('jpeg, png, gif', 200, false)}
                className="w-100" error={errors.uploadFile} note="(Max size: 200KB)"
                onBlur={this.handleFileValidation('jpeg, png, gif', 200, false, uploadFile)}
              />
              <div className="w-100 img-preview p-r">
                <img src={uploadFile_x} alt="" />
              </div>
              <div className="row">
                <div className="col-6">
                  <button
                    type="button" className="btn btn-sm w-100" onClick={this.handleUpload}
                    disabled={uploadFile === '' || errors.uploadFile || uploadingDoc}>
                    {uploadingDoc ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button" className="btn btn-sm w-100"
                    onClick={this.hideUploadDialog}>
                    Close
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        {rcoComment && rcoComment.length > 0 && (
          <div className="comment-form">
            <h3>BCO&apos;s Review Comment</h3>
            <p className="rco-comment">{rcoComment}</p>
            <p className="rco-review-status">{`Review Status: ${rcoRevStatus || ''}`}</p>
          </div>
        )}
      </div>
    );
  }
}

export default AccountDocumentsPage;
