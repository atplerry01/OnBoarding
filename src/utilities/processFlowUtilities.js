import notification from './notification';

import availableTasks from '../formsData/availableTasks';
import {
  startProcess, getTaskList, assignTask,
  submitTask, updateProcessVariables
} from '../apiCalls/camundaApi';
import { formatVariables } from './camundaVariables';

export const startNewProcess = async (processDefinitionKey) => {
  const newProcess = await startProcess(processDefinitionKey);

  return newProcess || 'An error occurred when starting a new process.';
};

export const getNextTaskForm = (taskDefinitionKey) => availableTasks
  .filter((task) => task.taskDefinitionKey === taskDefinitionKey)[0];

export const gotoNextTask = async (processInstanceId, username, history, showNotification = false) => {
  try {
    const nextTask = await getTaskList(processInstanceId);
    if (nextTask && nextTask.length > 0) {
      nextTask.map(async (task) => {
        if (!task.assignee) {
          await assignTask(task.id, username);
        }
        if (showNotification) {
          notification({
            title: 'Form Submission',
            message: 'You have successfully submitted this task form.',
            type: 'success'
          });
        }
        const nextTaskForm = getNextTaskForm(nextTask[0].taskDefinitionKey);
        await history.push(nextTaskForm.formUrl);
      });
    } else {
      console.log('Unable to get the Next task. Please, try again.');
      return 'Failed';
    }
    // setTimeout(async () => {
    // }, delay);
  } catch (err) {
    notification({
      title: 'Error',
      message: err,
      type: 'danger'
    });
  }
};

export const submitTaskForm = async (compThis, currentTask, variables, nextFormUrl) => {
  const { state, props } = compThis;

  if (state.goBackCount < 0) {
    props.addCustomerData(variables);
    props.updateGoBackCount(state.goBackCount + 1);
    props.history.push(nextFormUrl);
    return;
  }
  const submit = await submitTask(currentTask, '', formatVariables(variables));
  console.log(submit);
  if (submit === 'Successful') {
    props.addCustomerData(variables);
    await gotoNextTask(state.processInstanceId, props.customerData.username, props.history);
  } else {
    notification({
      title: 'Error',
      message: 'Something went wrong when submitting form.',
      type: 'danger'
    });
  }
};

export const saveFormVariables = async (compThis, variables) => {
  const { state, props } = compThis;
  const ErrorResponse = Object
    .keys(state.errors || {})
    .some((e) => state.errors[e] &&
    state.errors[e] !== 'This field is required' &&
    state.errors[e] !== 'No file is selected' &&
    state.errors[e] !== 'Required');

  if (ErrorResponse) {
    notification({
      title: 'Error',
      message: 'Some fields contain invalid values.',
      type: 'danger'
    });
    return;
  }

  const update = await updateProcessVariables(state.processInstanceId,
    formatVariables(variables, 'update'));
  if (update === 'Successful.') {
    // eslint-disable-next-line no-unused-expressions
    props.addCustomerData && props.addCustomerData(variables);
    notification({
      title: 'Onboarding Process',
      message: 'You have successfully saved current customer\'s information.',
      type: 'success'
    });
    return true;
  } else {
    notification({
      title: 'Error',
      message: 'Unable to save customer\'s information. Confirm you are connected.',
      type: 'danger'
    });
  }
};
