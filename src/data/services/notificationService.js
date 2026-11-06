class NotificationService {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify({ title, message, type = 'info', duration = 3500 }) {
    const notification = {
      id: Date.now() + Math.random().toString(36).slice(2, 6),
      title,
      message,
      type, // 'success' | 'error' | 'warning' | 'info'
      duration
    };

    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (e) {
        console.error(e);
      }
    });

    // Also trigger Web Notification API if permitted and supported
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico'
        });
      } catch {
        // Ignore if notification fails
      }
    }
  }

  success(message, title = 'Berhasil') {
    this.notify({ title, message, type: 'success' });
  }

  error(message, title = 'Terjadi Kesalahan') {
    this.notify({ title, message, type: 'error' });
  }

  warning(message, title = 'Perhatian') {
    this.notify({ title, message, type: 'warning' });
  }

  info(message, title = 'Informasi') {
    this.notify({ title, message, type: 'info' });
  }
}

export const notificationService = new NotificationService();
