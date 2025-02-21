// Here's the complete repository implementation for the cart system following the layered architecture:

// ### 1. Cart Repository (repositories/cart.repository.js)

const Cart = require("../models/cart.model");
const { NotFoundError, DatabaseError } = require("../utils/appError");

class CartRepository {
  async createCart(cartData) {
    try {
      return await Cart.create(cartData);
    } catch (error) {
      throw new DatabaseError("Failed to create cart");
    }
  }

  async findCartById(cartId) {
    try {
      const cart = await Cart.findById(cartId)
        .populate("products.product")
        .populate("branch")
        .lean();

      if (!cart) throw new NotFoundError("Cart not found");
      return cart;
    } catch (error) {
      if (error.name === "CastError") {
        throw new NotFoundError("Invalid cart ID format");
      }
      throw new DatabaseError("Error fetching cart");
    }
  }

  async findCartBySession(sessionId) {
    try {
      return await Cart.findOne({ sessionId })
        .populate("products.product")
        .populate("branch");
    } catch (error) {
      throw new DatabaseError("Error finding session cart");
    }
  }

  async findCartByUser(customerId) {
    try {
      return await Cart.findOne({ customerId })
        .populate("products.product")
        .populate("branch");
    } catch (error) {
      throw new DatabaseError("Error finding user cart");
    }
  }

