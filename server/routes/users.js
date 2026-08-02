const express = require("express");
const Busboy = require("busboy");
const { User } = require("../models/User");
const { Detail } = require("../models/Detail");
const { authenticateToken, optionalAuthenticateToken } = require("../middleware/auth");
const { getPagination } = require("../utils/pagination");

const router = express.Router();


const getRequestBody = (req) =>
  new Promise((resolve, reject) => {
    if (req.body && Object.keys(req.body).length) return resolve(req.body);
    if ((req.headers["content-type"] || "").includes("multipart/form-data")) {
      let busboy;
      try {
        busboy = Busboy({ headers: req.headers });
      } catch (error) {
        return reject(error);
      }
      const body = {};
      const files = [];
      busboy.on("field", (name, value) => {
        body[name] = value;
      });
      busboy.on("file", (fieldname, file, info) => {
        const chunks = [];
        file.on("data", (chunk) => chunks.push(chunk));
        file.on("end", () =>
          files.push({
            fieldname,
            filename: info.filename,
            encoding: info.encoding,
            mimetype: info.mimeType,
            size: Buffer.concat(chunks).length,
            data: Buffer.concat(chunks).toString("base64"),
          })
        );
      });
      busboy.on("finish", () => {
        let existingFiles = [];
        try {
          existingFiles = body.existingFiles
            ? JSON.parse(body.existingFiles)
            : [];
        } catch {}
        delete body.existingFiles;
        resolve({ ...body, files: [...existingFiles, ...files] });
      });
      busboy.on("error", reject);
      req.pipe(busboy);
      return;
    }
    resolve(req.body || {});
  });

const detailsFromBody = (body) => {
  const stock = body.stock !== undefined && body.stock !== "" ? Number(body.stock) : 0;
  const productStatus =
    body.productStatus ||
    (stock === 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "In Stock");

  return {
    id: body.id,
    productName: body.productName || body.name || body.firstName || "",
    sku: body.sku || "",
    category: body.category || "",
    price: body.price !== undefined && body.price !== "" ? Number(body.price) : 0,
    stock,
    brand: body.brand || "",
    description: body.description || "",
    productStatus,
    firstName: body.firstName || body.productName || "",
    lastName: body.lastName || "",
    email: body.email || "",
    phone: body.phone || "",
    username: body.username || "",
    password: body.password || "",
    city: body.city || "",
    state: body.state || "",
    files: body.files || [],
  };
};


const getLoggedInUser = async (req) => {
  if (!req.user) return null;
  return await User.findOne({ id: req.user.id });
};



