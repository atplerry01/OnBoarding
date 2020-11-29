import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';

export default ({ title, message, type }) => {
  store.addNotification({
    title: title || 'Notification',
    message: message || 'You just prompted me without a message.',
    type: type || 'warning', // 'default', 'success', 'info', 'warning'
    container: 'bottom-left', // where to position the notifications
    animationIn: ["animated", "fadeIn"], // animate.css classes that's applied
    animationOut: ["animated", "fadeOut"], // animate.css classes that's applied
    dismiss: {
      duration: 5000,
      showIcon: true
    }
  });
};
