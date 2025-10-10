import BaseController from '../base-controller.js';

export default class BikerController extends BaseController {
  #bikerFacade;

  constructor( modelService, bikerFacade ) {
    super( modelService );
    this.#bikerFacade = bikerFacade;
  }

  createRecord( req, res ) {
    return this._handleOperation(
      () => this.#bikerFacade.createBiker(
        req.body.biker, req.body.creditCard, req.body.passport
      ),  
      res, 
      201
    );
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
      () => this.#bikerFacade.updateBiker( req.params.id, req.body ), 
      res, 
      200
    );
  }

  changeCreditCard( req, res ) {
    return this._handleOperation(
      this.#bikerFacade.changeBikerCreditCard( req.params.id, req.body ), 
      res, 
      200
    );
  }
}
