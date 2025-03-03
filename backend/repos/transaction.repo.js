// repositories/transactionRepository.js
const Transaction = require("../models/transaction.model");

class TransactionRepository {
  async create(data) {
    const transaction = new Transaction(data);
    return transaction.save();
  }

  async getById(id) {
    return Transaction.findById(id);
  }

  async getAll(filter = {}) {
    return Transaction.find(filter);
  }

  async update(id, data) {
    return Transaction.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return Transaction.findByIdAndDelete(id);
  }
}

module.exports = new TransactionRepository();
