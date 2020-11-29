import React from 'react';
import { Switch, Route } from 'react-router';

import ProtectedRoute from './ProtectedRoute';
import SessionHOC from '../components/SessionHOC';

import AccountTypeForm from '../containers/AccountTypeForm';
import CustomerDetailsForm from '../containers/CustomerDetailsForm';
import IdAndDocsForm from '../containers/IdAndDocsForm';
import OrtherDetailsForm from '../containers/OrtherDetailsForm';
import AccountServicesForm from '../containers/AccountServicesForm';
import ReviewPage from '../containers/ReviewPage';
import CompletionPage from '../containers/CompletionPage';
import OnboardingProcesses from '../containers/OnboardingProcesses';
import AccountDocumentsPage from '../containers/AccountDocumentsPage';
import AccountDocumentsReview from '../containers/AccountDocumentsReview';
import Dashboard from '../containers/Dashboard';

export default () => (
  <Switch>
    <ProtectedRoute
      path="/onboarding/"
      exact component={SessionHOC(Dashboard)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/pending-list" component={SessionHOC(OnboardingProcesses)}
      listType="ongoing" title="Pending List" accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/completed-list" component={SessionHOC(OnboardingProcesses)}
      listType="completed" title="Completed List" accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/branch-completed-list" component={SessionHOC(OnboardingProcesses)}
      listType="completedBranch" title="Branch Completed List" accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/compliance-list" component={SessionHOC(OnboardingProcesses)}
      listType="compliance" title="Compliance List" accessLevel="Compliance" />
    <ProtectedRoute
      path="/onboarding/reports" component={SessionHOC(OnboardingProcesses)}
      listType="reports" title="Account Reports" accessLevel="Report" />
    <ProtectedRoute
      path="/onboarding/account-type"
      component={SessionHOC(AccountTypeForm)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/customer-details"
      component={SessionHOC(CustomerDetailsForm)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/id-docs"
      component={SessionHOC(IdAndDocsForm)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/other-details"
      component={SessionHOC(OrtherDetailsForm)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/account-services"
      component={SessionHOC(AccountServicesForm)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/review-details"
      component={SessionHOC(ReviewPage)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/completed-onboarding" compType="completionDetails"
      component={SessionHOC(CompletionPage)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/compliance-check" compType="complianceDetails"
      component={SessionHOC(CompletionPage)} accessLevel="Compliance" />
    <ProtectedRoute
      path="/onboarding/account-documents-page/:accountNo"
      component={SessionHOC(AccountDocumentsPage)} accessLevel="FieldUser" />
    <ProtectedRoute
      path="/onboarding/customer-details-review" compType="reportDetails"
      component={SessionHOC(CompletionPage)} accessLevel="Report" />
    <ProtectedRoute
      path="/onboarding/account-documents-review/:accountNo"
      component={SessionHOC(AccountDocumentsReview)} accessLevel="Report" />
    <Route render={() => <h1>Error 404. Page not found.</h1>} />
  </Switch>
);
