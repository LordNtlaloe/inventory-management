/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePos } from '@/context/CartContext';
import { MdFileDownload } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import { render } from 'react-thermal-printer';
import Image from 'next/image';
import {
  PaymentDialogProps,
  Order,
  PaymentFormData,
  Receipt
} from '@/lib/types';
import { ReceiptDialog } from './ReceiptDialog';
import { processPaymentAction } from '@/actions/orders.actions';

// Define PaymentMethod locally to avoid import conflicts
type PaymentMethod = 'Cash' | 'Card' | 'Mobile';

// Add SerialPort interface for Web Serial API
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream | null;
  writable: WritableStream | null;
}

// Interface for the server response (what the server actually returns)
interface ServerOrderResponse {
  _id: string;
  order_number: string;
  order_date: string;
  createdAt: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    discount: number;
    subtotal: number;
  }>;
  total_amount: number;
  branch_id: string;
  cashier_id: string;
  payment_method: string;
  amount_received: number;
  change_amount: number;
  payment_reference?: string;
  status: string;
}

export default function PaymentDialog({
  open,
  onClose,
  onSuccess,
  branchId,
  cashierId,
  branchName,
  branchLocation,
  cashierName
}: PaymentDialogProps) {
  const router = useRouter();
  const { cart, calculateTotals, clearCart } = usePos();
  const { subtotal, totalDiscount, total } = calculateTotals();
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountReceived, setAmountReceived] = useState(total.toString());
  const [changeAmount, setChangeAmount] = useState('0.00');
  const [paymentReference, setPaymentReference] = useState('');
  const [processing, setProcessing] = useState(false);
  const [port, setPort] = useState<SerialPort | null>(null);

  useEffect(() => {
    setAmountReceived(total.toString());
  }, [total]);

  const calculateChange = useCallback(() => {
    const received = parseFloat(amountReceived) || 0;
    const change = received - total;
    setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
  }, [amountReceived, total]);

  useEffect(() => {
    calculateChange();
  }, [amountReceived, total, calculateChange]);

  // Function to map server response to Order interface
  const mapServerResponseToOrder = (serverResponse: ServerOrderResponse): Order => {
    // Calculate subtotal from items
    const calculatedSubtotal = serverResponse.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      id: serverResponse._id.toString(),
      order_date: serverResponse.order_date,
      createdAt: serverResponse.createdAt,
      items: serverResponse.items.map(item => ({
        id: `${item.product_id}_${Date.now()}`,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        subtotal: item.subtotal,
        product: {
          product_name: cart.find(cartItem => cartItem.product.id === item.product_id)?.product.product_name || 'Unknown Product'
        }
      })),
      subtotal: calculatedSubtotal,
      total: serverResponse.total_amount,
      branch: {
        name: branchName,
        location: branchLocation
      },
      cashier: {
        name: cashierName
      },
      payment_method: serverResponse.payment_method,
      amount_received: serverResponse.amount_received,
      change_amount: serverResponse.change_amount,
      payment_reference: serverResponse.payment_reference,
      status: serverResponse.status
    };
  };

  // Function to convert Order to Receipt for onSuccess callback
  const mapOrderToReceipt = (order: Order): Receipt => {
    return {
      id: order.id,
      date: new Date(order.order_date),
      items: order.items.map(item => ({
        product_name: item.product.product_name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        discount: item.discount
      })),
      subtotal: order.subtotal,
      total: order.total,
      cashier: order.cashier.name,
      branch: order.branch.name,
      payment_method: order.payment_method,
      amount_received: order.amount_received,
      change_amount: order.change_amount,
      payment_reference: order.payment_reference
    };
  };

  // Prepare payment data for server action
  const preparePaymentData = (): PaymentFormData => {
    const formattedItems = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.product_price,
      discount: item.discount || 0,
      subtotal: (item.product.product_price * item.quantity) - (item.discount || 0)
    }));

    // Map PaymentMethod to the expected union type
    const getPaymentMethodType = (method: PaymentMethod): "mobile" | "cash" | "card" => {
      switch (method) {
        case 'Cash':
          return 'cash';
        case 'Card':
          return 'card';
        case 'Mobile':
          return 'mobile';
        default:
          return 'cash';
      }
    };

    return {
      items: formattedItems,
      total_amount: total,
      branch_id: branchId,
      cashier_id: cashierId,
      payment_method: getPaymentMethodType(paymentMethod),
      amount_received: parseFloat(amountReceived) || total,
      change_amount: parseFloat(changeAmount) || 0,
      payment_reference: paymentReference
    };
  };

  const print_receipt = async () => {
    if (!orderData) {
      console.warn('No order data available for printing');
      return;
    }

    try {
      // Check if Web Serial API is supported
      if (!('serial' in navigator)) {
        console.error('Web Serial API not supported in this browser');
        return;
      }

      const receipt = <ReceiptDialog order={orderData} branchName={branchName} cashierName={cashierName} />;
      const data = await render(receipt);
      let _port = port;

      if (_port == null) {
        // Cast navigator to access serial property to avoid type conflicts
        const navigatorSerial = (navigator as any).serial;
        _port = await navigatorSerial.requestPort();
        if (_port) {
          await _port.open({ baudRate: 9600 });
          setPort(_port);
        } else {
          console.error('Failed to get serial port');
          return;
        }
      }

      // Add null checks for _port and writable
      if (_port && _port.writable) {
        const writer = _port.writable.getWriter();
        if (writer) {
          await writer.write(data);
          writer.releaseLock();
        }
      } else {
        console.error('Serial port or writable stream is not available');
      }
    } catch (error) {
      console.error('Failed to print receipt:', error);
    }
  };

  const handleConfirmPayment = async () => {
    setError('');
    setProcessing(true);

    try {
      if (cart.length === 0) {
        setError('Cart is empty');
        return;
      }

      if (!paymentMethod) {
        setError('Payment method is required');
        return;
      }

      if (paymentMethod === 'Cash' && (!amountReceived || parseFloat(amountReceived) < total)) {
        setError('Amount received must be at least equal to the total');
        return;
      }

      if ((paymentMethod === 'Card' || paymentMethod === 'Mobile') && !paymentReference) {
        setError('Reference number is required for card or mobile payments');
        return;
      }

      const paymentData = preparePaymentData();
      const result = await processPaymentAction(paymentData);

      if (result.success && result.order) {
        const mappedOrder = mapServerResponseToOrder(result.order as unknown as ServerOrderResponse);
        setOrderData(mappedOrder);
        clearCart();

        if (onSuccess) {
          const receiptData = mapOrderToReceipt(mappedOrder);
          onSuccess(receiptData);
        }
        onClose();

        setTimeout(() => {
          print_receipt();
          router.push('/pos');
        }, 500);
      } else {
        throw new Error(result.error || 'Failed to process order');
      }

    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to process order. Please check all fields and try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const paymentMethods: PaymentMethod[] = ['Cash', 'Card', 'Mobile'];

  return (
    <div>
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${open ? '' : 'hidden'}`}>
        <div className="w-80 bg-[#1D1D1D] rounded px-6 pt-8 shadow-lg">
          <div className="flex flex-col justify-center items-center gap-2">
            <Image
              src="/images/TD-Logo.png"
              alt="logo"
              width={64}
              height={64}
              className="py-4"
            />
            <h4 className="font-semibold">{branchName}</h4>
            <p className="text-xs">{branchLocation}</p>
          </div>
          <div className="flex flex-col gap-3 border-b py-6 text-xs">
            <p className="flex justify-between">
              <span className="text-gray-400">Cashier:</span>
              <span>{cashierName}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 py-2 text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="flex">
                  <th className="w-full py-2">Product</th>
                  <th className="min-w-[44px] py-2">QTY</th>
                  <th className="min-w-[44px] py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="flex py-1">
                    <td className="flex-1">{item.product.product_name}</td>
                    <td className="min-w-[44px]">{item.quantity}</td>
                    <td className="min-w-[44px]">M{(item.product.product_price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-b border-dashed mt-2"></div>
            <div className="flex flex-col gap-1 pt-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>M{subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount:</span>
                  <span>-M{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>M{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-dashed mt-2 pt-4">
              <div className="mb-4">
                <label className="block text-sm mb-2">Payment Method</label>
                <div className="flex gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={`flex-1 py-2 px-3 text-center rounded capitalize ${paymentMethod === method ? 'bg-blue-600 text-white' : 'bg-gray-700'
                        }`}
                      onClick={() => handlePaymentMethodChange(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Amount Received</label>
                    <input
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="w-full p-2 bg-gray-800 rounded text-white"
                      min={total}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Change</label>
                    <input
                      type="text"
                      value={changeAmount}
                      readOnly
                      className="w-full p-2 bg-gray-800 rounded text-white"
                    />
                  </div>
                </div>
              )}

              {(paymentMethod === 'Card' || paymentMethod === 'Mobile') && (
                <div>
                  <label className="block text-sm mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full p-2 bg-gray-800 rounded text-white"
                    placeholder="Transaction ID / Reference"
                    required
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={processing}
                  className="flex items-center gap-2"
                >
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <><MdFileDownload /> Confirm & Save PDF</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}