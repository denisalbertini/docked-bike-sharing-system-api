import { getBaseClassConstructorMessage } from '../model/shared/constructor-error-message.js';
import { errorStatusMap } from '../model/shared/error-status-map.js';

export default class BaseController {
  _modelFacade;
  
  constructor( modelFacade ) {
    if ( new.target === BaseController )
      throw new Error( getBaseClassConstructorMessage( BaseController.name ) );
    
    this._modelFacade = modelFacade;
  }

  async _handleOperation( operation, res, successStatus ) {
    const result = await operation();

    if ( result.isFailure ) {
      const errorType = result.errorType;
      const errors = result.erros;
      
      return res
        .status( errorStatusMap.get( errorType ) )
        .send( { errorType, errors } );
    }

    res.status( successStatus ).send( result.value );
  }

  listRecords( _req, res ) {
    return this._handleOperation(
      () => this._modelFacade.findRecords(), 
      res, 
      200
    );
  }

  getRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.findRecordById( req.params.id ), 
      res, 
      200
    );
  }

  createRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.createRecord( req.body ), 
      res, 
      201
    );
  }

  updateRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.updateRecordById( req.params.id ), 
      res,
      200
    );
  }

  deleteRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.deleteRecordById( req.params.id ), 
      res, 
      200
    );
  }
}
