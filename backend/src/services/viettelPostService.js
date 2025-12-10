import axios from 'axios';

const VIETTEL_POST_API = {
    production: 'https://partner.viettelpost.vn/v2',
    development: 'https://partnerdev.viettelpost.vn/v2'
};

// Get base URL based on environment
const getBaseUrl = () => {
    return process.env.NODE_ENV === 'production'
        ? VIETTEL_POST_API.production
        : VIETTEL_POST_API.production; // Using production for now, can switch to dev for testing
};

// Status mapping from Viettel Post to our system
export const VTP_STATUS_MAP = {
    // Chờ lấy hàng
    100: { status: 'shipping', label: 'Đã tiếp nhận' },
    101: { status: 'shipping', label: 'Đang lấy hàng' },
    102: { status: 'shipping', label: 'Đã lấy hàng' },

    // Đang vận chuyển
    103: { status: 'shipping', label: 'Đang vận chuyển' },
    104: { status: 'shipping', label: 'Đang giao hàng' },
    105: { status: 'shipping', label: 'Chuyển hoàn' },

    // Phát thành công
    200: { status: 'delivered', label: 'Giao thành công' },
    201: { status: 'delivered', label: 'Đã đối soát' },
    202: { status: 'completed', label: 'Đã thanh toán COD' },

    // Thất bại
    500: { status: 'shipping', label: 'Giao thất bại - đang chuyển hoàn' },
    501: { status: 'returned', label: 'Đã hoàn hàng' },
    502: { status: 'cancelled', label: 'Đã hủy' },

    // Default
    '-1': { status: 'shipping', label: 'Đang xử lý' }
};

/**
 * Login and get access token
 * Usually token from partner portal is long-lived, but this can refresh if needed
 */
export const loginViettelPost = async (username, password) => {
    try {
        const response = await axios.post(`${getBaseUrl()}/user/Login`, {
            USERNAME: username,
            PASSWORD: password
        });

        if (response.data.status === 200 && response.data.data) {
            return {
                success: true,
                token: response.data.data.token,
                userId: response.data.data.userId,
                expired: response.data.data.expired
            };
        }

        return {
            success: false,
            error: response.data.message || 'Đăng nhập thất bại'
        };
    } catch (error) {
        console.error('ViettelPost login error:', error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Lỗi kết nối đến Viettel Post'
        };
    }
};

/**
 * Create shipping order on Viettel Post
 */
