const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Delivery App API",
      version: "1.0.0",
      description:
        "API documentation for the scalable food delivery backend system.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],
    // 👇 REORDERED LOGICAL SERIAL ORDER 👇
    tags: [
      // 🛠️ 1. CORE UTILITIES & AUTHENTICATION
      { name: "System", description: "Health checks and server status" },
      { name: "Uploads", description: "Image upload API using Cloudinary" },
      { name: "Authentication", description: "User registration, login, and profile" },
      { name: "Addresses", description: "User delivery address management" },

      // 🍔 2. DISCOVERY & CATALOG
      { name: "Search & Discovery", description: "Search restaurants and food items globally" },
      { name: "Restaurants", description: "Vendor store management" },
      { name: "Menu & Products", description: "Food items and menu management" },
      { name: "Favorites", description: "User wishlist for favorite stores and dishes" },

      // 🛒 3. ORDERING & CHECKOUT
      { name: "Coupons", description: "Promo codes and discount management" },
      { name: "Cart & Orders", description: "Cart management and order placement" },
      { name: "Payments & Refunds", description: "Razorpay integration and refund logic" },

      // 🚀 4. LOGISTICS & POST-ORDER
      { name: "Delivery & Dispatch", description: "Rider assignment, emergency transfers, and status updates" },
      { name: "Reviews & Ratings", description: "Customer feedback for food and delivery" },
      { name: "Support", description: "Helpdesk ticket system for customers and riders" },

      // 💰 5. VENDOR OPS, FINANCIALS & ADMIN
      { name: "Bank Details", description: "Bank account management for Vendor & Delivery Partner payouts" },
      { name: "Settlements", description: "Financial ledger and payouts for vendors and riders" },
      { name: "Admin Dashboard", description: "Analytics and platform statistics" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./server.js", "./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
