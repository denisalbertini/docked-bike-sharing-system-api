import BaseController from '../base-controller.js';

export default class BikeAdmissionController extends BaseController {
  createRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.createBikeAdmission( req.body ), 
      res, 
      201
    );
  }
}
