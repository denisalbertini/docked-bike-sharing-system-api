import BaseController from '../base-controller.js';

export default class DockAdmissionController extends BaseController {
  createRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.createDockAdmission( req.body ), 
      res, 
      201
    );
  }
}
