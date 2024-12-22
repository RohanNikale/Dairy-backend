const Notification = require('../models/notificationModel');


exports.getNotifications = async (req, res) => {
  console.log('User object:', req.user); // Debugging
  const userId = req.user?._id;

  if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
      const notifications = await Notification.find({ user: userId })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('fromUser', 'name username');

      const totalNotifications = await Notification.countDocuments({ user: userId });
      const hasMore = totalNotifications > page * limit;

      res.status(200).json({
          notifications,
          currentPage: page,
          totalPages: Math.ceil(totalNotifications / limit),
          hasMore,
      });
  } catch (error) {
      console.error(error); // Debugging
      res.status(500).json({ message: 'Internal server error', error });
  }
};

exports.markAsRead = async (req, res) => {
  const notificationId = req.params.id;

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};
