const Contact = require("../models/contact.model");
const ContactRepository = require("../repos/contact.repo");
const AppError = require("../utils/appError");
const Email = require("../utils/email");

class ContactService {
  async createContact(contactData) {
    if (!contactData.name || !contactData.email || !contactData.message) {
      throw new AppError("Name, email and message are required", 400);
    }

    const contact = await ContactRepository.createContact(contactData);
    return contact;
  }

  async getAllContacts() {
    const contacts = await ContactRepository.getAllContacts();
    if (!contacts) {
      throw new AppError("No contacts found", 404);
    }
    return contacts;
  }

  async getContactById(id) {
    const contact = await ContactRepository.getContactById(id);
    if (!contact) {
      throw new AppError("No contact found with this id", 400);
    }
    return contact;
  }

  async markAsSeen(contactId) {
    const contact = await ContactRepository.getContactById(contactId);
    if (!contact) {
      throw new AppError("Contact message not found", 404);
    }

    return ContactRepository.updateContact(contactId, {
      isSeen: true,
      seenAt: Date.now(),
    });
  }

  async bulkMarkAsSeen(ids) {
    if (!Array.isArray(ids)) {
      throw new AppError("Invalid IDs format", 400);
    }

    if (ids.length === 0) {
      throw new AppError("No contact IDs provided", 400);
    }

    const result = await ContactRepository.bulkMarkAsSeen(ids);

    if (result.nModified === 0) {
      throw new AppError("No contacts were updated", 404);
    }

    return result;
  }

  async deleteContact(id) {
    const contact = await ContactRepository.deleteContact(id);
    if (!contact) {
      throw new AppError("No contact found with this id", 400);
    }
    return contact;
  }

  async sendAcknowledgementEmail(id) {
    const contact = await ContactRepository.getContactById(id);
    const user = { firstName: contact.name, email: contact.email };

    try {
      await new Email(user).sendContactAcknowledgement();
    } catch (e) {
      throw e;
    }
  }

  async sendReplyToContact(id, content) {
    if (!content) {
      throw new AppError("Content must be provided", 400);
    }
    const contact = await ContactRepository.getContactById(id);
    const user = { firstName: contact.name, email: contact.email };

    try {
      await new Email(user).sendContactReply(content);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = new ContactService();
