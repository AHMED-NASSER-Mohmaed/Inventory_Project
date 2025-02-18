const supplierModel = require('../models/supplier.model');
const AppError = require('../utils/appError');
const { inboxResult } = require("../utils/apiFeatures");


class SupplierRepository {

  //reviewed 
  async createSupplier(supplierData) {
    try {
      return await supplierModel.create(supplierData);
    } catch (err) {
      throw err;
    }
  }

  //reviewed
  async getSuppliers(filters, sort, page, limit) {

    try {

      const [results, total] = await Promise.all([

        await supplierModel.find(filters)
          .sort(sort)
          .skip((page - 1) * limit) // (starting index = page-1)*limit
          .limit(limit)
          .lean(),

        await supplierModel.countDocuments(filters).exec()
      ]);



      return inboxResult(results, total, page, limit);

    } catch (err) {
      throw err;
    }
  }

  //reviewed
  async getCount(filters) {
    try {
      //filters :['isActive','undefined']-->['true','false','undefined']
      return await supplierModel.countDocuments(filters).exec();
    } catch (err) {
      throw err;
    }
  }

 

  //reviewed
  async updateSupplier(supplierId, updateData) {
    try {

      return await supplierModel.updateOne({ _id: supplierId }, {$set:{updateData}}, { runValidators: true })
        .select('-createdAt -updatedAt -__v');

    } catch (err) {
      throw err;
    }
  }

  //reviewed
  async deleteSupplierById(supplierId) { // soft delete
    try {

      return await supplierModel.updateOne({ _id: supplierId }, {$set:{ isActive: false}}, )
        

    } catch (err) {
      throw err;
    }
  }



  //reviewed
  async activateSupplier(supplierId) {
    try {
      return await supplierModel.updateOne({_id:supplierId},{ isActive: true });
    } catch (err) {
      throw err;
    }
  }


  //reviewed
  async getSupplierById(supplierId) {
    try {
     return await supplierModel.findById(supplierId);
    } catch (err) {
      throw err;
    }
  }


 
}

module.exports = new SupplierRepository();