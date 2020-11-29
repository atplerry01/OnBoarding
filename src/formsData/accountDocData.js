import accountForm from '../assets/images/account-form.jpg';
import refereeForm from '../assets/images/referee-form.jpg';
import mandateForm from '../assets/images/mandate-form.jpg';
import idCard from '../assets/images/id-card.jpg';
import addressVerify from '../assets/images/address-verification.jpg';

export default [
  {
    documentName: "Account Opening Form",
    documentUrl: 'accountOpeningForm',
    documentBg: accountForm
  },
  {
    documentName: "Mandate Form",
    documentUrl: 'mandateForm',
    documentBg: mandateForm
  },
  {
    documentName: "ID Card",
    documentUrl: 'idCard',
    documentBg: idCard,
    checkSuitability: true
  },
  {
    documentName: "ID Card Verification",
    documentUrl: 'verifyIdCard',
    documentBg: idCard
  },
  {
    documentName: "Reference Form 1",
    documentUrl: 'reference1',
    documentBg: refereeForm,
    checkSuitability: true
  },
  {
    documentName: "Reference 1 Verification",
    documentUrl: 'verifyReference1',
    documentBg: refereeForm
  },
  {
    documentName: "Reference Form 2",
    documentUrl: 'reference2',
    documentBg: refereeForm,
    checkSuitability: true
  },
  {
    documentName: "Reference 2 Verification",
    documentUrl: 'verifyReference2',
    documentBg: refereeForm
  },
  {
    documentName: "Address Verification",
    documentUrl: 'verifyAddress',
    documentBg: addressVerify
  }
];