  async updateCart(cartId, updateFn) {
    const session = await Cart.startSession();
    try {
      let updatedCart;

      await session.withTransaction(async () => {
        const cart = await Cart.findById(cartId).session(session);
        if (!cart) throw new NotFoundError("Cart not found");

        updatedCart = await updateFn(cart);
        await updatedCart.save({ session });
      });

      return updatedCart;
    } catch (error) {
      if (error.name === "VersionError") {
        throw new DatabaseError("Cart modified concurrently");
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteCart(cartId) {
    try {
      const result = await Cart.deleteOne({ _id: cartId });
      if (result.deletedCount === 0) {
        throw new NotFoundError("Cart not found");
      }
      return true;
    } catch (error) {
      throw new DatabaseError("Error deleting cart");
    }
  }

  async mergeCarts(sessionCartId, userCartId) {
    const session = await Cart.startSession();
    try {
      let mergedCart;

      await session.withTransaction(async () => {
        const sessionCart = await Cart.findById(sessionCartId).session(session);
        const userCart = await Cart.findById(userCartId).session(session);

        if (!sessionCart || !userCart) {
          throw new NotFoundError("One or both carts not found");
        }

        // Merge products
        sessionCart.products.forEach((sessionItem) => {
          const existingItem = userCart.products.find((userItem) =>
            userItem.product.equals(sessionItem.product)
          );

          if (existingItem) {
            existingItem.quantity += sessionItem.quantity;
          } else {
            userCart.products.push(sessionItem);
          }
        });

        // Update expiration
        userCart.expiresAt = undefined;
        userCart.sessionId = undefined;

        mergedCart = await userCart.save({ session });
        await Cart.deleteOne({ _id: sessionCartId }).session(session);
      });

      return mergedCart;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new CartRepository();

// ### 2. Cart Service (services/cart.service.js)
const cartRepository = require("../repositories/cart.repository");
const productService = require("./product.service");
const inventoryService = require("./inventory.service");
const {
  NotFoundError,
  InsufficientStockError,
  InvalidInputError,
} = require("../utils/appError");

class CartService {
  async getCart(cartId) {
    return cartRepository.findCartById(cartId);
  }

  async addToCart(cartId, productId, quantity = 1) {
    if (quantity <= 0) throw new InvalidInputError("Invalid quantity");

    const product = await productService.getProduct(productId);
    const availableStock = await inventoryService.getStock(productId);

    if (availableStock < quantity) {
      throw new InsufficientStockError("Not enough stock available");
    }

    return cartRepository.updateCart(cartId, async (cart) => {
      const existingItem = cart.products.find((item) =>
        item.product.equals(productId)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.products.push({
          product: productId,
          quantity,
          priceSnapshot: product.price,
        });
      }

      return cart;
    });
  }

  async removeFromCart(cartId, productId, quantity = 1) {
    if (quantity <= 0) throw new InvalidInputError("Invalid quantity");

    return cartRepository.updateCart(cartId, async (cart) => {
      const itemIndex = cart.products.findIndex((item) =>
        item.product.equals(productId)
      );

      if (itemIndex === -1) return cart;

      const currentQuantity = cart.products[itemIndex].quantity;

      if (currentQuantity <= quantity) {
        cart.products.splice(itemIndex, 1);
      } else {
        cart.products[itemIndex].quantity -= quantity;
      }

      return cart;
    });
  }

  async createCart(cartType, branchId, userData = {}) {
    const cartData = {
      cartType,
      branch: branchId,
      ...(cartType === "online"
        ? {
            [userData.customerId ? "customerId" : "sessionId"]:
              userData.customerId || generateSessionId(),
          }
        : {
            clerk: userData.clerkId,
            cashier: userData.cashierId,
          }),
    };

    return cartRepository.createCart(cartData);
  }

  async mergeCarts(sessionCartId, userCartId) {
    return cartRepository.mergeCarts(sessionCartId, userCartId);
  }
}

module.exports = new CartService();

// ### 3. Cart Controller (controllers/cart.controller.js)

const cartService = require("../services/cart.service");
const catchAsync = require("../utils/catchAsync");
const { validateCartAccess } = require("../middlewares/cart.middleware");

class CartController {
  constructor() {
    this.router = require("express").Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/", catchAsync(this.createCart));
    this.router.get("/:id", validateCartAccess, catchAsync(this.getCart));
    this.router.post(
      "/:id/items",
      validateCartAccess,
      catchAsync(this.addItem)
    );
    this.router.delete(
      "/:id/items",
      validateCartAccess,
      catchAsync(this.removeItem)
    );
    this.router.post("/merge", catchAsync(this.mergeCarts));
  }

  createCart = async (req, res) => {
    const { cartType, branchId } = req.body;
    const cart = await cartService.createCart(cartType, branchId, {
      customerId: req.user?.id,
      sessionId: req.sessionID,
      clerkId: req.user?.id,
      cashierId: req.body.cashierId,
    });

    res.status(201).json({
      status: "success",
      data: cart,
    });
  };

  getCart = async (req, res) => {
    const cart = await cartService.getCart(req.params.id);
    res.json({
      status: "success",
      data: cart,
    });
  };

  addItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(
      req.params.id,
      productId,
      quantity
    );

    res.json({
      status: "success",
      data: cart,
    });
  };

  removeItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.removeFromCart(
      req.params.id,
      productId,
      quantity
    );

    res.json({
      status: "success",
      data: cart,
    });
  };

  mergeCarts = async (req, res) => {
    const { sessionCartId, userCartId } = req.body;
    const mergedCart = await cartService.mergeCarts(sessionCartId, userCartId);

    res.json({
      status: "success",
      data: mergedCart,
    });
  };
}

module.exports = new CartController().router;

// ### 4. Supporting Files

// *Error Classes (utils/appError.js):*

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500);
  }
}

class InsufficientStockError extends AppError {
  constructor(message = "Insufficient stock") {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  DatabaseError,
  InsufficientStockError,
};

// *Cart Middleware (middlewares/cart.middleware.js):*
const { ForbiddenError } = require("../utils/appError");

const validateCartAccess = (req, res, next) => {
  // Implement logic to validate user has access to the cart
  // Example: Check if user owns the cart or has staff privileges
  if (!hasAccess(req.user, req.params.id)) {
    throw new ForbiddenError("Access to cart denied");
  }
  next();
};

module.exports = {
  validateCartAccess,
};

/*
This implementation provides:

1. *Repository Layer*
   - Database operations with proper error handling
   - Transaction support for critical operations
   - Population of related entities (products, branch)
   - Session-based and user-based cart management

2. *Service Layer*
   - Business logic for cart operations
   - Inventory stock validation
   - Price snapshot management
   - Cart merging functionality

3. *Controller Layer*
   - RESTful API endpoints
   - Input validation
   - Authentication middleware integration
   - Error handling middleware integration

For parallel development:

*Developer 1 (Model + Repository):*
- Focus on database operations
- Implement transaction handling
- Optimize query performance
- Handle concurrency issues

*Developer 2 (Service + Controller):*
- Implement business rules
- Integrate with other services (products, inventory)
- Create API endpoints
- Handle error responses

*Integration Points:*
1. Repository method signatures
2. Error classes interface
3. Cart schema definition
4. Middleware authentication flow

This structure allows both developers to work independently while maintaining:
- Clear layer boundaries
- Consistent error handling
- Transaction safety
- RESTful API conventions
- Proper separation of concerns*/
