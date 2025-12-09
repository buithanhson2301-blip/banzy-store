// Error handler middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({ message: `${field} đã tồn tại` });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    // Default error
    res.status(err.status || 500).json({
        message: err.message || 'Đã xảy ra lỗi server'
    });
};

// Not found handler
export const notFound = (req, res) => {
    res.status(404).json({ message: 'API endpoint không tồn tại' });
};
