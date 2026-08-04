const express = require('express');
const Order = require('../models/Order');
const {Detail} = require('../models/Detail');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const getLoggedInUser = async (req) => {
  const User = require('../models/User').User;
  if (!req.user) return null;
  return await User.findOne({ id: req.user.id });
};


router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin accounts can access all orders.',
      });
    }

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Fetch all orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// Admin: Update order status (approve/ship/deliver/cancel)
router.post('/admin/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin accounts can update order status.',
      });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Processing, Shipped, Delivered, Cancelled.',
      });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const previousStatus = order.status;
    order.status = status;

    if (['Processing', 'Shipped', 'Delivered'].includes(status) && !order.approvedAt) {
      order.approvedAt = new Date();
    }

    await order.save();

    
    if ((status === 'Delivered' || status === 'Shipped') && previousStatus === 'Processing') {
      for (const item of order.items) {
        const productId = item.productId;
        const quantity = item.quantity || 1;

        
        const product = await Detail.findOne({ id: productId });
        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - quantity);
          product.stock = newStock;
          
          if (newStock === 0) {
            product.productStatus = 'Out of Stock';
          } else if (newStock <= 10) {
            product.productStatus = 'Low Stock';
          } else {
            product.productStatus = 'In Stock';
          }
          await product.save();
        }
      }
    }

    
    if (status === 'Cancelled' && (previousStatus === 'Delivered' || previousStatus === 'Shipped')) {
      for (const item of order.items) {
        const productId = item.productId;
        const quantity = item.quantity || 1;

        const product = await Detail.findOne({ id: productId });
        if (product) {
          const newStock = (product.stock || 0) + quantity;
          product.stock = newStock;
          if (newStock === 0) {
            product.productStatus = 'Out of Stock';
          } else if (newStock <= 10) {
            product.productStatus = 'Low Stock';
          } else {
            product.productStatus = 'In Stock';
          }
          await product.save();
        }
      }
    }

    return res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

// Buyer: Request order cancellation (for non-delivered orders)
router.post('/:orderId/cancel-request', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Cancellation reason is required.' });
    }

    const order = await Order.findOne({ orderId: req.params.orderId, userId: String(userId) });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status === 'Delivered' || order.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Cannot cancel delivered order. Use return request instead.' });
    }
    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
    }
    if (order.cancelRequest?.requested) {
      return res.status(400).json({ success: false, message: 'Cancellation request already pending.' });
    }

    order.cancelRequest = {
      requested: true,
      requestedAt: new Date(),
      reason: reason.trim(),
      status: 'Pending',
    };
    await order.save();

    return res.json({ success: true, message: 'Cancellation request submitted for admin approval.', data: order });
  } catch (error) {
    console.error('Cancel request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit cancellation request.' });
  }
});

// Buyer: Request return (for delivered orders)
router.post('/:orderId/return-request', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Return reason is required.' });
    }

    const order = await Order.findOne({ orderId: req.params.orderId, userId: String(userId) });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Can only request return for delivered orders.' });
    }
    if (order.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Order is already returned.' });
    }
    if (order.returnRequest?.requested) {
      return res.status(400).json({ success: false, message: 'Return request already pending.' });
    }

    order.returnRequest = {
      requested: true,
      requestedAt: new Date(),
      reason: reason.trim(),
      status: 'Pending',
    };
    await order.save();

    return res.json({ success: true, message: 'Return request submitted for admin approval.', data: order });
  } catch (error) {
    console.error('Return request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit return request.' });
  }
});

