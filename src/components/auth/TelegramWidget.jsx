import React, { useEffect, useRef } from 'react';

const TelegramWidget = ({ botName, onAuth }) => {
  const containerRef = useRef(null);
  const onAuthRef = useRef(onAuth);

  // onAuth o'zgarganda faqat ref ni yangilaymiz (qayta render bo'lmasligi uchun)
  useEffect(() => {
    onAuthRef.current = onAuth;
  }, [onAuth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Barcha eski narsalarni tozalaymiz (React StrictMode va re-renderlar uchun)
    container.innerHTML = '';

    window.onTelegramAuth = (user) => {
      if (onAuthRef.current) {
        onAuthRef.current(user);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
      delete window.onTelegramAuth;
    };
  }, [botName]); // Faqat botName o'zgarganda script qayta yaratiladi

  return <div ref={containerRef} className="flex justify-center my-4 min-h-[50px]" />;
};

export default TelegramWidget;
