import BaseController from '../base-controller.js';

export default class BikeController extends BaseController {
  constructor( bikeFacade ) { super( bikeFacade ); }
  
  deleteRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.deleteBike( req.params.id ), 
      res, 
      200
    );
  }
}
