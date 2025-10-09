import BaseController from '../base-controller.js';

export default class StationController extends BaseController {
  #stationFacade;

  constructor( stationFacade ) {
    this.#stationFacade = stationFacade;
  }

  deleteRecord( req, res ) {
    return this._handleOperation(
      () => this.#stationFacade.deleteStation( req.query.id ), 
      res, 
      200
    );
  }
}
