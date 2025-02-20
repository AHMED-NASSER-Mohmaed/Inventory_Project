const Contact = require("../models/contact.model");

class ContactRepository {
  async createContact(data) {
    try {
      return await Contact.create(data);
    } catch (err) {
      throw err;
    }
  }

  async getAllContacts() {
    try {
      const contacts = await Contact.find();
      const unseenCount = await Contact.countDocuments({ isSeen: false });
      return { contacts, unseenCount };
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
      return await Contact.findByIdAndDelete(id);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new ContactRepository();
