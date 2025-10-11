import BaseController from '../base-controller.js';

export default class BikeRemovalController extends BaseController {
  createRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.createBikeRemoval( req.body ), 
      res, 
      201
    );
  }
}
