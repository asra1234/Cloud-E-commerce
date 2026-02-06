/**
 * @file saga.js
 * @description Saga Pattern Implementation for Distributed Transactions
 * 
 * Ensures data consistency across microservices using compensating transactions
 * Implements the Saga orchestration pattern for complex workflows
 * 
 * Key Concepts:
 * - Each step can succeed or fail
 * - If any step fails, compensating transactions rollback previous steps
 * - Maintains eventual consistency across distributed system
 */

const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

const SAGA_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  COMPENSATING: 'COMPENSATING',
  COMPENSATED: 'COMPENSATED'
};

let eventBridgeClient;

/**
 * Get EventBridge client (lazy initialization)
 */
function getEventBridgeClient() {
  if (!eventBridgeClient) {
    eventBridgeClient = new EventBridgeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }
  return eventBridgeClient;
}

/**
 * Saga Orchestrator
 * Manages the execution of saga steps and compensation
 */
class SagaOrchestrator {
  constructor(sagaName, steps = []) {
    this.sagaName = sagaName;
    this.steps = steps;
    this.executedSteps = [];
    this.status = SAGA_STATUS.PENDING;
    this.context = {};
    this.error = null;
  }

  /**
   * Add a step to the saga
   * @param {string} name - Step name
   * @param {Function} action - Function to execute
   * @param {Function} compensation - Compensating function (rollback)
   */
  addStep(name, action, compensation) {
    this.steps.push({ name, action, compensation });
    return this;
  }

  /**
   * Execute the saga
   * @param {object} initialContext - Initial context data
   * @returns {Promise<object>} Saga result
   */
  async execute(initialContext = {}) {
    this.context = { ...initialContext };
    this.status = SAGA_STATUS.IN_PROGRESS;

    console.log(`[SAGA] Starting saga: ${this.sagaName}`);

    try {
      // Execute all steps sequentially
      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        console.log(`[SAGA] Executing step ${i + 1}/${this.steps.length}: ${step.name}`);

        try {
          // Execute step action
          const result = await step.action(this.context);
          
          // Store step result in context
          this.context[step.name] = result;
          
          // Track executed steps for potential compensation
          this.executedSteps.push(step);

          console.log(`[SAGA] Step ${step.name} completed successfully`);
        } catch (stepError) {
          console.error(`[SAGA] Step ${step.name} failed:`, stepError.message);
          this.error = stepError;
          
          // Trigger compensation for all executed steps
          await this.compensate();
          
          throw new Error(`Saga ${this.sagaName} failed at step ${step.name}: ${stepError.message}`);
        }
      }

      this.status = SAGA_STATUS.COMPLETED;
      console.log(`[SAGA] Saga ${this.sagaName} completed successfully`);

      // Publish saga completion event
      await this.publishEvent('saga.completed', {
        sagaName: this.sagaName,
        context: this.context
      });

      return {
        status: SAGA_STATUS.COMPLETED,
        context: this.context
      };
    } catch (error) {
      this.status = SAGA_STATUS.FAILED;
      console.error(`[SAGA] Saga ${this.sagaName} failed:`, error.message);
      
      return {
        status: SAGA_STATUS.FAILED,
        error: error.message,
        context: this.context
      };
    }
  }

  /**
   * Compensate (rollback) all executed steps
   */
  async compensate() {
    this.status = SAGA_STATUS.COMPENSATING;
    console.log(`[SAGA] Starting compensation for ${this.executedSteps.length} steps`);

    // Execute compensations in reverse order
    for (let i = this.executedSteps.length - 1; i >= 0; i--) {
      const step = this.executedSteps[i];
      
      if (step.compensation) {
        console.log(`[SAGA] Compensating step: ${step.name}`);
        
        try {
          await step.compensation(this.context);
          console.log(`[SAGA] Compensation for ${step.name} completed`);
        } catch (compensationError) {
          console.error(`[SAGA] Compensation failed for ${step.name}:`, compensationError.message);
          // Log compensation failure but continue with other compensations
        }
      } else {
        console.warn(`[SAGA] No compensation defined for step: ${step.name}`);
      }
    }

    this.status = SAGA_STATUS.COMPENSATED;
    console.log(`[SAGA] Compensation completed for saga: ${this.sagaName}`);

    // Publish saga compensation event
    await this.publishEvent('saga.compensated', {
      sagaName: this.sagaName,
      error: this.error?.message,
      context: this.context
    });
  }

  /**
   * Publish saga event to EventBridge
   */
  async publishEvent(detailType, detail) {
    try {
      const client = getEventBridgeClient();
      const command = new PutEventsCommand({
        Entries: [{
          Source: 'cloudretail.saga',
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: process.env.EVENT_BUS_NAME || 'default'
        }]
      });

      await client.send(command);
      console.log(`[SAGA] Event published: ${detailType}`);
    } catch (error) {
      console.error(`[SAGA] Failed to publish event:`, error.message);
      // Don't throw - event publishing failure shouldn't break saga
    }
  }
}

/**
 * Create Order Saga
 * Orchestrates: Order Creation → Inventory Deduction → Payment Processing
 * 
 * @param {object} orderData - Order details
 * @param {object} dependencies - Service dependencies (pools, clients, etc.)
 * @returns {Promise<object>} Saga result
 */
