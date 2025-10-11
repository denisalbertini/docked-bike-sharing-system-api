import BaseController from '../base-controller.js';

export default class StationController extends BaseController {
  deleteRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.deleteStation( req.params.id ), 
      res, 
      200
    );
  }
}