const getDetailsHandler = async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    // Relaxed auth restriction: fallback to "Buyer" role for guest users
    const role = user ? (user.role || "Buyer") : "Buyer";

    const conditions = [];

    // Only fetch actual products (which must have a productName, and not represent a user profile document)
    conditions.push({ productName: { $exists: true, $ne: "" } });
    conditions.push({
      $or: [
        { username: { $exists: false } },
        { username: "" },
        { username: null }
      ]
    });

    if (role === "Buyer") {
      conditions.push({ $or: [{ status: "approved" }, { status: { $exists: false } }, { status: null }] });
    } else if (role === "Seller") {
      conditions.push({ sellerId: user.id });
    }

    
    const category = String(req.query.category || "").trim();
    if (category && category !== "All") {
      conditions.push({ category: category });
    }

    
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    if (!isNaN(minPrice)) {
      conditions.push({ price: { $gte: minPrice } });
    }
    if (!isNaN(maxPrice)) {
      conditions.push({ price: { $lte: maxPrice } });
    }

    const searchQuery = String(req.query.search || "").trim();
    if (searchQuery) {
      const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedQuery, "i");
      const words = searchQuery.split(/\s+/).filter(Boolean);

      const searchOr = [
        { productName: searchRegex },
        { sku: searchRegex },
        { category: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { username: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { sellerName: searchRegex },
        { sellerEmail: searchRegex },
      ];

      if (words.length > 1) {
        const firstWordRegex = new RegExp(words[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        const restWordsRegex = new RegExp(words.slice(1).join(" ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        searchOr.push({
          $and: [
            { productName: firstWordRegex },
            { category: restWordsRegex },
          ],
        });
      }

      conditions.push({ $or: searchOr });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 10, 10);

    const totalRecords = await Detail.countDocuments(filter);
    const pagination = getPagination(page, limit, totalRecords);

    
    let sortOption = { createdAt: -1 }; 
    const sortBy = req.query.sort || "";
    if (sortBy === "price-low") {
      sortOption = { price: 1 };
    } else if (sortBy === "price-high") {
      sortOption = { price: -1 };
    } else if (sortBy === "newest") {
      sortOption = { createdAt: -1 };
    }

    const items = await Detail.find(filter)
      .select("-password -username -phone -email -city -state -firstName -lastName")
      .sort(sortOption)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();

    const slimItems = items.map((item) => {
      if (Array.isArray(item.files) && item.files.length > 0) {
        return { ...item, files: [item.files[0]] };
      }
      return item;
    });

    return res.json({
      success: true,
      message: "Products fetched successfully.",
      userRole: role,
      data: slimItems,
      pagination: pagination.metadata,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCategoriesHandler = async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    const role = user ? (user.role || "Buyer") : "Buyer";
    const conditions = [];

    if (role === "Buyer") {
      conditions.push({ $or: [{ status: "approved" }, { status: { $exists: false } }, { status: null }] });
    } else if (role === "Seller") {
      conditions.push({ sellerId: user.id });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};
    const categories = await Detail.distinct("category", filter);
    return res.json({
      success: true,
      data: categories.filter(Boolean),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const saveDetailsHandler = async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in before submitting product details.",
      });
    }

    const role = user.role || "Buyer";
    if (role === "Buyer") {
      return res.status(403).json({
        success: false,
        message: "Buyers only have view and search permissions.",
      });
    }

    const body = await getRequestBody(req);
    const detailData = detailsFromBody(body);

    const reqName = detailData.productName || detailData.firstName;

    if (!reqName) {
      return res.status(400).json({
        success: false,
        message: "Product Name is required.",
      });
    }

    const isEdit = req.method === "PUT" || !!detailData.id;

    if (isEdit) {
      
      const detailId = detailData.id || body.detailId || body._id;
      const existing = await Detail.findOne({ id: detailId });

      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Product record not found." });
      }

      if (role === "Seller" && existing.sellerId !== user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only edit products added by your seller account.",
        });
      }

      if (role === "Seller") {
        existing.status = "pending_edit";
        existing.pendingChanges = {
          productName: reqName,
          sku: detailData.sku,
          category: detailData.category,
          price: detailData.price,
          stock: detailData.stock,
          brand: detailData.brand,
          description: detailData.description,
          productStatus: detailData.productStatus,
          firstName: reqName,
          lastName: detailData.lastName,
          email: detailData.email,
          phone: detailData.phone,
          username: detailData.username,
          password: detailData.password,
          city: detailData.city,
          state: detailData.state,
          files: detailData.files,
        };
        await existing.save();

        return res.json({
          success: true,
          message: "Edit request submitted and pending Admin approval.",
          dataReceived: existing,
        });
      } else {
        
        existing.productName = reqName;
        existing.sku = detailData.sku;
        existing.category = detailData.category;
        existing.price = detailData.price;
        existing.stock = detailData.stock;
        existing.brand = detailData.brand;
        existing.description = detailData.description;
        existing.productStatus = detailData.productStatus;
        existing.firstName = reqName;
        existing.lastName = detailData.lastName;
        existing.email = detailData.email;
        existing.phone = detailData.phone;
        existing.username = detailData.username;
        existing.password = detailData.password;
        existing.city = detailData.city;
        existing.state = detailData.state;
        existing.files = detailData.files;
        existing.status = "approved";
        existing.pendingChanges = null;
        await existing.save();

        return res.json({
          success: true,
          message: "Product updated successfully.",
          dataReceived: existing,
        });
      }
    } else {
      
      const newId = `prod_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      const initialStatus = role === "Admin" ? "approved" : "pending_add";

      const created = await Detail.create({
        id: newId,
        sellerId: user.id,
        sellerName: user.name || "Unknown Seller",
        sellerEmail: user.authEmail || "",
        productName: reqName,
        sku: detailData.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        category: detailData.category || "General",
        price: detailData.price,
        stock: detailData.stock,
        brand: detailData.brand,
        description: detailData.description,
        productStatus: detailData.productStatus || "In Stock",
        firstName: reqName,
        lastName: detailData.lastName,
        email: detailData.email,
        phone: detailData.phone,
        username: detailData.username,
        password: detailData.password,
        city: detailData.city,
        state: detailData.state,
        files: detailData.files,
        status: initialStatus,
      });

      return res.status(201).json({
        success: true,
        message:
          role === "Admin"
            ? "Product added successfully."
            : "Product added and pending Admin approval.",
        dataReceived: created,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const deleteDetailsHandler = async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in before deleting details.",
      });
    }

    const role = user.role || "Buyer";
    if (role === "Buyer") {
      return res.status(403).json({
        success: false,
        message: "Buyers do not have permission to delete details.",
      });
    }

    const detailId = req.params.id || req.query.detailId || req.body?.id;
    const existing = await Detail.findOne({ id: detailId });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Detail record not found." });
    }

    if (role === "Seller" && existing.sellerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete details added by your seller account.",
      });
    }

    if (role === "Seller") {
      existing.status = "pending_delete";
      await existing.save();

      return res.json({
        success: true,
        message: "Delete request submitted for Admin approval.",
      });
    } else {
      await Detail.deleteOne({ id: detailId });
      return res.json({
        success: true,
        message: "Detail deleted successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


router.get("/admin/requests", authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin accounts can access moderation requests.",
      });
    }

    const pendingRequests = await Detail.find({
      status: { $in: ["pending_add", "pending_edit", "pending_delete"] },
    })
      .select("-password -username -phone -email -city -state -firstName -lastName")
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: pendingRequests,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});


router.post("/admin/requests/:id/approve", authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin accounts can approve requests.",
      });
    }

    const detailId = req.params.id;
    const item = await Detail.findOne({ id: detailId });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Request item not found." });
    }

    if (item.status === "pending_add") {
      item.status = "approved";
      await item.save();
    } else if (item.status === "pending_edit") {
      if (item.pendingChanges) {
        Object.assign(item, item.pendingChanges);
      }
      item.status = "approved";
      item.pendingChanges = null;
      await item.save();
    } else if (item.status === "pending_delete") {
      await Detail.deleteOne({ id: detailId });
    }

    const prodName = item.productName || item.firstName || "Product";

    return res.json({
      success: true,
      message: `Request for "${prodName}" approved successfully!`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});


router.post("/admin/requests/:id/decline", authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin accounts can decline requests.",
      });
    }

    const detailId = req.params.id;
    const item = await Detail.findOne({ id: detailId });

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Request item not found." });
    }

    if (item.status === "pending_add") {
      item.status = "rejected";
      item.pendingChanges = null;
      await item.save();
    } else if (item.status === "pending_edit") {
      item.status = "approved";
      item.pendingChanges = null;
      await item.save();
    } else if (item.status === "pending_delete") {
      item.status = "approved";
      await item.save();
    }

    const prodName = item.productName || item.firstName || "Product";

    return res.json({
      success: true,
      message: `Request for "${prodName}" declined.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});



router.get("/categories", optionalAuthenticateToken, getCategoriesHandler);
router.get("/", optionalAuthenticateToken, getDetailsHandler);

// Single product by ID — returns full data including files (used by product detail page)
router.get("/:id", optionalAuthenticateToken, async (req, res) => {
  try {
    const item = await Detail.findOne({ id: req.params.id }).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post(["/", "/details"], authenticateToken, saveDetailsHandler);
router.put(["/", "/:id"], authenticateToken, saveDetailsHandler);
router.delete(["/", "/:id"], authenticateToken, deleteDetailsHandler);

module.exports = router;