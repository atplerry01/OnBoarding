import React from 'react';
import PresentValue from '../PresentValue';

export default (props) => (
  <div className="review-tab">
    <h2>Account Services Required</h2>
    <div className="flex">
      <PresentValue className="p-field col-6" name="Selected Card Type" value={props.requestcard} />
      <PresentValue className="p-field col-6" name="Request SMS or/and Email alert" value={props.requestalert} />
    </div>
    <div className="flex">
      <PresentValue
        className="p-field col-6" name="Request for Chequebook"
        value={props.requestcheq ? 'Yes' : 'No'} />
      <PresentValue
        className="p-field col-6" name="Register for USSD"
        value={props.requestussd ? 'Yes' : 'No'} />
    </div>
    {(props.accountType === 'Current' || props.requestcheq) &&
      (
        <>
          <h2>Referee(s) Details</h2>
          {props.refereeMode === 'Via Email' ?
            (
              <>
                <div className="flex">
                  <PresentValue className="p-field col-4" name="Referee 1 Name" value={props.refereename1} />
                  <PresentValue className="p-field col-4" name="Referee 1 Email" value={props.refereeemail1} />
                  <PresentValue className="p-field col-4" name="Referee 1 Phone No." value={props.refereephoneno1} />
                </div>
                <div className="flex">
                  <PresentValue className="p-field col-4" name="Referee 2 Name" value={props.refereename2} />
                  <PresentValue className="p-field col-4" name="Referee 2 Email" value={props.refereeemail2} />
                  <PresentValue className="p-field col-4" name="Referee 2 Phone No." value={props.refereephoneno2} />
                </div>
              </>
            ) :
            (
              <div className="flex">
                <PresentValue
                  className="p-field col-6" name="Referee Details Collection Mode" value={props.refereeMode} />
              </div>
            )}
        </>
      )}
  </div>
);