export const createShippingOrder = async (order, senderInfo, token) => {
    try {
        const orderData = {
            ORDER_NUMBER: order.orderCode,
            GROUPADDRESS_ID: senderInfo.groupAddressId || 0,
            CUS_ID: senderInfo.customerId || 0,
            DELIVERY_DATE: new Date().toISOString().split('T')[0],

            // Sender info
            SENDER_FULLNAME: senderInfo.fullName,
            SENDER_ADDRESS: senderInfo.address,
            SENDER_PHONE: senderInfo.phone,
            SENDER_EMAIL: senderInfo.email || '',
            SENDER_WARD: senderInfo.wardId || 0,
            SENDER_DISTRICT: senderInfo.districtId || 0,
            SENDER_PROVINCE: senderInfo.provinceId || 0,

            // Receiver info
            RECEIVER_FULLNAME: order.customerName,
            RECEIVER_ADDRESS: order.shippingAddress,
            RECEIVER_PHONE: order.customerPhone,
            RECEIVER_EMAIL: order.customerEmail || '',

            // Product info
            PRODUCT_NAME: order.items.map(i => i.productName).join(', ').substring(0, 200),
            PRODUCT_DESCRIPTION: `Đơn hàng ${order.orderCode}`,
            PRODUCT_QUANTITY: order.items.reduce((sum, i) => sum + i.quantity, 0),
            PRODUCT_PRICE: order.total,
            PRODUCT_WEIGHT: 500, // Default 500g, can be calculated from products
            PRODUCT_LENGTH: 20,
            PRODUCT_WIDTH: 15,
            PRODUCT_HEIGHT: 10,
            PRODUCT_TYPE: 'HH', // Hàng hóa

            // Order type and payment
            ORDER_PAYMENT: order.paymentMethod === 'cod' ? 2 : 1, // 2 = COD, 1 = Đã thanh toán
            ORDER_SERVICE: 'VCN', // Chuyển phát nhanh
            ORDER_SERVICE_ADD: '', // Dịch vụ cộng thêm
            ORDER_VOUCHER: '',
            ORDER_NOTE: order.note || '',

            // Money
            MONEY_COLLECTION: order.paymentMethod === 'cod' ? order.total : 0,
            MONEY_TOTALFEE: 0, // Will be calculated by VTP
            MONEY_FEECOD: 0,
            MONEY_FEEVAS: 0,
            MONEY_FEEINSURRANCE: 0,
            MONEY_FEE: 0,
            MONEY_FEEOTHER: 0,
            MONEY_TOTALVAT: 0,
            MONEY_TOTAL: order.total
        };

        const response = await axios.post(
            `${getBaseUrl()}/order/createOrder`,
            orderData,
            {
                headers: {
                    'Token': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status === 200 && response.data.data) {
            return {
                success: true,
                trackingCode: response.data.data.ORDER_NUMBER,
                shippingOrderId: response.data.data.ORDER_NUMBER,
                shippingFee: response.data.data.MONEY_TOTAL_FEE || 0,
                estimatedDelivery: response.data.data.EXPECTED_DELIVERY,
                rawResponse: response.data.data
            };
        }

        return {
            success: false,
            error: response.data.message || 'Không thể tạo đơn vận chuyển'
        };
    } catch (error) {
        console.error('ViettelPost create order error:', error.message);
        console.error('ViettelPost error details:', error.response?.data);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Lỗi khi tạo đơn vận chuyển'
        };
    }
};

/**
 * Get order status from Viettel Post
 */
export const getOrderStatus = async (orderNumber, token) => {
    try {
        const response = await axios.post(
            `${getBaseUrl()}/order/getOrderByCodeAndPhone`,
            { ORDER_NUMBER: orderNumber },
            {
                headers: {
                    'Token': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status === 200 && response.data.data) {
            const data = response.data.data;
            const statusInfo = VTP_STATUS_MAP[data.ORDER_STATUS] || VTP_STATUS_MAP['-1'];

            return {
                success: true,
                orderNumber: data.ORDER_NUMBER,
                statusCode: data.ORDER_STATUS,
                status: statusInfo.status,
                statusLabel: statusInfo.label,
                rawResponse: data
            };
        }

        return {
            success: false,
            error: response.data.message || 'Không tìm thấy đơn hàng'
        };
    } catch (error) {
        console.error('ViettelPost get status error:', error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Lỗi khi tra cứu đơn hàng'
        };
    }
};

/**
 * Cancel shipping order
 */
export const cancelShippingOrder = async (orderNumber, token) => {
    try {
        const response = await axios.post(
            `${getBaseUrl()}/order/UpdateOrder`,
            {
                ORDER_NUMBER: orderNumber,
                TYPE: 4, // 4 = Cancel order
                NOTE: 'Hủy đơn từ hệ thống QLBH'
            },
            {
                headers: {
                    'Token': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status === 200) {
            return {
                success: true,
                message: 'Đã hủy đơn vận chuyển'
            };
        }

        return {
            success: false,
            error: response.data.message || 'Không thể hủy đơn'
        };
    } catch (error) {
        console.error('ViettelPost cancel order error:', error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Lỗi khi hủy đơn vận chuyển'
        };
    }
};

/**
 * Calculate shipping fee
 */
export const calculateShippingFee = async (params, token) => {
    try {
        const response = await axios.post(
            `${getBaseUrl()}/order/getPrice`,
            {
                PRODUCT_WEIGHT: params.weight || 500,
                PRODUCT_PRICE: params.productPrice || 0,
                MONEY_COLLECTION: params.codAmount || 0,
                ORDER_SERVICE_ADD: '',
                ORDER_SERVICE: 'VCN', // Chuyển phát nhanh
                SENDER_PROVINCE: params.senderProvinceId,
                SENDER_DISTRICT: params.senderDistrictId,
                RECEIVER_PROVINCE: params.receiverProvinceId,
                RECEIVER_DISTRICT: params.receiverDistrictId,
                PRODUCT_TYPE: 'HH',
                NATIONAL_TYPE: 1 // Nội địa
            },
            {
                headers: {
                    'Token': token,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.status === 200 && response.data.data) {
            return {
                success: true,
                fee: response.data.data.MONEY_TOTAL,
                feeDetails: response.data.data
            };
        }

        return {
            success: false,
            error: response.data.message || 'Không thể tính phí'
        };
    } catch (error) {
        console.error('ViettelPost calculate fee error:', error.message);
        return {
            success: false,
            error: error.response?.data?.message || 'Lỗi khi tính phí vận chuyển'
        };
    }
};

/**
 * Get list of provinces
 */
export const getProvinces = async () => {
    try {
        const response = await axios.get(`${getBaseUrl()}/categories/listProvince`);

        if (response.data.status === 200 && response.data.data) {
            return {
                success: true,
                provinces: response.data.data.map(p => ({
                    id: p.PROVINCE_ID,
                    name: p.PROVINCE_NAME,
                    code: p.PROVINCE_CODE
                }))
            };
        }

        return { success: false, provinces: [] };
    } catch (error) {
        console.error('ViettelPost get provinces error:', error.message);
        return { success: false, provinces: [], error: error.message };
    }
};

/**
 * Get list of districts by province
 */
export const getDistricts = async (provinceId) => {
    try {
        const response = await axios.get(
            `${getBaseUrl()}/categories/listDistrict?provinceId=${provinceId}`
        );

        if (response.data.status === 200 && response.data.data) {
            return {
                success: true,
                districts: response.data.data.map(d => ({
                    id: d.DISTRICT_ID,
                    name: d.DISTRICT_NAME,
                    provinceId: d.PROVINCE_ID
                }))
            };
        }

        return { success: false, districts: [] };
    } catch (error) {
        console.error('ViettelPost get districts error:', error.message);
        return { success: false, districts: [], error: error.message };
    }
};

/**
 * Get list of wards by district
 */
export const getWards = async (districtId) => {
    try {
        const response = await axios.get(
            `${getBaseUrl()}/categories/listWards?districtId=${districtId}`
        );

        if (response.data.status === 200 && response.data.data) {
            return {
                success: true,
                wards: response.data.data.map(w => ({
                    id: w.WARDS_ID,
                    name: w.WARDS_NAME,
                    districtId: w.DISTRICT_ID
                }))
            };
        }

        return { success: false, wards: [] };
    } catch (error) {
        console.error('ViettelPost get wards error:', error.message);
        return { success: false, wards: [], error: error.message };
    }
};

export default {
    loginViettelPost,
    createShippingOrder,
    getOrderStatus,
    cancelShippingOrder,
    calculateShippingFee,
    getProvinces,
    getDistricts,
    getWards,
    VTP_STATUS_MAP
};