// Admin: Approve/Reject cancellation request
router.post('/admin/:orderId/cancel-request', authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only Admin accounts can process cancellation requests.' });
    }

    const { orderId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be approve or reject.' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!order.cancelRequest?.requested || order.cancelRequest.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'No pending cancellation request.' });
    }

    if (action === 'approve') {
      const previousStatus = order.status;
      order.status = 'Cancelled';
      order.cancelRequest = { ...order.cancelRequest, status: 'Approved', processedAt: new Date(), processedBy: user.id };

      // Restore stock if order was shipped/delivered
      if (previousStatus === 'Delivered' || previousStatus === 'Shipped') {
        for (const item of order.items) {
          const productId = item.productId;
          const quantity = item.quantity || 1;
          const product = await Detail.findOne({ id: productId });
          if (product) {
            const newStock = (product.stock || 0) + quantity;
            product.stock = newStock;
            if (newStock === 0) product.productStatus = 'Out of Stock';
            else if (newStock <= 10) product.productStatus = 'Low Stock';
            else product.productStatus = 'In Stock';
            await product.save();
          }
        }
      }
    } else {
      order.cancelRequest = { ...order.cancelRequest, status: 'Rejected', processedAt: new Date(), processedBy: user.id };
    }

    await order.save();
    return res.json({ success: true, message: `Cancellation request ${action}d.`, data: order });
  } catch (error) {
    console.error('Process cancel request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process cancellation request.' });
  }
});

// Admin: Approve/Reject return request
router.post('/admin/:orderId/return-request', authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only Admin accounts can process return requests.' });
    }

    const { orderId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be approve or reject.' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!order.returnRequest?.requested || order.returnRequest.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'No pending return request.' });
    }

    if (action === 'approve') {
      order.status = 'Returned';
      order.returnRequest = { ...order.returnRequest, status: 'Approved', processedAt: new Date(), processedBy: user.id };

      // Restore stock for returned items
      for (const item of order.items) {
        const productId = item.productId;
        const quantity = item.quantity || 1;
        const product = await Detail.findOne({ id: productId });
        if (product) {
          const newStock = (product.stock || 0) + quantity;
          product.stock = newStock;
          if (newStock === 0) product.productStatus = 'Out of Stock';
          else if (newStock <= 10) product.productStatus = 'Low Stock';
          else product.productStatus = 'In Stock';
          await product.save();
        }
      }
    } else {
      order.returnRequest = { ...order.returnRequest, status: 'Rejected', processedAt: new Date(), processedBy: user.id };
    }

    await order.save();
    return res.json({ success: true, message: `Return request ${action}d.`, data: order });
  } catch (error) {
    console.error('Process return request error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process return request.' });
  }
});

// Admin: Get single order (admin can view any order)
router.get('/admin/:orderId', authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin accounts can access this order.',
      });
    }

    const order = await Order.findOne({ orderId: req.params.orderId }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Fetch admin order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
});

// Seller: Get orders for seller's products
router.get('/seller/my-orders', authenticateToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req);
    if (!user || user.role !== 'Seller') {
      return res.status(403).json({
        success: false,
        message: 'Only Seller accounts can access seller orders.',
      });
    }

    // Get all product IDs owned by this seller
    const sellerProducts = await Detail.find({ sellerId: user.id }, { id: 1 }).lean();
    const productIds = sellerProducts.map(p => p.id);

    if (productIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Find orders that contain any of these product IDs
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).sort({ createdAt: -1 }).lean();

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Fetch seller orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch seller orders.' });
  }
});

// ── POST /orders  ── place a new order (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const { items, shippingAddress, subtotal, shipping, tax, grandTotal } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }
    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.address) {
      return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    // generate a short readable order ID
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Enrich items with sellerId from Detail collection
    const enrichedItems = [];
    for (const item of items) {
      const productId = item.productId || item.id;
      if (productId) {
        const product = await Detail.findOne({ id: productId });
        if (product) {
          enrichedItems.push({
            ...item,
            sellerId: product.sellerId,
          });
        } else {
          enrichedItems.push(item);
        }
      } else {
        enrichedItems.push(item);
      }
    }

    const order = new Order({
      orderId,
      userId: String(userId),
      items: enrichedItems,
      shippingAddress,
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      tax: tax || 0,
      grandTotal: grandTotal || 0,
      status: 'Pending',
      paymentMethod: 'Card',
    });

    await order.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
});

// ── GET /orders/my  ── fetch all orders for the logged-in user
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const orders = await Order.find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// ── GET /orders/:orderId  ── get single order (authenticated, must belong to user)
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const order = await Order.findOne({ orderId: req.params.orderId, userId: String(userId) }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    return res.json({ success: true, data: order });
  } catch (error) {
    console.error('Fetch order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
});

module.exports = router;
