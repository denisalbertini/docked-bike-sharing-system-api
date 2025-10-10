import { errorStatusMap } from '../error-status-map.js';

export default class BaseController {
  _modelService;
  
  constructor( modelService ) {
    this._modelService = modelService;
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
      () => this._modelService.findAll(), 
      res, 
      200
    );
  }

  getRecord( req, res ) {
    return this._handleOperation(
      () => this._modelService.findById( req.params.id ), 
      res, 
      200
    );
  }

  createRecord( req, res ) {
    return this._handleOperation(
      () => this._modelService.create( req.body ), 
      res, 
      201
    );
  }

  updateRecord( req, res ) {
    return this._handleOperation(
      () => this._modelService.updateById( req.params.id ), 
      res,
      200
    );
  }

  deleteRecord( req, res ) {
    return this._handleOperation(
      () => this._handleOperation( req.params.id ), 
      res, 
      200
    );
  }
}
