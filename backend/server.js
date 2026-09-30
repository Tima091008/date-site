// Подключаем Express для создания сервера
const express = require("express");

// Подключаем CORS для запросов с GitHub Pages
const cors = require("cors");

// Подключаем Resend для отправки писем
const { Resend } = require("resend");

// Загружаем переменные окружения
require("dotenv").config();


// ==============================
// СОЗДАЁМ СЕРВЕР
// ==============================

// Создаём Express-приложение
const app = express();

// Разрешаем запросы с других сайтов
app.use(cors());

// Разрешаем принимать JSON
app.use(express.json());


// ==============================
// RESEND
// ==============================

// Создаём Resend с API-ключом из Render
const resend = new Resend(process.env.RESEND_API_KEY);


// ==============================
// ПРОВЕРКА РАБОТЫ СЕРВЕРА
// ==============================

// Когда открываем главную страницу backend
app.get("/", (req, res) => {

    // Отправляем сообщение
    res.send("Date Site Backend работает ❤️");
});


// ==============================
// ОТПРАВКА ЗАЯВКИ
// ==============================

// Получаем заявку от сайта
app.post("/send-ticket", async (req, res) => {

    // Получаем данные из запроса
    const {
        date,
        time,
        place,
        activity,
        food,
        wish
    } = req.body;


    // Проверяем, что основные данные существуют
    if (!date || !time || !activity) {

        // Возвращаем ошибку
        return res.status(400).json({
            success: false,
            message: "Не хватает данных заявки"
        });
    }


    // Создаём текст письма
    const mailText = `
❤️ НОВАЯ ЗАЯВКА НА ПРОГУЛКУ ❤️

📅 Дата: ${date}

🕐 Время: ${time}

📍 Место: ${place || "Не указано"}

🎀 Что делать: ${activity}

🍕 Поесть: ${food || "Не указано"}

💌 Пожелание:
${wish || "Без пожеланий"}
`;


    try {

        // Отправляем письмо через Resend
        const result = await resend.emails.send({

            // Адрес отправителя
            from: process.env.EMAIL_FROM,

            // Адрес получателя
            to: process.env.EMAIL_TO,

            // Тема письма
            subject: "❤️ Новая заявка на прогулку",

            // Текст письма
            text: mailText
        });


        // Если Resend вернул ошибку
        if (result.error) {

            // Показываем ошибку в Render Logs
            console.error("Ошибка Resend:", result.error);

            // Отправляем ошибку сайту
            return res.status(500).json({
                success: false,
                message: "Resend не смог отправить письмо"
            });
        }


        // Показываем ID письма в Render Logs
        console.log("Письмо успешно отправлено:", result.data);


        // Отправляем успешный ответ сайту
        res.json({
            success: true,
            message: "Письмо успешно отправлено"
        });


    } catch (error) {

        // Показываем ошибку в Render Logs
        console.error("Ошибка отправки:", error);

        // Отправляем ошибку сайту
        res.status(500).json({
            success: false,
            message: "Ошибка при отправке письма"
        });
    }
});


// ==============================
// ЗАПУСК СЕРВЕРА
// ==============================

// Render передаёт свой порт через переменную PORT
const PORT = process.env.PORT || 3000;

// Запускаем сервер
app.listen(PORT, "0.0.0.0", () => {

    // Показываем информацию в Render Logs
    console.log(`Сервер запущен на порту ${PORT}`);
});

