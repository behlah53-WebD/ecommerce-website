const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Management API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths: {
      "/auth/signup": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Account created" },
            400: { description: "Missing fields" },
            409: { description: "Email already exists" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and get tokens",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            400: { description: "Missing fields" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: {
                    refreshToken: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Token refreshed" },
            401: { description: "Refresh token required" },
            403: { description: "Invalid refresh token" },
          },
        },
      },
      "/auth/change-password": {
        put: {
          tags: ["Auth"],
          summary: "Update password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["password"],
                  properties: {
                    email: { type: "string" },
                    id: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Password updated" },
            400: { description: "Missing fields" },
            404: { description: "User not found" },
          },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          security: [{ BearerAuth: [] }],
          summary: "Get user details",
          parameters: [
            { in: "query", name: "page", schema: { type: "integer" } },
            { in: "query", name: "limit", schema: { type: "integer" } },
            { in: "query", name: "search", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Success" },
            401: { description: "Unauthorized" },
          },
        },
        post: {
          tags: ["Users"],
          security: [{ BearerAuth: [] }],
          summary: "Add detail",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["firstName", "email"],
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                    username: { type: "string" },
                    password: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    existingFiles: { type: "string" },
                  },
                },
              },
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    email: { type: "string" },
                    files: { type: "array", items: { type: "string", format: "binary" } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Details added" },
            400: { description: "Missing fields" },
            401: { description: "Unauthorized" },
            409: { description: "Email already exists" },
          },
        },
        put: {
          tags: ["Users"],
          security: [{ BearerAuth: [] }],
          summary: "Update detail",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["id", "firstName", "email"],
                  properties: {
                    id: { type: "string" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                    username: { type: "string" },
                    password: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Details updated" },
            400: { description: "Missing fields" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
            409: { description: "Email already exists" },
          },
        },
        delete: {
          tags: ["Users"],
          security: [{ BearerAuth: [] }],
          summary: "Delete detail",
          responses: {
            200: { description: "Details deleted" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
          },
        },
      },
      "/users/{id}": {
        get: {
          tags: ["Users"],
          security: [{ BearerAuth: [] }],
          summary: "Get details by user ID",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Success" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        put: {
          tags: ["Users"],
          security: [{ BearerAuth: [] }],
          summary: "Update detail by user ID",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["id", "firstName", "email"],
                  properties: {
                    id: { type: "string" },
                    firstName: { type: "string" },
                    email: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Details updated" },
            400: { description: "Missing fields" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
            409: { description: "Email already exists" },
          },
        },
        delete: {
          tags: ["Users"],
          security: [{ BearerAuth: [] }],
          summary: "Delete detail by user ID",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } },
            { in: "query", name: "detailId", schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Details deleted" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs, swaggerUi };