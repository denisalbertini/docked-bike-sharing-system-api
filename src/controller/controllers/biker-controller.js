import BaseController from '../base-controller.js';

export default class BikerController extends BaseController {
  createRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.createBiker(
        req.body.biker, req.body.creditCard, req.body.passport
      ),  
      res, 
      201
    );
  }

  login( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.login( req.body ), 
      res, 
      200
    );
  }

  updateRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.updateBiker( req.params.id, req.body ), 
      res, 
      200
    );
  }

  changeCreditCard( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.changeBikerCreditCard( req.params.id, req.body ), 
      res, 
      200
    );
  }
}
