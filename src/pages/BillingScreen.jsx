import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FaSearch, FaPlus, FaMinus, FaTrash, FaEdit, FaRupeeSign, FaUser, FaPhoneAlt, FaCheckCircle, FaTimes, FaCalculator, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BillingScreen = () => {
  const {
    activeProducts,
    sales,
    addSale,
    updateSale,
    deleteSale
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // All, Food, Supplement, Frequent, Recent

  // Form state
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('UPI'); // Default to UPI
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcExpression, setCalcExpression] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const handleCalcButtonClick = (val) => {
    if (val === '=') {
      try {
        const sanitized = calcExpression.replace(/[^0-9+\-*/().]/g, '');
        if (sanitized) {
          const res = Function('"use strict";return (' + sanitized + ')')();
          setCalcResult(String(res));
        }
      } catch (e) {
        setCalcResult('Error');
      }
    } else if (val === 'C') {
      setCalcExpression('');
      setCalcResult('');
    } else if (val === '⌫') {
      setCalcExpression(prev => prev.slice(0, -1));
    } else {
      setCalcExpression(prev => prev + val);
    }
  };

  // Editing Sale state (Modal)
  const [editingSale, setEditingSale] = useState(null);

  // Compute Frequently Sold and Recently Sold dynamically from sales data
  const frequentProducts = useMemo(() => {
    if (!sales || sales.length === 0) {
      // Fallback: Return first few active products
      return activeProducts.slice(0, 6);
    }
    const counts = {};
    sales.forEach(sale => {
      counts[sale.productId] = (counts[sale.productId] || 0) + 1;
    });
    const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const freqList = sortedIds
      .map(id => activeProducts.find(p => p._id === id))
      .filter(Boolean);
    return freqList.length > 0 ? freqList.slice(0, 8) : activeProducts.slice(0, 6);
  }, [sales, activeProducts]);

  const recentProducts = useMemo(() => {
    if (!sales || sales.length === 0) {
      return activeProducts.slice(0, 4);
    }
    const recentIds = [];
    sales.forEach(sale => {
      if (!recentIds.includes(sale.productId)) {
        recentIds.push(sale.productId);
      }
    });
    const recentList = recentIds
      .map(id => activeProducts.find(p => p._id === id))
      .filter(Boolean);
    return recentList.length > 0 ? recentList.slice(0, 8) : activeProducts.slice(0, 4);
  }, [sales, activeProducts]);

  // Filtered products list for display
  const displayedProducts = useMemo(() => {
    let list = [];
    if (selectedCategory === 'All') {
      list = activeProducts;
    } else if (selectedCategory === 'Food') {
      list = activeProducts.filter(p => p.category === 'Food');
    } else if (selectedCategory === 'Supplement') {
      list = activeProducts.filter(p => p.category === 'Supplement');
    } else if (selectedCategory === 'Frequent') {
      list = frequentProducts;
    } else if (selectedCategory === 'Recent') {
      list = recentProducts;
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    return list;
  }, [selectedCategory, searchQuery, activeProducts, frequentProducts, recentProducts]);

  // Add product to cart helper
  const handleAddToCart = (product) => {
    if (product.category === 'Food') {
      const existingIdx = cart.findIndex(item => item.productId === product._id);
      if (existingIdx > -1) {
        const newCart = [...cart];
        newCart[existingIdx].quantity += 1;
        setCart(newCart);
        toast.success(`Incremented quantity for ${product.name}`);
      } else {
        const newItem = {
          cartId: Date.now() + Math.random().toString(36).substr(2, 9),
          productId: product._id,
          productName: product.name,
          category: product.category,
          quantity: 1,
          unitPrice: product.price,
          discount: 0,
          packSize: '',
          flavor: '',
          productRef: product
        };
        setCart([...cart, newItem]);
        toast.success(`Added ${product.name} to billing`);
      }
    } else {
      // Supplement
      const defaultSize = product.packSizes && product.packSizes.length > 0 ? product.packSizes[0].size : '';
      const defaultPrice = product.packSizes && product.packSizes.length > 0 ? product.packSizes[0].price : product.price;
      const defaultFlavor = product.flavors && product.flavors.length > 0 ? product.flavors[0] : '';

      // Check if same product, pack size and flavor is already in cart
      const existingIdx = cart.findIndex(item =>
        item.productId === product._id &&
        item.packSize === defaultSize &&
        item.flavor === defaultFlavor
      );

      if (existingIdx > -1) {
        const newCart = [...cart];
        newCart[existingIdx].quantity += 1;
        setCart(newCart);
        toast.success(`Incremented quantity for ${product.name}`);
      } else {
        const newItem = {
          cartId: Date.now() + Math.random().toString(36).substr(2, 9),
          productId: product._id,
          productName: product.name,
          category: product.category,
          quantity: 1,
          unitPrice: defaultPrice,
          discount: 0,
          packSize: defaultSize,
          flavor: defaultFlavor,
          productRef: product
        };
        setCart([...cart, newItem]);
        toast.success(`Added ${product.name} to billing`);
      }
    }
  };

  // Remove from cart
  const handleRemoveFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  // Update item quantity
  const handleUpdateCartItemQuantity = (cartId, qty) => {
    const val = Math.max(1, qty);
    setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: val } : item));
  };

  // Update item price
  const handleUpdateCartItemPrice = (cartId, price) => {
    const val = Math.max(0, price);
    setCart(cart.map(item => item.cartId === cartId ? { ...item, unitPrice: val } : item));
  };

  // Update item discount
  const handleUpdateCartItemDiscount = (cartId, discount) => {
    const val = Math.max(0, discount);
    setCart(cart.map(item => item.cartId === cartId ? { ...item, discount: val } : item));
  };

  // Update item pack size
  const handleUpdateCartItemPackSize = (cartId, size) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        let updatedPrice = item.unitPrice;
        if (item.productRef && item.productRef.packSizes) {
          const match = item.productRef.packSizes.find(s => s.size === size);
          if (match) {
            updatedPrice = match.price;
          }
        }
        return { ...item, packSize: size, unitPrice: updatedPrice };
      }
      return item;
    }));
  };

  // Update item flavor
  const handleUpdateCartItemFlavor = (cartId, flavor) => {
    setCart(cart.map(item => item.cartId === cartId ? { ...item, flavor } : item));
  };

  // Calculate cart total
  const cartTotalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity - (item.discount || 0)), 0);
  }, [cart]);

  // Calculate specific product quantities in cart for display badges
  const getCartItemCount = (productId) => {
    return cart
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Submit checkout handler
  const handleAddSale = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Cart is empty. Please select products first');
      return;
    }

    const salesPayload = cart.map(item => ({
      productId: item.productId,
      productName: item.productName,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      paymentMode,
      customerName,
      phone,
      packSize: item.packSize,
      flavor: item.flavor,
      date: transactionDate
    }));

    const success = await addSale(salesPayload);
    if (success) {
      // Clear form
      setCart([]);
      setCustomerName('');
      setPhone('');
    }
  };

  // Edit Sale modal save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const success = await updateSale(editingSale._id, {
      quantity: editingSale.quantity,
      unitPrice: editingSale.unitPrice,
      discount: editingSale.discount || 0,
      paymentMode: editingSale.paymentMode,
      customerName: editingSale.customerName,
      phone: editingSale.phone,
      packSize: editingSale.packSize,
      flavor: editingSale.flavor
    });
    if (success) {
      setEditingSale(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Billing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Product Search & Quick Grid (Col-Span 7) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-7 space-y-4 text-primaryTxt">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-primaryTxt">Menu & Quick Tap</h3>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mutedTxt">
                <FaSearch className="text-xs" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items by name..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-primaryTxt"
              />
            </div>
          </div>

          {/* Categories Tab Selector */}
          <div className="flex flex-wrap gap-1.5 border-b border-borderCol pb-3">
            {['All', 'Food', 'Supplement', 'Frequent', 'Recent'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${selectedCategory === cat
                  ? 'bg-emeraldGreen text-whiteBg shadow-md shadow-emeraldGreen/15'
                  : 'text-secondaryTxt bg-whiteBg hover:bg-lightgraySec border border-borderCol'
                  }`}
              >
                {cat === 'Supplement' ? 'Supplements' : cat === 'Frequent' ? 'Popular' : cat === 'Recent' ? 'Recent' : cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((p) => {
                const inCartQty = getCartItemCount(p._id);
                const isFood = p.category === 'Food';
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    className={`p-3.5 rounded-2xl flex flex-col justify-between text-left border transition-all duration-200 min-h-[105px] relative group ${inCartQty > 0
                      ? isFood
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300 shadow-sm'
                        : 'bg-purple-50 border-purple-300 ring-1 ring-purple-300 shadow-sm'
                      : isFood
                        ? 'bg-emerald-50/15 border-emerald-100/50 hover:bg-emerald-50/40 hover:border-emerald-300'
                        : 'bg-purple-50/15 border-purple-100/50 hover:bg-purple-50/40 hover:border-purple-300'
                      }`}
                  >
                    {/* Cart Item Quantity Indicator Badge */}
                    {inCartQty > 0 && (
                      <span className={`absolute top-2.5 right-2.5 flex items-center justify-center text-[10px] font-black w-5 h-5 rounded-full shadow-sm animate-scaleIn ${isFood
                        ? 'bg-emeraldGreen text-white'
                        : 'bg-purple-650 text-white'
                        }`}>
                        {inCartQty}
                      </span>
                    )}

                    <div className="space-y-1 pr-6">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isFood
                        ? 'bg-emerald-100/70 text-emerald-800'
                        : 'bg-purple-100/70 text-purple-800'
                        }`}>
                        {p.category}
                      </span>
                      <h4 className="text-xs font-bold text-primaryTxt line-clamp-2 mt-1.5 leading-snug">
                        {p.name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-borderCol/40">
                      <span className="text-xs font-black text-primaryTxt">
                        ₹{p.price}{p.category === 'Supplement' && '+'}
                      </span>
                      <span className={`text-[10px] font-bold transition-colors ${isFood ? 'text-emeraldGreen' : 'text-purple-650'
                        }`}>
                        Add +
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-secondaryTxt text-sm">
                No items found matching the filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Billing Form (Col-Span 5) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-5 text-primaryTxt flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex justify-between items-center border-b border-borderCol pb-3 mb-4">
              <h3 className="text-base font-extrabold text-primaryTxt">
                Billing Sheet
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-[10px] text-red-500 font-extrabold hover:underline"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            <form onSubmit={handleAddSale} className="space-y-4">
              {/* Cart List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {cart.length > 0 ? (
                  cart.map((item) => {
                    const product = item.productRef;
                    const isFood = item.category === 'Food';
                    return (
                      <div
                        key={item.cartId}
                        className={`p-3 rounded-2xl border transition-all duration-150 ${isFood
                          ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-300'
                          : 'bg-purple-50/20 border-purple-100 hover:border-purple-300'
                          } flex flex-col space-y-2`}
                      >
                        {/* Name & Tag */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wide ${isFood
                              ? 'bg-emerald-100/70 text-emerald-800'
                              : 'bg-purple-100/70 text-purple-800'
                              }`}>
                              {item.category}
                            </span>
                            <h4 className="text-xs font-extrabold text-primaryTxt leading-tight mt-1">{item.productName}</h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.cartId)}
                            className="text-secondaryTxt hover:text-red-500 p-1"
                            title="Remove item"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>

                        {/* Options: Variant Selector, Price inputs, Qty selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-borderCol/50 items-end">
                          {/* Variant selection for supplements */}
                          {!isFood && (
                            <div className="flex flex-col space-y-1.5 sm:col-span-1">
                              {product.packSizes && product.packSizes.length > 0 && (
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-secondaryTxt font-bold uppercase tracking-wider block">Size</span>
                                  <select
                                    value={item.packSize}
                                    onChange={(e) => handleUpdateCartItemPackSize(item.cartId, e.target.value)}
                                    className="w-full bg-whiteBg border border-borderCol rounded-lg text-[10px] py-1 px-1.5 text-primaryTxt font-bold"
                                  >
                                    {product.packSizes.map((s) => (
                                      <option key={s.size} value={s.size}>
                                        {s.size}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {product.flavors && product.flavors.length > 0 && (
                                <div className="space-y-0.5">
                                  <span className="text-[8px] text-secondaryTxt font-bold uppercase tracking-wider block">Flavor</span>
                                  <select
                                    value={item.flavor}
                                    onChange={(e) => handleUpdateCartItemFlavor(item.cartId, e.target.value)}
                                    className="w-full bg-whiteBg border border-borderCol rounded-lg text-[10px] py-1 px-1.5 text-primaryTxt font-bold"
                                  >
                                    {product.flavors.map((f) => (
                                      <option key={f} value={f}>
                                        {f}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Editable unit price, discount and quantity selector */}
                          <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                            {/* Editable Price */}
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-secondaryTxt font-bold uppercase block tracking-wider">Price (₹)</span>
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateCartItemPrice(item.cartId, Number(e.target.value))}
                                className="w-full bg-whiteBg border border-borderCol rounded-lg text-[10px] py-1 px-1 text-primaryTxt font-bold"
                              />
                            </div>

                            {/* Discount Input Box */}
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-secondaryTxt font-bold uppercase block tracking-wider">Disc (₹)</span>
                              <input
                                type="number"
                                min="0"
                                value={item.discount || 0}
                                onChange={(e) => handleUpdateCartItemDiscount(item.cartId, Number(e.target.value))}
                                className="w-full bg-whiteBg border border-borderCol rounded-lg text-[10px] py-1 px-1 text-primaryTxt font-bold"
                              />
                            </div>

                            {/* Qty incrementors */}
                            <div className="space-y-0.5">
                              <span className="text-[8px] text-secondaryTxt font-bold uppercase block tracking-wider">Qty</span>
                              <div className="flex items-center bg-whiteBg border border-borderCol rounded-lg overflow-hidden h-[26px]">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartItemQuantity(item.cartId, item.quantity - 1)}
                                  className="px-1 text-secondaryTxt hover:text-primaryTxt"
                                >
                                  <FaMinus className="text-[8px]" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateCartItemQuantity(item.cartId, parseInt(e.target.value) || 1)}
                                  className="w-full bg-transparent border-0 text-center text-[10px] py-0.5 font-bold focus:ring-0 focus:outline-none text-primaryTxt"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartItemQuantity(item.cartId, item.quantity + 1)}
                                  className="px-1 text-secondaryTxt hover:text-primaryTxt"
                                >
                                  <FaPlus className="text-[8px]" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Line total summary */}
                          {isFood && <div className="hidden sm:block"></div>}
                          <div className="flex flex-col justify-end items-end text-right sm:col-span-1">
                            <span className="text-[8px] text-secondaryTxt font-bold uppercase tracking-wider block">Line Total</span>
                            <span className="text-xs font-black text-primaryTxt">
                              ₹{((item.unitPrice * item.quantity) - (item.discount || 0)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-lightgraySec/40 py-12 rounded-2xl border border-dashed border-borderCol text-center text-secondaryTxt text-xs flex flex-col items-center justify-center space-y-1.5">
                    <span>👈 Tap menu items on the left grid</span>
                    <span>to assemble your checkout cart</span>
                  </div>
                )}
              </div>

              {/* Total Cart Summary Block */}
              {cart.length > 0 && (
                <div className="bg-lightgraySec/85 p-3 rounded-2xl border border-borderCol/60 flex justify-between items-center shadow-sm">
                  <span className="text-xs text-secondaryTxt font-bold uppercase tracking-wider">Cart Total Amount</span>
                  <span className="text-lg font-black text-emeraldGreen">
                    ₹{cartTotalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Back-Dating Selector */}
              <div className="border-t border-borderCol pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                    Transaction Date
                  </span>

                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mutedTxt">
                    <FaCalendarAlt className="text-[10px]" />
                  </span>
                  <input
                    type="date"
                    required
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-primaryTxt font-semibold"
                  />
                </div>
              </div>

              {/* Customer Details Section */}
              <div className="border-t border-borderCol pt-3 space-y-2">
                <span className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">
                  Customer Details (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mutedTxt">
                      <FaUser className="text-[10px]" />
                    </span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer Name"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-primaryTxt"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mutedTxt">
                      <FaPhoneAlt className="text-[10px]" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-primaryTxt"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="border-t border-borderCol pt-3 space-y-2">
                <span className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                  Payment Mode
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {['UPI', 'Cash', 'Card', 'Other'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${paymentMode === mode
                        ? 'bg-emeraldGreen text-whiteBg shadow-md shadow-emeraldGreen/10'
                        : 'text-secondaryTxt bg-whiteBg hover:bg-lightgraySec border border-borderCol'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Checkout Button */}
              <button
                type="submit"
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${cart.length > 0
                  ? 'bg-emeraldGreen hover:bg-emeraldGreenHover text-whiteBg shadow-lg shadow-emeraldGreen/15'
                  : 'bg-lightgraySec text-mutedTxt cursor-not-allowed border border-borderCol'
                  }`}
              >
                <FaCheckCircle className="text-base" />
                <span>RECORD SALE</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Today's Sales Table Listing below */}
      <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm space-y-4 text-primaryTxt">
        <div>
          <h3 className="text-base font-extrabold text-primaryTxt">Today's Transactions</h3>
          <p className="text-xs text-secondaryTxt">List of sales recorded today (newest first)</p>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto w-full -mx-5 px-5 sm:mx-0 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[700px] text-xs">
            <thead>
              <tr className="border-b border-borderCol text-secondaryTxt font-semibold bg-lightgraySec/50">
                <th className="py-3 px-3 w-12 text-center">S.No</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Discount</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Payment</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-3 text-center">Time</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderCol/60">
              {sales.length > 0 ? (
                sales.map((sale, idx) => (
                  <tr key={sale._id} className="hover:bg-lightgraySec/30 text-primaryTxt">
                    <td className="py-3 px-3 text-center text-secondaryTxt">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-primaryTxt">{sale.productName}</div>
                      {sale.category === 'Supplement' && (
                        <div className="text-[10px] text-purple-650 font-bold">
                          {sale.packSize} • {sale.flavor}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${sale.category === 'Supplement'
                        ? 'bg-purple-50 text-purple-650'
                        : 'bg-emerald-50 text-emeraldGreen'
                        }`}>
                        {sale.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-primaryTxt">{sale.quantity}</td>
                    <td className="py-3 px-3 text-right font-medium">₹{sale.unitPrice}</td>
                    <td className="py-3 px-3 text-right font-medium text-red-500">₹{sale.discount || 0}</td>
                    <td className="py-3 px-3 text-right font-bold text-primaryTxt">₹{sale.totalAmount}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-whiteBg border border-borderCol text-secondaryTxt">
                        {sale.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sale.customerName ? (
                        <div>
                          <div className="font-semibold text-secondaryTxt">{sale.customerName}</div>
                          {sale.phone && <div className="text-[10px] text-mutedTxt">{sale.phone}</div>}
                        </div>
                      ) : (
                        <span className="text-mutedTxt font-medium italic">Walk-in</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-secondaryTxt">{sale.time}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setEditingSale(sale)}
                          className="p-1.5 bg-lightgraySec hover:bg-emeraldGreen hover:text-whiteBg rounded-lg text-secondaryTxt transition-colors border border-borderCol/40"
                          title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this transaction record?')) {
                              deleteSale(sale._id);
                            }
                          }}
                          className="p-1.5 bg-lightgraySec hover:bg-red-500 hover:text-white rounded-lg text-secondaryTxt transition-colors border border-borderCol/40"
                          title="Delete"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-mutedTxt text-xs">
                    No sales recorded today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Sale Modal */}
      {editingSale && (
        <div className="fixed inset-0 z-50 bg-darknavy/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cardBg border border-borderCol rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-primaryTxt">
            <button
              onClick={() => setEditingSale(null)}
              className="absolute top-4 right-4 text-secondaryTxt hover:text-primaryTxt"
            >
              <FaTimes />
            </button>

            <h4 className="text-base font-extrabold text-primaryTxt border-b border-borderCol pb-3 mb-4">
              Edit Transaction Record
            </h4>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="bg-lightgraySec p-3 rounded-2xl border border-borderCol text-xs">
                <span className="text-[10px] text-secondaryTxt font-bold uppercase block">Product Name</span>
                <span className="font-extrabold text-primaryTxt">{editingSale.productName}</span>
                {editingSale.category === 'Supplement' && (
                  <div className="text-[10px] text-purple-650 font-bold mt-0.5">
                    {editingSale.packSize} • {editingSale.flavor}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-semibold uppercase tracking-wider">Quantity</label>
                <div className="flex items-center bg-whiteBg border border-borderCol rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setEditingSale(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                    className="px-3 py-2 text-secondaryTxt"
                  >
                    <FaMinus className="text-[10px]" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={editingSale.quantity}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setEditingSale(prev => ({ ...prev, quantity: val }));
                    }}
                    className="w-full bg-transparent border-0 text-center text-xs py-1.5 px-1 font-bold text-primaryTxt focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingSale(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                    className="px-3 py-2 text-secondaryTxt"
                  >
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
              </div>

              {/* Unit Price & Discount side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-secondaryTxt font-semibold uppercase tracking-wider">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={editingSale.unitPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingSale(prev => ({ ...prev, unitPrice: val }));
                    }}
                    className="w-full bg-whiteBg border border-borderCol rounded-xl text-xs py-2 px-3 text-primaryTxt font-bold focus:border-emeraldGreen"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-secondaryTxt font-semibold uppercase tracking-wider">Discount (₹)</label>
                  <input
                    type="number"
                    value={editingSale.discount || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingSale(prev => ({ ...prev, discount: val }));
                    }}
                    className="w-full bg-whiteBg border border-borderCol rounded-xl text-xs py-2 px-3 text-primaryTxt font-bold focus:border-emeraldGreen"
                  />
                </div>
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-semibold uppercase tracking-wider">Customer Name</label>
                <input
                  type="text"
                  value={editingSale.customerName || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingSale(prev => ({ ...prev, customerName: val }));
                  }}
                  className="w-full bg-whiteBg border border-borderCol rounded-xl text-xs py-2 px-3 text-primaryTxt focus:border-emeraldGreen"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-semibold uppercase tracking-wider">Phone</label>
                <input
                  type="text"
                  value={editingSale.phone || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingSale(prev => ({ ...prev, phone: val }));
                  }}
                  className="w-full bg-whiteBg border border-borderCol rounded-xl text-xs py-2 px-3 text-primaryTxt focus:border-emeraldGreen"
                />
              </div>

              {/* Payment Mode */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-semibold uppercase tracking-wider">Payment Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {['UPI', 'Cash', 'Card', 'Other'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEditingSale(prev => ({ ...prev, paymentMode: mode }))}
                      className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 ${editingSale.paymentMode === mode
                        ? 'bg-emeraldGreen text-whiteBg shadow-md'
                        : 'text-secondaryTxt bg-whiteBg border border-borderCol hover:bg-lightgraySec'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save & Cancel Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="w-1/2 py-2.5 bg-lightgraySec hover:bg-borderCol text-xs font-bold rounded-xl text-secondaryTxt border border-borderCol"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emeraldGreen hover:bg-emeraldGreenHover text-xs font-black rounded-xl text-whiteBg shadow-md shadow-emeraldGreen/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Calculator Toggle Button */}
      <button
        type="button"
        onClick={() => setShowCalculator(!showCalculator)}
        className="fixed bottom-20 right-6 md:bottom-6 md:right-6 z-50 bg-emeraldGreen hover:bg-emeraldGreenHover text-white p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 border border-emerald-400"
        title="Open Calculator"
      >
        <FaCalculator className="text-xl" />
      </button>

      {/* Calculator Widget Card */}
      {showCalculator && (
        <div className="fixed bottom-36 right-6 md:bottom-22 md:right-6 z-50 bg-darknavy/95 border border-slate-800 rounded-3xl p-4 shadow-2xl w-64 text-white animate-scaleIn glass">
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-emeraldGreen">Quick POS Calculator</span>
            <button
              type="button"
              onClick={() => setShowCalculator(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          {/* Display Screen */}
          <div className="bg-slate-900/90 border border-slate-850 p-2.5 rounded-2xl mb-3 text-right">
            <div className="text-[10px] text-slate-400 font-bold min-h-[14px] overflow-hidden whitespace-nowrap overflow-ellipsis">{calcExpression || '0'}</div>
            <div className="text-lg font-black text-emeraldGreen min-h-[28px] overflow-hidden whitespace-nowrap overflow-ellipsis">{calcResult || '0'}</div>
          </div>
          {/* Grid of buttons */}
          <div className="grid grid-cols-4 gap-1.5 text-xs font-extrabold">
            {[
              'C', '⌫', '.', '/',
              '7', '8', '9', '*',
              '4', '5', '6', '-',
              '1', '2', '3', '+',
              '0', '(', ')', '='
            ].map((btn) => {
              const isOperator = ['/', '*', '-', '+', '='].includes(btn);
              const isClear = ['C', '⌫'].includes(btn);
              return (
                <button
                  key={btn}
                  type="button"
                  onClick={() => handleCalcButtonClick(btn)}
                  className={`p-2.5 rounded-xl transition-all ${btn === '='
                      ? 'bg-emeraldGreen text-darknavy hover:bg-emeraldGreenHover font-black text-sm'
                      : isOperator
                        ? 'bg-slate-800 hover:bg-slate-700 text-emeraldGreen'
                        : isClear
                          ? 'bg-slate-850 hover:bg-slate-800 text-red-400'
                          : 'bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white'
                    }`}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingScreen;
