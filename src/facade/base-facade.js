import { getBaseClassConstructorMessage } from '../model/shared/constructor-error-message.js';

export default class BaseFacade {
  _modelService;

  constructor( modelService ) {
    if ( new.target === BaseFacade )
      throw new Error( getBaseClassConstructorMessage( BaseFacade.name ) );
    
    this._modelService = modelService;
  }

  getRecords() {
    return this._modelService.findAll();
  }

  getRecordById( id ) {
    return this._modelService.findById( id );
  }

  createRecord( data ) {
    return this._modelService.create( data );
  }

  updateRecordById( id, data ) {
    return this._modelService.updateById( id, data );
  }

  deleteRecordById( id ) {
    return this._modelService.deleteById( id );
  }
}