async function createOrderSaga(orderData, dependencies) {
  const { pool, userId, items, totalAmount } = orderData;
  const saga = new SagaOrchestrator('CreateOrder');

  // Step 1: Reserve Inventory
  saga.addStep(
    'reserveInventory',
    async (ctx) => {
      console.log('[SAGA] Step 1: Reserving inventory');
      const reservations = [];

      for (const item of items) {
        const [inventory] = await pool.query(
          'SELECT quantity FROM inventory WHERE product_id = ? FOR UPDATE',
          [item.product_id]
        );

        if (!inventory.length || inventory[0].quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.product_id}`);
        }

        // Reserve inventory
        await pool.query(
          'UPDATE inventory SET quantity = quantity - ?, reserved = reserved + ? WHERE product_id = ?',
          [item.quantity, item.quantity, item.product_id]
        );

        reservations.push({ product_id: item.product_id, quantity: item.quantity });
      }

      return { reservations };
    },
    // Compensation: Release reserved inventory
    async (ctx) => {
      console.log('[SAGA] Compensating: Releasing inventory');
      const { reservations } = ctx.reserveInventory;

      for (const reservation of reservations) {
        await pool.query(
          'UPDATE inventory SET quantity = quantity + ?, reserved = reserved - ? WHERE product_id = ?',
          [reservation.quantity, reservation.quantity, reservation.product_id]
        ).catch(err => {
          console.error('Failed to release inventory:', err.message);
        });
      }
    }
  );

  // Step 2: Create Order Record
  saga.addStep(
    'createOrder',
    async (ctx) => {
      console.log('[SAGA] Step 2: Creating order record');
      
      const [result] = await pool.query(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [userId, totalAmount, 'pending']
      );

      const orderId = result.insertId;

      // Create order items
      for (const item of items) {
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      return { orderId };
    },
    // Compensation: Delete order record
    async (ctx) => {
      console.log('[SAGA] Compensating: Deleting order');
      const { orderId } = ctx.createOrder;

      if (orderId) {
        await pool.query('DELETE FROM order_items WHERE order_id = ?', [orderId])
          .catch(err => console.error('Failed to delete order items:', err.message));
        
        await pool.query('DELETE FROM orders WHERE id = ?', [orderId])
          .catch(err => console.error('Failed to delete order:', err.message));
      }
    }
  );

  // Step 3: Commit Inventory (move from reserved to sold)
  saga.addStep(
    'commitInventory',
    async (ctx) => {
      console.log('[SAGA] Step 3: Committing inventory');
      const { reservations } = ctx.reserveInventory;

      for (const reservation of reservations) {
        await pool.query(
          'UPDATE inventory SET reserved = reserved - ? WHERE product_id = ?',
          [reservation.quantity, reservation.product_id]
        );
      }

      return { committed: true };
    },
    // Compensation: No-op (already compensated in step 1)
    async (ctx) => {
      console.log('[SAGA] Compensating: Inventory already released in step 1');
    }
  );

  // Step 4: Update Order Status
  saga.addStep(
    'updateOrderStatus',
    async (ctx) => {
      console.log('[SAGA] Step 4: Updating order status to confirmed');
      const { orderId } = ctx.createOrder;

      await pool.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['confirmed', orderId]
      );

      return { status: 'confirmed' };
    },
    // Compensation: Update order status to cancelled
    async (ctx) => {
      console.log('[SAGA] Compensating: Marking order as cancelled');
      const { orderId } = ctx.createOrder;

      if (orderId) {
        await pool.query(
          'UPDATE orders SET status = ? WHERE id = ?',
          ['cancelled', orderId]
        ).catch(err => console.error('Failed to cancel order:', err.message));
      }
    }
  );

  // Execute the saga
  return await saga.execute({ pool, userId, items, totalAmount });
}

/**
 * Idempotency key manager
 * Ensures operations are idempotent (can be retried safely)
 */
class IdempotencyManager {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Check if operation with this key has already been processed
   * @param {string} idempotencyKey - Unique operation key
   * @returns {Promise<object|null>} Previous result or null
   */
  async checkIdempotency(idempotencyKey) {
    try {
      const [rows] = await this.pool.query(
        'SELECT result, created_at FROM idempotency_keys WHERE key_value = ?',
        [idempotencyKey]
      );

      if (rows.length > 0) {
        console.log(`[IDEMPOTENCY] Found existing result for key: ${idempotencyKey}`);
        return JSON.parse(rows[0].result);
      }

      return null;
    } catch (error) {
      console.warn('[IDEMPOTENCY] Table not available, skipping check');
      return null;
    }
  }

  /**
   * Store operation result with idempotency key
   * @param {string} idempotencyKey - Unique operation key
   * @param {object} result - Operation result
   */
  async storeResult(idempotencyKey, result) {
    try {
      await this.pool.query(
        `INSERT INTO idempotency_keys (key_value, result, created_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE result = VALUES(result)`,
        [idempotencyKey, JSON.stringify(result)]
      );

      console.log(`[IDEMPOTENCY] Stored result for key: ${idempotencyKey}`);
    } catch (error) {
      console.warn('[IDEMPOTENCY] Failed to store result:', error.message);
    }
  }
}

module.exports = {
  SagaOrchestrator,
  createOrderSaga,
  IdempotencyManager,
  SAGA_STATUS
};
