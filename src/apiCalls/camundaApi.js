/* eslint-disable max-params */
/* eslint-disable max-len */
import Axios from "axios";

import notification from "../utilities/notification";
import { decodeToken } from "../utilities/authUtilities";

const baseURL = process.env.REACT_APP_CAMUNDA_BASE_URL;

export const startProcess = async (processDefinitionKey) => {
  const { username } = decodeToken('un');
  const { branchCode } = decodeToken('bc');

  if (!username) {
    return { error: 'Username not defined.' };
  }
  const url = `${baseURL}/process-definition/key/${processDefinitionKey}/start`;
  const body = {
    variables: {
      IsStaff: {
        value: true
      },
      isCompliance: {
        value: false
      },
      username: {
        value: username
      },
      branchCode: {
        value: branchCode
      },
      preferredBranchCode: {
        value: branchCode
      }
    }
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  };

  return fetch(url, options)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return { error: 'Something went wrong!' };
    })
    .then((data) => data)
    .catch((error) => {
      console.log(error);
    });
};

export const getProcessHistory = async (processInstanceId) => {
  const url = `${baseURL}/history/process-instance/${processInstanceId}`;
  return Axios(url)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return { error: 'Something went wrong!' };
    }, (error) => error);
};

export const deleteProcessInstance = async (processInstanceId) => {
  const options = {
    url: `${baseURL}/process-instance/${processInstanceId}`,
    method: 'DELETE'
  };
  return Axios(options)
    .then((res) => {
      if (res.status === 204) {
        return 'Successful.';
      }
      return res;
    }, (error) => error);
};

export const getTaskListByUser = async (assignee, tdk = null, ongoing = false, count = false) => {
  const tdki = 'UserTask_bvndetails,UserTask_idtype,UserTask_personal,UserTask_services,UserTask_review';
  const url = `${baseURL}/task${count ? '/count' : ''}?sortBy=created&sortOrder=desc&assignee=${assignee}${tdk ? `&taskDefinitionKey=${tdk}` : ''}${ongoing ? `&taskDefinitionKeyIn=${tdki}` : ''}`;
  console.log(url);
  return Axios(url)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return { Error: 'Something went wrong!' };
    }, (error) => error);
};

export const getTaskListByBranch = async (branchCode, tdk = null, count = false, firstR = null, maxR = null) => {
  const options = {
    // url: `${baseURL}/task${count ? '/count' : ''}${firstR || maxR ? `?firstResult=${firstR}&maxResults=${maxR}` : ''}`,
    url: `${baseURL}/task${count ? '/count' : ''}`,
    method: 'POST',
    data: {
      processVariables: branchCode === 'all' ? null :
        [{
          name: "preferredBranchCode",
          value: branchCode,
          operator: "eq"
        }],
      sorting:
        [{
          sortBy: "processVariable",
          sortOrder: "desc",
          parameters: {
            variable: "startDate",
            type: "Date"
          }
        },
        {
          sortBy: "created",
          sortOrder: "desc"
        }],
      taskDefinitionKey: tdk
    }
  };
  console.log(options);
  return Axios(options)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return { Error: 'Something went wrong!' };
    }, (error) => error);
};

export const getTaskByAccountNo = async (accountNo) => {
  const options = {
    url: `${baseURL}/task`,
    method: 'POST',
    data: {
      processVariables:
        [{
          name: "accountNo",
          value: accountNo,
          operator: "eq"
        }]
    }
  };
  return Axios(options)
    .then((response) => {
      if (response.status === 200) {
        return response.data[0];
      }
      return { Error: 'Something went wrong!' };
    }, (error) => error);
};

export const getTaskList = async (processInstanceId) => {
  const url = `${baseURL}/task?processInstanceId=${processInstanceId}`;
  return Axios(url)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return { error: 'Something went wrong!' };
    }, (error) => error);
};

export const getNextTask = async (processInstanceId, tdk = null) => {
  const url = `${baseURL}/task?processInstanceId=${processInstanceId}${tdk ? `&taskDefinitionKey=${tdk}` : ''}`;

  return Axios(url)
    .then((response) => {
      if (response.status === 200) {
        return response.data[0];
      }
      return { error: 'Something went wrong!' };
    }, (error) => error);
};

export const getFormVariables = async (taskId) => {
  const url = `${baseURL}/task/${taskId}/variables`;
  return Axios(url)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return { error: 'Something went wrong!' };
    }, (error) => error);
};

export const assignTask = async (taskId, userId) => {
  const options = {
    url: `${baseURL}/task/${taskId}/assignee`,
    headers: { 'Content-type': 'application/json' },
    method: 'POST',
    data: { userId }
  };

  return Axios(options)
    .then((res) => {
      if (res.status !== 204) {
        return res;
      }
      return 'Successful.';
    }, (error) => error);
};

export const submitTask = async (taskId, formName, variables, showNotification = true) => {
  const url = `${baseURL}/task/${taskId}/submit-form`;
  const options = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(variables)
  };

  return fetch(url, options)
    .then((response) => {
      if (response.ok) {
        if (showNotification) {
          notification({
            title: 'Form Submission',
            message: `You have successfully submitted ${formName} form.`,
            type: 'success'
          });
        }
        return 'Successful';
      }
      return response;
    })
    .catch((error) => error);
};

export const updateProcessVariables = async (processInstanceId, variables) => {
  const options = {
    url: `${baseURL}/process-instance/${processInstanceId}/variables`,
    headers: { 'Content-type': 'application/json' },
    method: 'POST',
    data: variables
  };

  return Axios(options)
    .then((res) => {
      if (res.status === 204) {
        return 'Successful.';
      }
      return res;
    }, (error) => error);
};
