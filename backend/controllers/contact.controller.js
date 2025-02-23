const catchAsync = require("../utils/catchAsync");
const ContactService = require("../services/contact.service");
const prot_rest = require("../utils/authMiddlewaresOptions");
const { validateSearchParams, validatorFilterParams, validateSortPaginationParams } = require("../middlewares/validation.middlewares");

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
      .get(prot_rest("admin", "super_admin"),
        validateSortPaginationParams(this.allowedSort),
        validatorFilterParams(this.allowedFilters, this.allowedValues),
        catchAsync(this.getContacts));

    this.router
      .route("/contact/:id")
      //no of use
      .get(prot_rest("admin", "super_admin"), catchAsync(this.getContactById))
      .patch(prot_rest("admin", "super_admin"), catchAsync(this.deleteContact));

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

    //notify  forward use a mail
    this.router.get(
      "/contact/:id/auto-reply",
      prot_rest("admin", "super_admin"),
      catchAsync(this.sendAcknowledgementEmail)
    );

    //admin replay to customer
    this.router.post(
      "/contact/:id/reply",
      prot_rest("admin", "super_admin"),
      catchAsync(this.sendReplyToContact)
    );
    // id --> review -- mail + content :[ massage:[different message] ]
  }

  async createContact(req, res) {
    const newContact = await ContactService.createContact(req.body);
    res.status(201).json({
      status: "success",
      data: newContact,
    });
  }

  //filters
  allowedFilters = [['isSeen', 'isActive', 'undefined']]
  allowedValues = [['true', 'false', 'undefined']]
  allowedSort = ['createdAt', 'undefined']

  //pagination
  async getContacts(req, res) {

    let result = await ContactService.getContacts(req.validatedParams);

    res.status(200).json({
      status: "success",
      result
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

  //body contains the ids of massage that we need to update it's status to be in a seen state 
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
    const contact = await ContactService.deleteContact(req.params.id);
    res.status(200).json({
      status: "success",
      data: contact,
    });
  }

  async sendAcknowledgementEmail(req, res) {
    await ContactService.sendAcknowledgementEmail(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Acknowledgement email sent successfully",
    });
  }

  async sendReplyToContact(req, res) {
    await ContactService.sendReplyToContact(req.params.id, req.body.content);
    res.status(200).json({
      status: "success",
      message: "Reply sent successfully",
    });
  }
}

module.exports = new ContactController().router;
