import BaseController from '../base-controller.js';

export default class BikerController extends BaseController {
  constructor( bikerFacade ) { super( bikerFacade ); }
  
  createRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.createBiker(
        req.body.biker, req.body.creditCard, req.body.passport
      ),  
      res, 
      201
    );

  confirmEmail = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.confirmEmail(
        req.params.id, req.query.token
      ), 
      res, 
      204
    );

  updateRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.updateBiker(
        req.params.id, req.body.biker, req.body.passport
      ), 
      res, 
      200
    );

  changeCreditCard = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.changeBikerCreditCard(
        req.params.id, req.body
      ), 
      res, 
      204
    );

  login = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.login( req.body ), 
      res, 
      200
    );
}
