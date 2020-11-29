import React from 'react';

import PresentValue from '../PresentValue';

export default (props) => {
  const nokAddress = `${props.nokstreetno} ${props.nokstreetname} ${props.nokcity} (${props.noklandmark}),
    ${props.nokcountry === 'Nigeria' ? `${props.noklga}, ${props.nokstate}` : `${props.nokstateOfProvince}`},
    ${props.nokcountry}`;

  let workDetail;

  switch (props.empstatus) {
  case 'Employed':
    workDetail = (
      <div className="flex">
        <PresentValue className="p-field col-4" name="Employer's Name" value={props.empname} />
        <PresentValue className="p-field col-4" name="Employer's Address" value={props.empaddress} />
        <PresentValue className="p-field col-4" name="Annual Net Income" value={props.netincome} />
      </div>
    );
    break;
  case 'Self Employed':
    workDetail = (
      <>
        <div className="flex">
          <PresentValue className="p-field col-4" name="Business Name" value={props.bizname} />
          <PresentValue className="p-field col-4" name="Busines Nature" value={props.biznature} />
          <PresentValue
            className="p-field col-4" name="Is Business Registered?"
            value={props.isbizreg === 'yes' ? 'Yes' : 'No'} />
        </div>
        <div className="flex">
          <PresentValue className="p-field col-8" name="Busines Address" value={props.bizaddress} />
          <PresentValue className="p-field col-4" name="Annual Business Turnover" value={props.bizturnova} />
        </div>
      </>
    );
    break;
  case 'Unemployed':
  default:
    workDetail = null;
    break;
  }
  return (
    <div className="review-tab">
      <h2>Employment Details</h2>
      <div className="flex">
        <PresentValue className="p-field col-6" name="Employment Status" value={props.empstatus} />
        <PresentValue
          className="p-field col-6" name="Occupation"
          value={props.specifyStatus || props.otherStatus || props.occupation} />
      </div>
      {workDetail}
      <h2>Next of Kin&apos;s Details</h2>
      <div className="flex">
        <PresentValue className="p-field col-4" name="Last name" value={props.noklastname} />
        <PresentValue className="p-field col-4" name="Middle Name" value={props.nokmidname} />
        <PresentValue className="p-field col-4" name="First Name" value={props.nokfirstname} />
      </div>
      <div className="flex">
        <PresentValue className="p-field col-4" name="Relation" value={props.nokrelation} />
        <PresentValue className="p-field col-4" name="Email" value={props.nokemail} />
        <PresentValue className="p-field col-4" name="Phone Number" value={props.noknumber} />
      </div>
      <div />
      <div className="flex">
        <PresentValue className="p-field col-12" name="Address" value={nokAddress} />
      </div>
    </div>
  );
};
