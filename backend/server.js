// Подключаем Express для создания сервера
const express = require("express");

// Подключаем Nodemailer для отправки писем
const nodemailer = require("nodemailer");

// Подключаем dotenv для чтения файла .env
require("dotenv").config();

// Подключаем CORS
const cors = require("cors");

// Создаём приложение Express
const app = express();

// Разрешаем запросы от сайта
app.use(cors());

// Позволяем серверу принимать JSON
app.use(express.json());


// ==============================
// НАСТРОЙКА GMAIL
// ==============================

// Создаём подключение к Gmail
const transporter = nodemailer.createTransport({

    // Используем настройки Gmail
    service: "gmail",

    // Данные берём из .env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});


// ==============================
// ПОЛУЧЕНИЕ ЗАЯВКИ
// ==============================

app.post("/send-ticket", async (req, res) => {

    // Получаем данные от сайта
    const {
        date,
        time,
        place,
        activity,
        food,
        wish
    } = req.body;


    // Создаём содержимое письма
    const mailText = `

❤️ НОВАЯ ЗАЯВКА НА ПРОГУЛКУ ❤️

📅 Дата: ${date}

🕐 Время: ${time}

📍 Место: ${place}

🎀 Что делать: ${activity}

🍕 Поесть: ${food}

💌 Пожелание:
${wish || "Без пожеланий"}

    `;


    try {

        // Отправляем письмо
        await transporter.sendMail({

            // От кого
            from: process.env.EMAIL_USER,

            // Кому
            to: process.env.EMAIL_TO,

            // Тема письма
            subject: "❤️ Новая заявка на прогулку",

            // Текст письма
            text: mailText

        });


        // Сообщаем сайту, что всё прошло успешно
        res.json({
            success: true
        });


    } catch (error) {

        // Показываем ошибку в терминале
        console.error(error);


        // Сообщаем сайту об ошибке
        res.status(500).json({
            success: false,
            message: "Не удалось отправить письмо"
        });

    }

});


// ==============================
// ЗАПУСК СЕРВЕРА
// ==============================

const PORT = 3000;


app.listen(PORT, () => {

    console.log(
        `Сервер запущен: http://localhost:${PORT}`
    );

});