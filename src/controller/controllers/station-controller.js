import BaseController from '../base-controller.js';

export default class StationController extends BaseController {
  constructor( stationFacade ) { super( stationFacade ); }
  
  deleteRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.deleteStation( req.params.id ), 
      res, 
      204
    );
}
