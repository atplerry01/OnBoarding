import React, { useEffect, useState } from 'react';
import { getCountryName, getReligionName } from '../../utilities/generalUtilities';

import PresentValue from '../PresentValue';

export default (props) => {
  const address = `${props.streetno} ${props.street} ${props.city} (${props.landmark}),
    ${props.country === 'Nigeria' ? `${props.lga}, ${props.state}` : `${props.stateOfProvince}`},
    ${props.country}`;

  const [religion, setReligion] = useState('');
  const [countryOfBirth, setCountryOfBirth] = useState('');
  const [secondCountry, setSecondCountry] = useState('');

  useEffect(() => {
    const getReligion = async () => {
      const rel = await getReligionName(props.religion);
      const cob = await getCountryName(props.countryOfBirth);
      const secC = await getCountryName(props.secondCountry);

      setReligion(rel);
      setCountryOfBirth(cob);
      setSecondCountry(secC);
    };

    getReligion();
  }, [props]);

  return (
    <div className="review-tab">
      <h2>Account Details</h2>
      <div className="flex">
        {props.showAcctNo &&
          <PresentValue className="p-field col-4" name="Account Number" value={props.accountNo} />}
        <PresentValue className="p-field col-4" name="BVN" value={props.bvn} />
        {props.gaurdianBvn &&
          <PresentValue className="p-field col-4" name="Gaurdian BVN" value={props.gaurdianBvn} />}
        {props.isStaffAccount &&
          <PresentValue className="p-field col-4" name="WEMA Staff ID" value={props.newStaffEmployeeId} />}
      </div>
      <div className="flex">
        <PresentValue className="p-field col-4" name="Account Type" value={props.accountType} />
        <PresentValue className="p-field col-4" name="Currency" value={props.currency} />
        <PresentValue className="p-field col-4" name="Current Tier" value={props.tierType} />
      </div>
      <h2>Customer Personal Details</h2>
      <div className="flex">
        <PresentValue className="p-field col-2" name="Title" value={props.title} />
        <PresentValue className="p-field col-4" name="First Name" value={props.firstname} />
        <PresentValue className="p-field col-3" name="Middle Name" value={props.middlename} />
        <PresentValue className="p-field col-3" name="Last Name" value={props.lastname} />
      </div>
      <div className="flex">
        <PresentValue className="p-field col-4" name="Gender" value={props.gender} />
        <PresentValue className="p-field col-4" name="Marital Status" value={props.marstatus} />
        <PresentValue className="p-field col-4" name="Religion" value={religion} />
      </div>
      <div className="flex">
        <PresentValue className="p-field col-4" name="Date of Birth" value={props.dob} />
        <PresentValue className="p-field col-4" name="Place of Birth" value={props.pob} />
        <PresentValue className="p-field col-4" name="Country of Birth" value={countryOfBirth} />
      </div>
      <div className="flex">
        <PresentValue className="p-field col-3" name="Nationality" value={props.nationality} />
        {
          props.nationality === 'Nigeria' ? (
            <>
              <PresentValue className="p-field col-3" name="State of Origin" value={props.stateoforigin} />
              <PresentValue className="p-field col-3" name="LGA of Origin" value={props.lgaoforigin} />
            </>
          ) : (
            <>
              <PresentValue className="p-field col-3" name="Resident Permit No." value={props.respermit} />
              <PresentValue className="p-field col-3" name="Resident Permit Issue Date" value={props.respermisdate} />
              <PresentValue className="p-field col-3" name="Resident Permit Expiry Date" value={props.respermexdate} />
            </>
          )
        }
      </div>
      <h2>Customer Contact Details</h2>
      <div className="flex">
        <PresentValue className="p-field col-12" name="Address" value={address} />
      </div>
      <div className="flex">
        <PresentValue
          className="p-field col-12" name="Are you a citizen of another jurisdiction for tax purposes?"
          value={props.isMultipleCitizenship === 'true' ? 'Yes' : 'No'} />
      </div>
      {props.isMultipleCitizenship === 'true' && (
        <div className="flex">
          <PresentValue className="p-field col-6" name="Second Country" value={secondCountry} />
          <PresentValue className="p-field col-6" name={`TIN in ${secondCountry}`} value={props.secondTin} />
          <PresentValue
            className="p-field col-12" name={`Address in ${secondCountry}`}
            value={props.secondAddress} />
        </div>
      )}
      <div className="flex">
        <PresentValue className="p-field col-4" name="Phone Number 1" value={props.phonenumber1} />
        <PresentValue className="p-field col-4" name="Phone Number 2" value={props.phonenumber2} />
        <PresentValue className="p-field col-4" name="Email" value={props.email} />
      </div>
      <h2>Bank Infomation</h2>
      <div className="flex">
        <PresentValue className="p-field col-4" name="Introducer’s Staff ID." value={props.staffid} />
        <PresentValue className="p-field col-4" name="Relationship Manager ID." value={props.relationshipmanagerid} />
        {props.preferredBranchCode && props.branchCode !== props.preferredBranchCode &&
          (<PresentValue className="p-field col-4" name="Preferred Branch" value={props.preferredBranchCode} />)}
      </div>
    </div>
  );
};
