import { Model } from 'sequelize';
import { getBaseClassConstructorMessage } from '../model/shared/constructor-error-message.js';
import { errorStatusMap } from '../model/shared/error-status-map.js';
import Result from '../model/shared/result.js';

export default class BaseController {
  _modelFacade;
  
  constructor( modelFacade ) {
    if ( new.target === BaseController )
      throw new Error( getBaseClassConstructorMessage( BaseController.name ) );
    
    this._modelFacade = modelFacade;
  }

  async _handleOperation( operation, res, successStatus ) {
    let result = await operation();

    if ( result.isFailure ) {
      const errorType = result.errorType;
      const errors = result.errors;
      
      return res
        .status( errorStatusMap.get( errorType ) )
        .send( { errorType, errors } );
    }

    if ( result.value instanceof Model )
      result = Result.success( result.value.toJSON() );

    if ( result.value instanceof Array && result.value[0] instanceof Model )
      result = Result.success( result.value.map( v => v.toJSON() ) );

    if ( successStatus === 204 ) res.sendStatus( 204 );
    
    res.status( successStatus ).send( result.value );
  }

  listRecords = ( _req, res ) =>
    this._handleOperation(
      () => this._modelFacade.getRecords(), 
      res, 
      200
    );

  getRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.getRecordById( req.params.id ), 
      res, 
      200
    );

  createRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.createRecord( req.body ), 
      res, 
      201
    );

  updateRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.updateRecordById( req.params.id, req.body ), 
      res,
      200
    );

  deleteRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.deleteRecordById( req.params.id ), 
      res, 
      204
    );
}
