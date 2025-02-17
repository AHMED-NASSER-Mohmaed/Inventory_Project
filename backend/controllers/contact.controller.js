const catchAsync = require("../utils/catchAsync");
const ContactService = require("../services/contact.service");
const prot_rest = require("../utils/authMiddlewaresOptions");

class ContactController {

  constructor() {
    this.router = require("express").Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router
      .route("/contact")
      .post(catchAsync(this.createContact))

      //paginated one 
      .get(prot_rest("admin", "super_admin"), catchAsync(this.getAllContacts));
/*
    this.router
      .route("/contact/:id")
      //no of use 
      .get(prot_rest("admin", "super_admin"), catchAsync(this.getContactById))

      .delete(
        prot_rest("admin", "super_admin"),

        //soft delete 
        catchAsync(this.deleteContact)
      );

    this.router.patch(
      "/contact/:id/mark-seen",
      prot_rest("admin", "super_admin"),
      catchAsync(this.markAsSeen)
    );

    this.router.patch(
      "/contact/bulk-mark-seen",
      prot_rest("admin", "super_admin"),
      catchAsync(this.bulkMarkAsSeen)
    );
*/
    //notify  forward use a mail 


    //admin replay to customer 
    // id --> review -- mail + content :[ massage:[different message] ]  


    
  }

  async createContact(req, res) {
    const newContact = await ContactService.createContact(req.body);
    res.status(201).json({
      status: "success",
      data: newContact,
    });
  }

  async getAllContacts(req, res) {
    const { contacts, unseenCount } = await ContactService.getAllContacts();

    res.status(200).json({
      status: "success",
      results: contacts.length,
      unseenCount,
      data: contacts,
    });
  }

  async getContactById(req, res) {
    const contact = await ContactService.getContactById(req.params.id);

    res.status(200).json({
      status: "success",
      data: contact,
    });
  }

  async markAsSeen(req, res) {
    const contact = await ContactService.markAsSeen(req.params.id);
    res.status(200).json({
      status: "success",
      data: contact,
    });
  }

  async bulkMarkAsSeen(req, res) {
    const { ids } = req.body;

    const result = await ContactService.bulkMarkAsSeen(ids);

    res.status(200).json({
      status: "success",
      data: {
        result,
      },
    });
  }

  async deleteContact(req, res) {
    await ContactService.deleteContact(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  }
}

module.exports = new ContactController().router;
