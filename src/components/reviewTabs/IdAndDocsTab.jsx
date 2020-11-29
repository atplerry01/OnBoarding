import React from 'react';
import PresentValue from '../PresentValue';

export default (props) => (
  <div className="review-tab">
    <h2>Identity card and Documents</h2>
    <div className="flex">
      <PresentValue className="p-field col-4" name="ID Type" value={props.idtype} />
      {props.idtype === 'Other ID Types' &&
        <PresentValue className="p-field col-4" name="Specify ID Type" value={props.otherIdType} />}
      <PresentValue className="p-field col-4" name="Tax ID No." value={props.tin} />
    </div>
    <div className="flex">
      <PresentValue className="p-field col-4" name="ID Number" value={props.idno} />
      <PresentValue className="p-field col-4" name="ID Issue Date" value={props.issdate} />
      <PresentValue className="p-field col-4" name="ID Expiry Date" value={props.expdate} />
    </div>
    <div className="flex">
      <PresentValue
        className="p-field col-4" name="Means of Identification"
        value={
          props.dImage_zimg_id_x &&
          (props.dImage_zimg_id_x.includes('http://') ||
          props.dImage_zimg_id_x.includes('https://')) ?
            <a href={props.dImage_zimg_id_x}>Preview Image</a> :
            <img src={props.dImage_zimg_id_x} alt="" />
        } />
      <PresentValue
        className="p-field col-4" name="Signature Image"
        value={
          props.dImage_zimg_sign_x &&
          (props.dImage_zimg_sign_x.includes('http://') ||
          props.dImage_zimg_sign_x.includes('https://')) ?
            <a href={props.dImage_zimg_sign_x}>Preview Image</a> :
            <img src={props.dImage_zimg_sign_x} alt="" />
        } />
      <PresentValue
        className="p-field col-4" name="Passport Image"
        value={
          props.dImage_zimg_selfie_x &&
          (props.dImage_zimg_selfie_x.includes('http://') ||
          props.dImage_zimg_selfie_x.includes('https://')) ?
            <a href={props.dImage_zimg_selfie_x}>Preview Image</a> :
            <img src={props.dImage_zimg_selfie_x} alt="" />
        } />
      <PresentValue
        className="p-field col-4" name="Utility Bill Image"
        value={
          props.dImage_zimg_utility_x &&
          (props.dImage_zimg_utility_x.includes('http://') ||
          props.dImage_zimg_utility_x.includes('https://')) ?
            <a href={props.dImage_zimg_utility_x}>Preview Image</a> :
            <img src={props.dImage_zimg_utility_x} alt="" />
        } />
    </div>
  </div>
);
