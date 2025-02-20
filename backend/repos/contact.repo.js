const Contact = require("../models/contact.model");
const {inboxResult}=require("../utils/apiFeatures")

class ContactRepository {
  async createContact(data) {
    try {
      return await Contact.create(data);
    } catch (err) {
      throw err;
    }
  }

  async getContacts(filters, sort, page, limit) {

    try {

      const [results, total] = await Promise.all([

        await Contact.find(filters)
          .sort(sort)
          .skip((page - 1) * limit) // (starting index = page-1)*limit
          .limit(limit)
          .select("-__v")
          .lean(),

        await Contact.countDocuments(filters).collation({ locale: 'en', strength: 1 }).exec()
      ]);

      // console.log("from repo" , results);

      return inboxResult(results, total, page, limit);


    } catch (err) {
      throw err;
    }



  }

  async getContactById(id) {
    try {
      return await Contact.findById(id);
    } catch (err) {
      throw err;
    }
  }

  async updateContact(id, updateData) {
    try {
      return Contact.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (err) {
      throw err;
    }
  }

  async bulkMarkAsSeen(ids) {
    return Contact.updateMany(
      { _id: { $in: ids } },
      {
        isSeen: true,
        seenAt: Date.now(),
      }
    );
  }

  async deleteContact(id) {
    try {
      return await Contact.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true, runValidators: true }
      );
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ContactRepository();
