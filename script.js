// Переменные выбора
let selectedDateType = "";

// Функция переключения экранов
function showScreen(screenId) {
    document.querySelectorAll('.step-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// ЭКРАН 1 -> ЭКРАН 2
document.getElementById('btn-next-intro').addEventListener('click', function() {
    const title = document.getElementById('intro-text');
    if (title.textContent === "У меня к тебе один важный вопрос…") {
        title.textContent = "Готова услышать? ✨";
        this.textContent = "Да!";
    } else {
        showScreen('screen-question');
    }
});

// ЭКРАН 2 -> ЭКРАН 3
document.getElementById('btn-go-choose').addEventListener('click', () => showScreen('screen-choose'));

// Пасхалка "Не нажимать"
document.getElementById('btn-easter').addEventListener('click', function() {
    document.getElementById('easter-message').classList.add('active');
    this.style.display = 'none';
});
document.getElementById('btn-easter-agree').addEventListener('click', () => showScreen('screen-choose'));

// Выбор карточек кликом
const options = document.querySelectorAll(".option");
options.forEach(option => {
    option.addEventListener("click", function() {
        options.forEach(item => item.classList.remove("selected"));
        option.classList.add("selected");
        selectedDateType = option.dataset.value;
    });
});

// Кнопка рандома "Выбрать за нас"
document.getElementById('btn-random').addEventListener('click', function() {
    let counter = 0;
    const interval = setInterval(() => {
        options.forEach(opt => opt.classList.remove('selected'));
        const randomOpt = options[Math.floor(Math.random() * options.length)];
        randomOpt.classList.add('selected');
        counter++;
        if (counter > 6) {
            clearInterval(interval);
            selectedDateType = randomOpt.dataset.value;
        }
    }, 150);
});

// ЭКРАН 3 -> ЭКРАН 4 (Проверка данных и заполнение плана)
document.getElementById('btn-submit-choice').addEventListener('click', function() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (!selectedDateType) { alert("Выбери формат свидания или нажми на рандом! 🎲"); return; }
    if (!date) { alert("Выбери дату ❤️"); return; }
    if (!time) { alert("Выбери время ❤️"); return; }

    // Заполняем инфо в таймлайне и билете
    document.getElementById('plan-start-time').textContent = time;
    
    if (selectedDateType === "Вечер-сюрприз") {
        document.getElementById('plan-activity').textContent = `Секретное развлечение (Сюрприз!) 🎁`;
    } else {
        document.getElementById('plan-activity').textContent = `Идём на: ${selectedDateType} 🤩`;
    }
    
    showScreen('screen-plan');
});

// ЭКРАН 4 -> ЭКРАН 5
document.getElementById('btn-go-final').addEventListener('click', () => showScreen('screen-final'));

// Убегающая кнопка "Надо подумать" (для телефонов и ПК)
const btnNo = document.getElementById('btn-no');
function moveButton() {
    const container = document.querySelector('.final-buttons');
    const maxX = container.clientWidth - btnNo.clientWidth;
    const maxY = 100; // ограничим высоту прыжка
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor((Math.random() - 0.5) * maxY);
    
    btnNo.style.position = 'relative';
    btnNo.style.left = `${randomX - (container.clientWidth / 4)}px`;
    btnNo.style.top = `${randomY}px`;
}
btnNo.addEventListener('mouseenter', moveButton);
btnNo.addEventListener('touchstart', (e) => { e.preventDefault(); moveButton(); });

// КНОПКА "ДА" -> Финал, анимация билета и отправка письма
document.getElementById('btn-yes').addEventListener('click', function() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const wish = document.getElementById("wish").value;

    const dateObject = new Date(date);
    const formattedDate = dateObject.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

    // Заполняем сам билет
    document.getElementById("ticketActivity").textContent = selectedDateType;
    document.getElementById("ticketDate").textContent = formattedDate;
    document.getElementById("ticketTime").textContent = time;

    // Включаем билет на экране
    document.getElementById("ticketOverlay").classList.add("active");

    // Отправляем на наш сервер
    fetch("http://localhost:3000/send-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            date: formattedDate,
            time: time,
            place: selectedDateType === "Вечер-сюрприз" ? "Секретное место 👀" : "Определено типом свидания",
            activity: selectedDateType,
            food: "Включено в план",
            wish: wish.trim() === "" 
                ? (selectedDateType === "Вечер-сюрприз" ? "Выбрала сюрприз, так что устраивай всё сам! 😉" : "Без дополнительных пожеланий") 
                : wish
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) console.log("Заявка успешно улетела на бэкенд! 🏆");
    })
    .catch(err => console.error("Ошибка отправки писем:", err));
});

// Закрытие билета
document.getElementById("closeTicket").addEventListener("click", () => document.getElementById("ticketOverlay").classList.remove("active"));
document.getElementById("ticketOverlay").addEventListener("click", function(e) { if (e.target === this) this.classList.remove("active"); });
