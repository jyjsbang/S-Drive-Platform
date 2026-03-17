import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

import { OhVueIcon, addIcons } from 'oh-vue-icons';
// ... 기존 아이콘 import ...
import {
    BiGrid,
    BiDisplay,
    BiBarChart,
    BiInfoCircle,
    BiSearch,
    BiMap,
    BiBoxArrowRight,
    BiList,
    BiPeople,
    BiCursor,
    BiActivity,
    BiExclamationTriangle,
    BiGraphUp,
    BiShieldCheck,
    BiAward,
    BiCalendarEvent,
    BiFileEarmarkText,
    BiXLg,
    BiArrowsFullscreen,
    BiGear,
} from 'oh-vue-icons/icons/bi';

// (★추가★) Toast 라이브러리 및 CSS 불러오기
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

addIcons(
    BiGrid,
    BiDisplay,
    BiBarChart,
    BiInfoCircle,
    BiSearch,
    BiMap,
    BiBoxArrowRight,
    BiList,
    BiPeople,
    BiCursor,
    BiActivity,
    BiExclamationTriangle,
    BiGraphUp,
    BiShieldCheck,
    BiAward,
    BiCalendarEvent,
    BiFileEarmarkText,
    BiXLg,
    BiArrowsFullscreen,
    BiGear
);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// (★추가★) Toast 플러그인 사용 설정
const toastOptions = {
    // 옵션 설정 (필요시 커스텀 가능)
    position: 'top-right',
    timeout: 5000, // 5초 후 자동 사라짐
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
};
app.use(Toast, toastOptions);

app.component('v-icon', OhVueIcon);

app.mount('#app');
