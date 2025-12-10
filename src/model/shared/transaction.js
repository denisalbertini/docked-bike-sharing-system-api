export default class SequelizeTransaction {
  #sequelize;
  #transaction;
  
  constructor( sequelize ) {
    this.#sequelize = sequelize;
    this.#transaction = null;
  }

  async start() {
    if ( this.#transaction )
      throw new Error( 'Transaction already started.' );

    this.#transaction = await this.#sequelize.transaction();

    return this.#transaction;
  }

  async commit() {
    if ( !this.#transaction )
      throw new Error( 'No transaction to commit.' );

    await this.#transaction.commit();

    this.#transaction = null;
  }

  async rollback() {
    if ( !this.#transaction )
      throw new Error( 'No transaction to rollback.' );

    await this.#transaction.rollback();

    this.#transaction = null;
  }
}
