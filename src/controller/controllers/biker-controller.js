import BaseController from '../base-controller.js';

export default class BikerController extends BaseController {
  #bikerFacade;

  constructor( modelService, bikerFacade ) {
    super( modelService );
    this.#bikerFacade = bikerFacade;
  }

  login( req, res ) {
    return this._handleOperation(
      () => this._modelService.login( req.body ), 
      res, 
      200
    );
  }

  updateRecord( req, res ) {
    return this._handleOperation(
      () => this.#bikerFacade.updateBiker( req.query.id, req.body ), 
      res, 
      200
    );
  }

  changeCreditCard( req, res ) {
    return this._handleOperation(
      this.#bikerFacade.changeBikerCreditCard( req.query.id, req.body ), 
      res, 
      200
    );
  }
}
